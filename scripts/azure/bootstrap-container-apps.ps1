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
    [string]$ContainerAppsEnvName = "cae-tht-hot",

    [Parameter(Mandatory = $false)]
    [string]$BackendAppName = "ca-backend-tht-hot",

    [Parameter(Mandatory = $false)]
    [string]$FrontendAppName = "ca-frontend-tht-hot",

    [Parameter(Mandatory = $false)]
    [string]$BackendImage = "mcr.microsoft.com/azuredocs/containerapps-helloworld:latest",

    [Parameter(Mandatory = $false)]
    [string]$FrontendImage = "mcr.microsoft.com/azuredocs/containerapps-helloworld:latest",

    [Parameter(Mandatory = $false)]
    [string]$LogAnalyticsWorkspaceName = "law-tht-hot"
)

$ErrorActionPreference = "Stop"

function Assert-LastExitCode {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Step
    )

    if ($LASTEXITCODE -ne 0) {
        throw "Step failed: $Step"
    }
}

function Assert-ContainerAppName {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name,

        [Parameter(Mandatory = $true)]
        [string]$ParameterName
    )

    $pattern = '^[a-z][a-z0-9-]{0,30}[a-z0-9]$'

    if (-not ($Name -match $pattern)) {
        throw "$ParameterName ('$Name') is invalid. It must be 2-32 chars, start with a letter, end with alphanumeric, and only include lowercase letters, numbers, and '-' without consecutive '-' characters."
    }

    if ($Name.Contains("--")) {
        throw "$ParameterName ('$Name') is invalid. It cannot contain consecutive hyphens ('--')."
    }
}

Assert-ContainerAppName -Name $BackendAppName -ParameterName "BackendAppName"
Assert-ContainerAppName -Name $FrontendAppName -ParameterName "FrontendAppName"

Write-Host "Setting Azure subscription..."
az account set --subscription $SubscriptionId
Assert-LastExitCode -Step "Set Azure subscription"

Write-Host "Ensuring required Azure CLI extensions are installed..."
az extension add --name containerapp --upgrade --yes | Out-Null
Assert-LastExitCode -Step "Install or upgrade Azure containerapp extension"

Write-Host "Registering required resource providers..."
az provider register -n Microsoft.ContainerRegistry --wait | Out-Null
Assert-LastExitCode -Step "Register Microsoft.ContainerRegistry"
az provider register -n Microsoft.App --wait | Out-Null
Assert-LastExitCode -Step "Register Microsoft.App"
az provider register -n Microsoft.OperationalInsights --wait | Out-Null
Assert-LastExitCode -Step "Register Microsoft.OperationalInsights"

Write-Host "Creating or updating resource group..."
az group create --name $ResourceGroup --location $Location | Out-Null
Assert-LastExitCode -Step "Create or update resource group"

Write-Host "Creating or validating Azure Container Registry..."
az acr create `
    --name $AcrName `
    --resource-group $ResourceGroup `
    --location $Location `
    --sku Basic `
    --admin-enabled true | Out-Null
Assert-LastExitCode -Step "Create or validate Azure Container Registry"

$acrLoginServer = az acr show --name $AcrName --resource-group $ResourceGroup --query loginServer --output tsv
Assert-LastExitCode -Step "Get ACR login server"
$acrUsername = az acr credential show --name $AcrName --resource-group $ResourceGroup --query username --output tsv
Assert-LastExitCode -Step "Get ACR username"
$acrPassword = az acr credential show --name $AcrName --resource-group $ResourceGroup --query "passwords[0].value" --output tsv
Assert-LastExitCode -Step "Get ACR password"

Write-Host "Creating or validating Log Analytics Workspace..."
$existingWorkspace = az monitor log-analytics workspace show `
    --workspace-name $LogAnalyticsWorkspaceName `
    --resource-group $ResourceGroup `
    --query customerId --output tsv 2>$null
