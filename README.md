# rozhody

## setup node
```nvm list```

```
* 18.12.1 (Currently using 64-bit executable)
11.15.0
8.15.1
```

**select node 11.15.0**
```nvm use 11.15.0```

## Project setup
```
npm install
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

### Deploy

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
add IP or domain your server as secret to your GITHUB repo

