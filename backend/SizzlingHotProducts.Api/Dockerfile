# syntax=docker/dockerfile:1

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY backend/SizzlingHotProducts.Api/SizzlingHotProducts.Api.csproj backend/SizzlingHotProducts.Api/
RUN dotnet restore backend/SizzlingHotProducts.Api/SizzlingHotProducts.Api.csproj

COPY backend/SizzlingHotProducts.Api/ backend/SizzlingHotProducts.Api/
RUN dotnet publish backend/SizzlingHotProducts.Api/SizzlingHotProducts.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

# Ensure runtime data/static assets exist in the container even if publish does not include them.
COPY backend/SizzlingHotProducts.Api/inputs ./inputs
COPY backend/SizzlingHotProducts.Api/wwwroot ./wwwroot

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "SizzlingHotProducts.Api.dll"]
