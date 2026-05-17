param(
    [Parameter(Mandatory = $true)]
    [string]$SubscriptionId,

    [Parameter(Mandatory = $false)]
    [string]$ResourceGroup = "rg-tht-sizzling-hot-products",

    [Parameter(Mandatory = $false)]
    [string]$Location = "australiaeast",

    [Parameter(Mandatory = $false)]
    [string]$AcrName = "acrthtsizzlinghotprod",

    [Parameter(Mandatory = $false)]
    [string]$ContainerAppsEnvName = "cae-tht-sizzling-hot-products",

    [Parameter(Mandatory = $false)]
    [string]$BackendAppName = "ca-backend-tht-sizzling-hot-products",

    [Parameter(Mandatory = $false)]
    [string]$FrontendAppName = "ca-frontend-tht-sizzling-hot-products",

    [Parameter(Mandatory = $false)]
    [string]$BackendImage = "mcr.microsoft.com/azuredocs/containerapps-helloworld:latest",

    [Parameter(Mandatory = $false)]
    [string]$FrontendImage = "mcr.microsoft.com/azuredocs/containerapps-helloworld:latest"
)

$ErrorActionPreference = "Stop"

Write-Host "Setting Azure subscription..."
az account set --subscription $SubscriptionId

Write-Host "Ensuring required Azure CLI extensions are installed..."
az extension add --name containerapp --upgrade --yes | Out-Null

Write-Host "Creating or updating resource group..."
az group create --name $ResourceGroup --location $Location | Out-Null

Write-Host "Creating or validating Azure Container Registry..."
az acr create `
    --name $AcrName `
    --resource-group $ResourceGroup `
    --location $Location `
    --sku Basic `
    --admin-enabled true | Out-Null

$acrLoginServer = az acr show --name $AcrName --resource-group $ResourceGroup --query loginServer --output tsv
$acrUsername = az acr credential show --name $AcrName --resource-group $ResourceGroup --query username --output tsv
$acrPassword = az acr credential show --name $AcrName --resource-group $ResourceGroup --query "passwords[0].value" --output tsv

Write-Host "Creating or validating Container Apps environment..."
az containerapp env create `
    --name $ContainerAppsEnvName `
    --resource-group $ResourceGroup `
    --location $Location | Out-Null

Write-Host "Creating backend Container App with external ingress..."
az containerapp create `
    --name $BackendAppName `
    --resource-group $ResourceGroup `
    --environment $ContainerAppsEnvName `
    --image $BackendImage `
    --target-port 8080 `
    --ingress external `
    --registry-server $acrLoginServer `
    --registry-username $acrUsername `
    --registry-password $acrPassword `
    --cpu 0.25 `
    --memory 0.5Gi `
    --min-replicas 0 `
    --max-replicas 1 | Out-Null

$backendFqdn = az containerapp show `
    --name $BackendAppName `
    --resource-group $ResourceGroup `
    --query properties.configuration.ingress.fqdn `
    --output tsv

$backendApiBaseUrl = "https://$backendFqdn"

Write-Host "Creating frontend Container App with external ingress..."
az containerapp create `
    --name $FrontendAppName `
    --resource-group $ResourceGroup `
    --environment $ContainerAppsEnvName `
    --image $FrontendImage `
    --target-port 3000 `
    --ingress external `
    --registry-server $acrLoginServer `
    --registry-username $acrUsername `
    --registry-password $acrPassword `
    --env-vars NEXT_PUBLIC_API_BASE_URL=$backendApiBaseUrl NEXT_PUBLIC_API_TIMEOUT=30000 `
    --cpu 0.25 `
    --memory 0.5Gi `
    --min-replicas 0 `
    --max-replicas 1 | Out-Null

$frontendFqdn = az containerapp show `
    --name $FrontendAppName `
    --resource-group $ResourceGroup `
    --query properties.configuration.ingress.fqdn `
    --output tsv

Write-Host "Bootstrap completed successfully."
Write-Host ""
Write-Host "Resource Group:          $ResourceGroup"
Write-Host "ACR Name:                $AcrName"
Write-Host "ACR Login Server:        $acrLoginServer"
Write-Host "Container Apps Env:      $ContainerAppsEnvName"
Write-Host "Backend App:             $BackendAppName"
Write-Host "Backend URL:             https://$backendFqdn"
Write-Host "Frontend App:            $FrontendAppName"
Write-Host "Frontend URL:            https://$frontendFqdn"
Write-Host ""
Write-Host "Configure these GitHub repository secrets:"
Write-Host "  AZURE_CREDENTIALS"
Write-Host "  ACR_NAME = $AcrName"
Write-Host "  AZURE_RESOURCE_GROUP = $ResourceGroup"
Write-Host "  ACA_BACKEND_APP_NAME = $BackendAppName"
Write-Host "  ACA_FRONTEND_APP_NAME = $FrontendAppName"
Write-Host ""
Write-Host "Configure these GitHub repository variables:"
Write-Host "  NEXT_PUBLIC_API_BASE_URL = https://$backendFqdn"
Write-Host "  NEXT_PUBLIC_API_TIMEOUT = 30000"
