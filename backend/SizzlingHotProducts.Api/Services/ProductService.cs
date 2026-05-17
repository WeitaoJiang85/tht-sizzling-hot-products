using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SizzlingHotProducts.Api.Configuration;
using SizzlingHotProducts.Api.DTOs;
using SizzlingHotProducts.Api.Models;
using SizzlingHotProducts.Api.Repositories;
using SizzlingHotProducts.Api.Services.Policies;

namespace SizzlingHotProducts.Api.Services
{
    /// <summary>
    /// Core business service for computing top-selling products.
    /// </summary>
    public class ProductService : IProductService
    {
        private readonly IProductRepository _repository;
        private readonly ILogger<ProductService> _logger;
        private readonly SalesAggregationOptions _aggregationOptions;
        private readonly ISalesAggregationPolicyFactory _policyFactory;

        private readonly string _brandingBaseUrl = "/branding/";

        public ProductService(IProductRepository repository, ILogger<ProductService> logger)
            : this(
                repository,
                logger,
                Options.Create(new SalesAggregationOptions()),
                new SalesAggregationPolicyFactory())
        {
        }

        public ProductService(
            IProductRepository repository,
            ILogger<ProductService> logger,
            IOptions<SalesAggregationOptions> aggregationOptions,
            ISalesAggregationPolicyFactory policyFactory)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _aggregationOptions = aggregationOptions?.Value ?? new SalesAggregationOptions();
            _policyFactory = policyFactory ?? throw new ArgumentNullException(nameof(policyFactory));
        }

        private ISalesAggregationPolicy ResolvePolicy() => _policyFactory.Create(_aggregationOptions);

        /// <summary>
        /// Gets the top product for a specific date.
        /// Rule: aggregate net sales from active completed orders and break ties by product name.
        /// </summary>
        private string GetImageUrlForProduct(Product product)
        {
            static string EncodePath(string path)
            {
                var hasLeadingSlash = path.StartsWith('/');
                var encoded = string.Join(
                    "/",
                    path.Split('/', StringSplitOptions.RemoveEmptyEntries)
                        .Select(Uri.EscapeDataString));

                return hasLeadingSlash ? $"/{encoded}" : encoded;
            }

            if (!string.IsNullOrWhiteSpace(product.ImageUrl))
            {
                return EncodePath(product.ImageUrl!);
            }

            return EncodePath($"{_brandingBaseUrl}{product.Name}.jpg");
        }

