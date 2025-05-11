# FinMan (Financial Manager) v.0.2

## setup node
```nvm list```

```
* 18.12.1 (Currently using 64-bit executable)
11.15.0
8.15.1
```

**select node 18.12.1**
```nvm use 18.12.1```

## Project setup
```
npm install --legacy-peer-deps
```

### Generate API clients
The project uses Orval to generate API clients from OpenAPI specification. To generate API clients, run:
```
npm run generate-api
```

### Compiles and hot-reloads for development
```
npm run serve
```
or
```
vue-cli-service serve
npx vue-cli-service serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

## API Client Generation

This project uses [Orval](https://orval.dev/) to generate TypeScript API clients from OpenAPI specification. The generated files are located in the `src/api` directory.

### Local Generation

To generate API clients locally, run:

```bash
npm run generate-api
```

### CI/CD Generation

The GitHub Actions workflow automatically generates API clients during the build process. It uses the `API_ENDPOINT` secret to fetch the OpenAPI specification from the production API.

## Deploy

create user www

```
sudo useradd -r -s /usr/sbin/nologin www
sudo mkdir -p /home/www/finman/htdocs
sudo chown -R www:www /home/www
sudo chmod -R 755 /home/www
```

```
sudo -u www ssh-keygen -t rsa -b 4096 -C "www@yourserver.com"
```

```
sudo -u www mkdir -p /home/www/.ssh
sudo -u www touch /home/www/.ssh/authorized_keys
sudo -u www cat /home/www/.ssh/id_rsa.pub >> /home/www/.ssh/authorized_keys
sudo -u www chmod 600 /home/www/.ssh/authorized_keys
```

add (/home/www/.ssh/id_rsa) as secret SSH_PRIVATE_KEY to your GitHub repo.
add IP or domain your server as secret HOST to your GITHUB repo.
add your API endpoint URL as secret API_ENDPOINT to your GITHUB repo (e.g., https://your-domain/api).

