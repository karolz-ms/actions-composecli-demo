# Deploying applications to Azure Container Instances using Docker CLI

This repo shows how to use GitHub actions and the Docker CLI to deploy a sample application to Azure Container Instances (ACI) service.

## Prerequisites

* [Azure subscription](https://azure.microsoft.com/free)
* [Docker Desktop or Docker Engine](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/install/) for running the application on your development machine

The following instructions assume `bash` shell. On Windows, we recommend running deployment commands from [WSL2 environment](https://docs.microsoft.com/en-us/windows/wsl/wsl2-index).

## Run application locally

```shell
npm install
docker-compose build --no-cache
docker-compose up
```
Open http://localhost:5001 to see current list of books, add new books and delete old ones.