        public async Task<DailyTopProductDto?> GetTopProductByDateAsync(DateTime date)
        {
            try
            {
                _logger.LogInformation("Fetching top product for date {Date}", date.ToString("yyyy-MM-dd"));

                var orders = await _repository.GetAllOrdersAsync();
                var products = await _repository.GetAllProductsAsync();

                if (!orders.Any() || !products.Any())
                {
                    _logger.LogWarning("No order or product data found");
                    return null;
                }

                var productDict = products.ToDictionary(p => p.Id);
                var targetDate = date.Date;

                var completedOrders = GetActiveCompletedOrders(orders)
                    .Where(o => o.Date.Date == targetDate)
                    .ToList();

                if (!completedOrders.Any())
                {
                    var latestDate = GetLatestCompletedOrderDate(orders);
                    if (!latestDate.HasValue)
                    {
                        _logger.LogInformation("No active completed orders for date {Date}, and no fallback date is available", targetDate.ToString("yyyy-MM-dd"));
                        return null;
                    }

                    targetDate = latestDate.Value;
                    completedOrders = GetActiveCompletedOrders(orders)
                        .Where(o => o.Date.Date == targetDate)
                        .ToList();
                }

                var retailSales = ResolvePolicy()
                    .Aggregate(
                        completedOrders,
                        productDict,
                        targetDate,
                        targetDate,
                        _aggregationOptions.AccumulateSameCustomer)
                    .ToList();

                if (!retailSales.Any())
                {
                    _logger.LogWarning("No sales data after filtering active completed orders");
                    return null;
                }

                var topProduct = retailSales
                    .FirstOrDefault();

                if (topProduct is null || string.IsNullOrWhiteSpace(topProduct.ProductId))
                {
                    return null;
                }

                return new DailyTopProductDto
                {
                    Date = targetDate,
                    ProductId = topProduct.ProductId,
                    ProductName = topProduct.ProductName,
                    QuantitySold = topProduct.QuantitySold,
                    ImageUrl = GetImageUrlForProduct(productDict[topProduct.ProductId])
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to fetch top product by date");
                throw;
            }
        }

        /// <summary>
        /// Gets the top product within a date range.
        /// </summary>
        public async Task<DailyTopProductDto?> GetTopProductByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            try
            {
                _logger.LogInformation("Fetching top product for date range {StartDate} - {EndDate}",
                    startDate.ToString("yyyy-MM-dd"), endDate.ToString("yyyy-MM-dd"));

                if (startDate > endDate)
                {
                    throw new ArgumentException("Start date cannot be later than end date");
                }

                var orders = await _repository.GetAllOrdersAsync();
                var products = await _repository.GetAllProductsAsync();

                if (!orders.Any() || !products.Any())
                {
                    return null;
                }

                var productDict = products.ToDictionary(p => p.Id);
                var startDateNormalized = startDate.Date;
                var endDateNormalized = endDate.Date;

                var completedOrders = GetActiveCompletedOrders(orders)
                    .Where(o => o.Date.Date >= startDateNormalized && o.Date.Date <= endDateNormalized)
                    .ToList();

                if (!completedOrders.Any())
                {
                    _logger.LogInformation("No active completed orders found in the date range");
                    return null;
                }

                var retailSales = ResolvePolicy()
                    .Aggregate(
                        completedOrders,
                        productDict,
                        startDateNormalized,
                        endDateNormalized,
                        _aggregationOptions.AccumulateSameCustomer)
                    .ToList();

                if (!retailSales.Any())
                {
                    return null;
                }

                var topProduct = retailSales
                    .FirstOrDefault();

                if (topProduct is null || string.IsNullOrWhiteSpace(topProduct.ProductId))
                {
                    return null;
                }

                return new DailyTopProductDto
                {
                    Date = startDateNormalized,
                    ProductId = topProduct.ProductId,
                    ProductName = topProduct.ProductName,
                    QuantitySold = topProduct.QuantitySold,
                    ImageUrl = GetImageUrlForProduct(productDict[topProduct.ProductId])
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to fetch top product by date range");
                throw;
            }
        }


        /// <summary>
        /// Retail view: total sold quantity accumulated by quantity with cancelled orders netted out.
        /// </summary>
        public async Task<IEnumerable<ProductSalesDto>> GetRetailProductSalesAsync(DateTime startDate, DateTime endDate)
        {
            try
            {
                if (startDate > endDate)
                {
                    throw new ArgumentException("Start date cannot be later than end date");
                }

                var orders = await _repository.GetAllOrdersAsync();
                var products = await _repository.GetAllProductsAsync();

                if (!orders.Any() || !products.Any())
                {
                    return Enumerable.Empty<ProductSalesDto>();
                }

                var productDict = products.ToDictionary(p => p.Id);
                var startDateNormalized = startDate.Date;
                var endDateNormalized = endDate.Date;

                var activeCompletedOrders = GetActiveCompletedOrders(orders)
                    .Where(o => o.Date.Date >= startDateNormalized && o.Date.Date <= endDateNormalized)
                    .ToList();

                return ResolvePolicy()
                    .Aggregate(
                        activeCompletedOrders,
                        productDict,
                        startDateNormalized,
                        endDateNormalized,
                        _aggregationOptions.AccumulateSameCustomer)
                    .Select(x => new ProductSalesDto
                    {
                        ProductId = x.ProductId,
                        ProductName = x.ProductName,
                        QuantitySold = x.QuantitySold,
                        ImageUrl = GetImageUrlForProduct(productDict[x.ProductId])
                    })
                    .ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to fetch retail sales ranking");
                throw;
            }
        }

        private static IEnumerable<Order> GetActiveCompletedOrders(IEnumerable<Order> orders)
        {
            var cancelledIds = orders
                .Where(o => o.Status == OrderStatus.Cancelled)
                .Select(o => o.Id)
                .ToHashSet(StringComparer.OrdinalIgnoreCase);

            return orders.Where(o => o.Status == OrderStatus.Completed && !cancelledIds.Contains(o.Id));
        }

        public async Task<DailyTopProductDto?> GetTopProductForLatestWindowAsync(int windowDays)
        {
            if (windowDays <= 0)
            {
                throw new ArgumentException("windowDays must be greater than zero.");
            }

            var range = await GetDataDateRangeAsync();
            if (!range.HasValue)
            {
                return null;
            }

            var end = range.Value.MaxDate.Date;
            var start = end.AddDays(-(windowDays - 1));

            return await GetTopProductByDateRangeAsync(start, end);
        }

        public async Task<(DateTime MinDate, DateTime MaxDate)?> GetDataDateRangeAsync()
        {
            var orders = await _repository.GetAllOrdersAsync();
            var activeCompleted = GetActiveCompletedOrders(orders).ToList();
            if (!activeCompleted.Any())
            {
                return null;
            }

            var minDate = activeCompleted.Min(o => o.Date.Date);
            var maxDate = activeCompleted.Max(o => o.Date.Date);
            return (minDate, maxDate);
        }

        private static DateTime? GetLatestCompletedOrderDate(IEnumerable<Order> orders)
        {
            var activeCompleted = GetActiveCompletedOrders(orders).ToList();
            if (!activeCompleted.Any())
            {
                return null;
            }

            return activeCompleted.Max(o => o.Date.Date);
        }
    }
}