if ([string]::IsNullOrWhiteSpace($existingWorkspace)) {
    az monitor log-analytics workspace create `
        --workspace-name $LogAnalyticsWorkspaceName `
        --resource-group $ResourceGroup `
        --location $Location | Out-Null
    Assert-LastExitCode -Step "Create Log Analytics Workspace"
}
$lawCustomerId = az monitor log-analytics workspace show `
    --workspace-name $LogAnalyticsWorkspaceName `
    --resource-group $ResourceGroup `
    --query customerId --output tsv
Assert-LastExitCode -Step "Get Log Analytics Workspace customer ID"
$lawSharedKey = az monitor log-analytics workspace get-shared-keys `
    --workspace-name $LogAnalyticsWorkspaceName `
    --resource-group $ResourceGroup `
    --query primarySharedKey --output tsv
Assert-LastExitCode -Step "Get Log Analytics Workspace shared key"

Write-Host "Creating or validating Container Apps environment..."
$existingEnv = az containerapp env show `
    --name $ContainerAppsEnvName `
    --resource-group $ResourceGroup `
    --query id --output tsv 2>$null
if ([string]::IsNullOrWhiteSpace($existingEnv)) {
    az containerapp env create `
        --name $ContainerAppsEnvName `
        --resource-group $ResourceGroup `
        --location $Location `
        --logs-destination log-analytics `
        --logs-workspace-id $lawCustomerId `
        --logs-workspace-key $lawSharedKey | Out-Null
    Assert-LastExitCode -Step "Create Container Apps environment"
}
else {
    az containerapp env update `
        --name $ContainerAppsEnvName `
        --resource-group $ResourceGroup `
        --logs-destination log-analytics `
        --logs-workspace-id $lawCustomerId `
        --logs-workspace-key $lawSharedKey | Out-Null
    Assert-LastExitCode -Step "Update Container Apps environment"
}

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
Assert-LastExitCode -Step "Create backend Container App"

$backendFqdn = az containerapp show `
    --name $BackendAppName `
    --resource-group $ResourceGroup `
    --query properties.configuration.ingress.fqdn `
    --output tsv
Assert-LastExitCode -Step "Get backend Container App URL"

if ([string]::IsNullOrWhiteSpace($backendFqdn)) {
    throw "Backend FQDN is empty. Backend Container App may not be provisioned correctly."
}

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
Assert-LastExitCode -Step "Create frontend Container App"

$frontendFqdn = az containerapp show `
    --name $FrontendAppName `
    --resource-group $ResourceGroup `
    --query properties.configuration.ingress.fqdn `
    --output tsv
Assert-LastExitCode -Step "Get frontend Container App URL"

if ([string]::IsNullOrWhiteSpace($frontendFqdn)) {
    throw "Frontend FQDN is empty. Frontend Container App may not be provisioned correctly."
}

# Now that the frontend FQDN is known, update backend CORS to allow the real frontend origin.
Write-Host "Updating backend CORS with resolved frontend URL..."
az containerapp update `
    --name $BackendAppName `
    --resource-group $ResourceGroup `
    --replace-env-vars `
    "Cors__AllowedOrigins__0=http://localhost:3000" `
    "Cors__AllowedOrigins__1=https://localhost:3000" `
    "Cors__AllowedOrigins__2=http://localhost:3001" `
    "Cors__AllowedOrigins__3=https://localhost:3001" `
    "Cors__AllowedOrigins__4=https://$frontendFqdn" | Out-Null
Assert-LastExitCode -Step "Update backend CORS allowed origins"

Write-Host "Bootstrap completed successfully."
Write-Host ""
Write-Host "Resource Group:          $ResourceGroup"
Write-Host "ACR Name:                $AcrName"
Write-Host "ACR Login Server:        $acrLoginServer"
Write-Host "Log Analytics Workspace: $LogAnalyticsWorkspaceName"
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
