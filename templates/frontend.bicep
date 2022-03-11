param repositoryUrl string = 'https://github.com/jameshoff-msft/staticwebappstarter'
param branch string = 'main'
param webAppName string = 'reactstarterjph5gh'

resource staticWebApp 'Microsoft.Web/staticSites@2020-12-01' = {
  name: webAppName
  location: 'eastus2'
  sku: {
    name: 'Standard'
    tier: 'Standard'
  }
  properties: {
    // The provider, repositoryUrl and branch fields are required for successive deployments to succeed
    // for more details see: https://github.com/Azure/static-web-apps/issues/516
    provider: 'GitHub'
    repositoryUrl: repositoryUrl
    repositoryToken:'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'
    branch: branch
  }
}

resource staticWebAppSettings 'Microsoft.Web/staticSites/config@2021-03-01' = {
  name: 'appsettings'
  kind: 'staticWebAppSettings'
  parent: staticWebApp
  
  properties: {
    'foo':'bar'
  }
}

output deployment_token string = listSecrets(staticWebApp.id, staticWebApp.apiVersion).properties.apiKey
