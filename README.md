# Deploying applications to Azure Container Instances using Docker CLI

This repo shows how to use GitHub actions and the Docker CLI to deploy a sample "book info" application to Azure Container Instances (ACI) service.

## Prerequisites

* [Azure subscription](https://azure.microsoft.com/free)
* [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli?view=azure-cli-latest)
* [Docker Desktop or Docker Engine](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/install/) for running the application on your development machine

The following instructions assume `bash` shell. On Windows, we recommend running deployment commands from [WSL2 environment](https://docs.microsoft.com/en-us/windows/wsl/wsl2-index).


## Set up Azure & GitHub environment
The following steps need to be done **once** to prepare the environment for deploying the app to ACI.

1. **Fork or [duplicate](https://docs.github.com/en/free-pro-team@latest/github/creating-cloning-and-archiving-repositories/duplicating-a-repository) this repository.** 

    You will use your repository to save Azure credentials that GitHub actions will use to access Azure on your behalf. Because this repository is public, a fork will remain public as well (but don't worry, your secrets will not be accessible to anybody but you). On the other hand, duplicate repositories can be made private.

1. **Create Azure resource group for the app.**

   > Change the name (`rg-guestbookexpress`) and location (`westus2`) of the new Azure resource group as appropriate

    ```bash
    az login
    az account show # Verify your selected subscription is what you want
    az group create --name rg-guestbookexpress --location westus2

1. **Create Azure service principal and secret for GitHub actions.** 

    This service principal will be used by GitHub actions to authenticate to Azure and manage Azure resources related to the application.

    > You might need to change the name of the GitHub actions service principal (`http://sp-guestbookexpress-githubci`; the "http://" prefix is considered part of the name) to make it unique within your Azure Active Directory tenant.

    ```bash
    az ad sp create-for-rbac --name http://sp-guestbookexpress-githubci --role contributor --scopes $(az group show --name rg-guestbookexpress --query '[id]' --output tsv) --sdk-auth
    ```

    Grab the JSON blob resulting from the command above (all of it) and save it in your GitHub repository as a secret named. You can create a repository secred from Settings | Secrets UI on GitHub portal:

    | Secret name | Secret value |
    | :--- | :--- |
    | `CI_AZURE_CREDENTIALS` | The JSON output of the `az ad sp create-for-rbac...` command above |

1. **Create Azure Container Registry (ACR) for storing main application service container image.**
   > Change the name of the container registry (`guestbookexpressacr201013a`) as appropriate--it needs to be globally unique

   ```shell
   az acr create --resource-group rg-guestbookexpress --name guestbookexpressacr201013a --sku Basic
   az role assignment create --assignee http://sp-guestbookexpress-githubci --scope $(az acr show --name guestbookexpressacr201013a --query id --output tsv) --role acrpull
   ```

1. **Add storage account and file share for application data data**

    > Change the name of the storage account (`gbexpresssa201013a`) as appropriate--it needs to be globally unique

   ```shell
   az storage account create --name gbexpresssa201013a --resource-group rg-guestbookexpress --location westus2
   az storage share create  --name guestbook-express-redis-data --account-name gbexpresssa201013a
   ```

1. **Update the `cloud.env` file**

   The `cloud.env` file contains the names of the Azure resource group, region, container registry, and storage account that will be used to deploy the app. 
   
   Please make sure to edit the file so that it contains correct names of the assets you have created in the previous steps. Then commit the change and push it to GitHub.


## Build and push application images to Azure Container Registry

The `BuildImage` workflow that builds the image for the main service of the sample application is triggered automatically whenever the repo is updated. Go to "Actions" tab of your repo and check the status of the workflow.

The `BuildImage` workflow can also be triggered manually ("Run workflow" button).


## Deploy the application

Unlike the `BuildImage` workflow, the `DeplyApp` workflow that deploys the application is designed to be triggered manually.

1. Go to Actions tab and select `DeployApp` workflow.
1. Click "Run workflow" button. 
1. Verify that the application has been deployed successfully by examining the `DeployApp` workflow logs. You can also check the running container via Azure portal UI or the Docker CLI.


## Run application locally (optional)

If you want, you can also run the application locally. Clone the repo to your machine and run the following commands:

```shell
npm install
docker-compose build --no-cache
docker-compose up
```

Open http://localhost:5001 to see current list of books, add new books and delete old ones.
