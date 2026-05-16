# Azure Deployment Setup Guide

This guide walks you through creating all necessary Azure resources and configuring GitHub Actions for automated CI/CD deployment.

## Prerequisites

- Azure account with active subscription
- Azure CLI installed locally
- GitHub repository access with write permissions to Secrets and Variables
- PowerShell 5.1+ (for bootstrap script execution)

## Step 1: Get Your Azure Subscription ID

1. Log in to Azure Portal: https://azure.microsoft.com
2. Go to **Subscriptions** (search bar or left menu)
3. Copy your subscription ID (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

## Step 2: Run Bootstrap Script (Recommended)

The easiest approach is to use the provided PowerShell bootstrap script:

```powershell
# Navigate to repo root
cd path/to/tht-sizzling-hot-products

# Run bootstrap script with your subscription ID
.\scripts\azure\bootstrap-container-apps.ps1 -SubscriptionId "YOUR_SUBSCRIPTION_ID"
```

This script will:
- Create resource group
- Create Azure Container Registry (ACR)
- Create Container Apps environment
- Create backend and frontend Container Apps
- Output all required values for GitHub Secrets/Variables

**Expected output example:**
```
Resource Group:          rg-tht-sizzling-hot-products
ACR Name:                acrthtsizzlinghotprod
ACR Login Server:        acrthtsizzlinghotprod.azurecr.io
Container Apps Env:      cae-tht-sizzling-hot-products
Backend App:             ca-backend-tht-sizzling-hot-products
Backend URL:             https://ca-backend-tht-sizzling-hot-products.xxx.azurecontainerapps.io
Frontend App:            ca-frontend-tht-sizzling-hot-products
Frontend URL:            https://ca-frontend-tht-sizzling-hot-products.xxx.azurecontainerapps.io

Configure these GitHub repository secrets:
  AZURE_CREDENTIALS
  ACR_NAME = acrthtsizzlinghotprod
  AZURE_RESOURCE_GROUP = rg-tht-sizzling-hot-products
  ACA_BACKEND_APP_NAME = ca-backend-tht-sizzling-hot-products
  ACA_FRONTEND_APP_NAME = ca-frontend-tht-sizzling-hot-products

Configure these GitHub repository variables:
  NEXT_PUBLIC_API_BASE_URL = https://ca-backend-tht-sizzling-hot-products.xxx.azurecontainerapps.io
  NEXT_PUBLIC_API_TIMEOUT = 30000
```

## Step 3: Create GitHub Secrets

Navigate to your GitHub repository:
1. Go to **Settings** > **Secrets and variables** > **Actions**
2. Click **New repository secret** and add each secret below:

### Secret: AZURE_CREDENTIALS

This enables GitHub Actions to authenticate with Azure.

1. In Azure Portal, create a Service Principal:
   ```bash
   az ad sp create-for-rbac \
     --name "github-actions-sp" \
     --role Contributor \
     --scopes /subscriptions/YOUR_SUBSCRIPTION_ID \
     --output json
   ```

2. Copy the entire JSON output and paste it as the value for `AZURE_CREDENTIALS` secret

3. Add remaining secrets:
   - `ACR_NAME`: Your ACR name (e.g., `acrthtsizzlinghotprod`)
   - `AZURE_RESOURCE_GROUP`: Your resource group name (e.g., `rg-tht-sizzling-hot-products`)
   - `ACA_BACKEND_APP_NAME`: Backend app name (e.g., `ca-backend-tht-sizzling-hot-products`)
   - `ACA_FRONTEND_APP_NAME`: Frontend app name (e.g., `ca-frontend-tht-sizzling-hot-products`)

## Step 4: Create GitHub Variables

In the same **Secrets and variables** > **Actions** section:
1. Click **New repository variable** and add each variable:
   - `NEXT_PUBLIC_API_BASE_URL`: The backend Container App public URL (e.g., `https://ca-backend-tht-sizzlinghotprod.xxx.azurecontainerapps.io`)
   - `NEXT_PUBLIC_API_TIMEOUT`: `30000` (optional, already has default)

## Step 5: Verify Configuration

Run a checklist in GitHub:
1. Go to **Settings** > **Secrets and variables** > **Actions**
2. Confirm all 5 secrets are present (AZURE_CREDENTIALS, ACR_NAME, AZURE_RESOURCE_GROUP, ACA_BACKEND_APP_NAME, ACA_FRONTEND_APP_NAME)
3. Confirm both variables are present (NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_API_TIMEOUT)

## Step 6: Trigger First Deployment (Manual Test)

1. Go to your repository **Actions** tab
2. Select **CD Azure Container Apps** workflow
3. Click **Run workflow** button (top right)
4. Choose branch: `feat/cicd-cloud-build-deploy` (or your deployment branch)
5. Click green **Run workflow** button
6. Watch the workflow execute:
   - Build backend and frontend images
   - Push images to ACR
   - Update Container Apps with new images
   - Run smoke check on backend health endpoint

### Expected Success Signs:
- All job steps complete with green checkmarks
- Last step "Smoke check backend health endpoint" returns HTTP 200
- Both Container Apps show as "Running" in Azure Portal

## Step 7: Verify Deployment

1. Get Container App URLs from bootstrap output or Azure Portal
2. Visit frontend URL in browser: `https://ca-frontend-tht-sizzlinghotprod.xxx.azurecontainerapps.io`
3. Verify page loads and displays product data
4. Check browser DevTools console for any API errors

## Troubleshooting

### "Authentication failed" in GitHub Actions workflow
- Verify AZURE_CREDENTIALS secret contains valid JSON
- Re-run Service Principal creation and update secret

### "Image not found in registry" error
- Verify ACR_NAME is correct
- Ensure bootstrap script completed successfully
- Check ACR exists in Azure Portal

### Frontend shows blank or "API connection failed"
- Verify NEXT_PUBLIC_API_BASE_URL variable is set to correct backend URL
- Check backend health endpoint manually: `curl https://BACKEND_URL/api/health`
- Review workflow logs for image build errors

### "Container Apps not found" during deploy
- Verify ACA_BACKEND_APP_NAME and ACA_FRONTEND_APP_NAME are correct
- Check Container Apps exist in Azure Portal under your resource group

## Cost Monitoring

Your estimated monthly cost (idle):
- Container Registry (Basic): ~$5
- Container Apps (Consumption): ~$0.15/vCPU-hour used (0 cost when idle at 0 replicas)
- Total: ~$5-20/month depending on traffic

To reduce further:
1. Set Container App **minimum replicas to 0** (already done in bootstrap script)
2. Apps will scale down to zero when idle and only incur costs when handling requests

## Next Steps

Once deployment is verified:
1. Create a PR from `feat/cicd-cloud-build-deploy` to `main`
2. Verify PR triggers CI workflow (lint, build, test)
3. Merge PR to `main` (requires all checks pass per branch protection)
4. CD workflow auto-triggers and deploys latest changes to Azure

Enjoy your automated CI/CD pipeline!
