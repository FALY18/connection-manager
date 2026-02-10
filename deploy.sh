#!/bin/bash

echo "🚀 Déploiement du système FreeRADIUS + Laravel + Redis"

# Fonction pour afficher les étapes
step() {
    echo ""
    echo "================================================"
    echo "Étape: $1"
    echo "================================================"
}

# Nettoyage préalable
step "0. Nettoyage des fichiers temporaires"
rm -rf radius-config.bak 2>/dev/null || true
find . -name "*.bak" -type d -exec rm -rf {} + 2>/dev/null || true

step "1. Arrêt des conteneurs existants"
docker compose down --remove-orphans

step "2. Construction des images Docker (sans cache pour être sûr)"
docker compose build --no-cache || {
    echo "⚠️ La construction a échoué, tentative sans certains fichiers..."
    # Retirer temporairement les fichiers problématiques
    if [ -d "radius-config.bak" ]; then
        mv radius-config.bak radius-config.bak.tmp
    fi
    
    docker compose build --no-cache || {
        echo "❌ Construction échouée même après nettoyage"
        exit 1
    }
    
    # Remettre les fichiers si déplacés
    if [ -d "radius-config.bak.tmp" ]; then
        mv radius-config.bak.tmp radius-config.bak
    fi
}

step "3. Démarrage de tous les services"
docker compose up -d

step "4. Attente du démarrage des services"
echo "Attente 10 secondes..."
sleep 10

# Vérification étape par étape
step "5. Vérification de l'état des conteneurs"
if ! docker compose ps | grep -q "Up"; then
    echo "❌ Certains services ne sont pas démarrés"
    docker compose ps
    echo "Affichage des logs..."
    docker compose logs --tail=20
    exit 1
fi
docker compose ps

step "6. Configuration de Redis pour les événements d'expiration"
if docker compose ps | grep -q "redis.*Up"; then
    docker compose exec redis redis-cli CONFIG SET notify-keyspace-events Ex
    docker compose exec redis redis-cli CONFIG GET notify-keyspace-events
else
    echo "⚠️ Redis n'est pas démarré, configuration différée"
fi

step "7. Exécution des migrations Laravel"
if docker compose ps | grep -q "laravel.*Up"; then
    # Attendre que Laravel soit vraiment prêt
    sleep 5
    docker compose exec laravel php artisan migrate --force || {
        echo "⚠️ Les migrations ont échoué, tentative de création de la base..."
        # Tenter de créer la base si elle n'existe pas
        docker compose exec postgres psql -U laravel_user -c "CREATE DATABASE IF NOT EXISTS gestion_connect;" 2>/dev/null || true
        sleep 2
        docker compose exec laravel php artisan migrate --force
    }
else
    echo "❌ Laravel n'est pas démarré"
    exit 1
fi

step "8. Optimisation"
docker compose exec laravel php artisan optimize:clear
docker compose exec laravel php artisan optimize

step "9. Test de connectivité"
echo "Test Redis:"
if docker compose exec redis redis-cli ping 2>/dev/null | grep -q "PONG"; then
    echo "✅ Redis fonctionne"
else
    echo "❌ Redis ne répond pas"
fi

echo "Test PostgreSQL:"
if docker compose exec postgres pg_isready -U laravel_user 2>/dev/null; then
    echo "✅ PostgreSQL fonctionne"
else
    echo "❌ PostgreSQL ne répond pas"
fi

step "10. Démarrage du listener Redis"
# D'abord tuer tout listener existant
docker compose exec laravel pkill -f "redis:listen-expired" 2>/dev/null || true
# Démarrer en arrière-plan
docker compose exec -d laravel php artisan redis:listen-expired

echo ""
echo "✅ Déploiement réussi!"
echo ""
echo "🌐 URLs d'accès:"
echo "   API Laravel:     http://localhost:8000"
echo "   PostgreSQL:      localhost:5432 (user: laravel_user, pass: secret)"
echo "   Redis:           localhost:6380"
echo "   FreeRADIUS:      UDP 1812/1813 (secret: testing123)"
echo ""
echo "🔧 Commandes de gestion:"
echo "   Voir les logs:    docker compose logs -f"
echo "   Arrêter:          docker compose down"
echo "   Redémarrer:       docker compose restart"
echo "   Shell Laravel:    docker compose exec laravel bash"
echo ""
echo "🧪 Pour tester:"
echo "   docker compose exec laravel php artisan redis:listen-expired --test"


_-______-___-_____-________---__-___---______-___---_---_-_____----_-

MInimiser l'installation : on a trop de chose à installer sur ce projet comme indique ceci:rust@user-macbookpro8120250207:~/opr/entrain/essai/gestion_connect/backend$ docker compose up -d
[+] Building 169.5s (6/18)                                                                                
 => [internal] load local bake definitions                                                           0.0s
 => => reading from stdin 1.55kB                                                                     0.0s
 => [laravel internal] load build definition from Dockerfile.laravel                                 0.0s
 => => transferring dockerfile: 1.21kB                                                               0.0s
 => [laravel internal] load metadata for docker.io/library/php:8.2-fpm-alpine                        2.8s
 => [laravel internal] load .dockerignore                                                            0.0s
 => => transferring context: 181B                                                                    0.0s
 => CACHED [redis-listener  1/13] FROM docker.io/library/php:8.2-fpm-alpine@sha256:6363baa3186e5bd4  0.0s
 => => resolve docker.io/library/php:8.2-fpm-alpine@sha256:6363baa3186e5bd43794c9612f8a34fb88657179  0.0s
 => [redis-listener internal] load build context                                                     1.4s
 => => transferring context: 45.82MB                                                                 1.3s
 => [redis-listener  2/13] RUN apk add --no-cache     postgresql-dev     postgresql-client     li  166.3s
 => => # ( 87/116) Installing libpq-dev (18.1-r0)                                                        
 => => # ( 88/116) Installing libecpg (18.1-r0)                                                          
 => => # ( 89/116) Installing libecpg-dev (18.1-r0)                                                      
 => => # ( 90/116) Installing clang20-headers (20.1.8-r1)                                                
 => => # ( 91/116) Installing llvm20-libs (20.1.8-r0)                                                    
 => => # ( 92/116) Installing clang20-libs (20.1.8-r1)       . 
 Et donc vérifier cela car j'ai déja utiliser quelques une de ces dépendences dans de projets qui tourne sur ce docker aussi. verifier le package déja installer et vérifier ce qui ne son pas installer le réinstaller cela. VOICI dockerfile.laravel:FROM php:8.2-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    postgresql-dev \
    postgresql-client \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    curl \
    git \
    supervisor \
    redis \
    nodejs \
    npm \
    openssl \
    certbot \
    linux-headers

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_pgsql pgsql gd zip bcmath sockets

# Install Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Install Node.js and NPM for frontend assets
RUN apk add --no-cache nodejs npm

# Install Supervisor for process management
RUN mkdir -p /var/log/supervisor

WORKDIR /var/www/html

# Copy application files
COPY . .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Set permissions
RUN chown -R www-data:www-data storage bootstrap/cache
RUN chmod -R 775 storage bootstrap/cache

# Generate application key
RUN php artisan key:generate

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]  et docker compose.yml:
services:
  postgres:
    image: postgres:16-alpine
    container_name: gestion_connect_postgres
    environment:
      POSTGRES_DB: gestion_connect
      POSTGRES_USER: laravel_user
      POSTGRES_PASSWORD: secret
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./postgres-init:/docker-entrypoint-initdb.d
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U laravel_user -d gestion_connect"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    build: ./redis-config
    container_name: gestion_connect_redis
    ports:
      - "6380:6379"
    volumes:
      - redisdata:/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  freeradius:
    image: freeradius/freeradius-server:latest
    container_name: gestion_connect_radius
    ports:
      - "1812:1812/udp"
      - "1813:1813/udp"
      - "18120:18120/udp"
      - "18130:18130/udp"
    volumes:
      - ./radius-config:/etc/freeradius
    networks:
      - app-network
    depends_on:
      - redis
      - postgres
    restart: unless-stopped
    command: freeradius -f -l stdout

  laravel:
    build:
      context: .
      dockerfile: Dockerfile.laravel
    container_name: gestion_connect_laravel
    ports:
      - "8000:8000"
    volumes:
      - .:/var/www/html
      - ./storage:/var/www/html/storage
    networks:
      - app-network
    depends_on:
      redis:
        condition: service_healthy
      postgres:
        condition: service_healthy
    environment:
      - DB_CONNECTION=pgsql
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_DATABASE=gestion_connect
      - DB_USERNAME=laravel_user
      - DB_PASSWORD=secret
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - REDIS_PREFIX=laravel-database-
      - RADIUS_API_KEY=supersecretkey
      - APP_URL=http://localhost:8000
    command: >
      sh -c "
      php artisan migrate --force &&
      php artisan db:seed --force &&
      php artisan serve --host=0.0.0.0 --port=8000"

  redis-listener:
    build:
      context: .
      dockerfile: Dockerfile.laravel
    container_name: gestion_connect_redis_listener
    volumes:
      - .:/var/www/html
    networks:
      - app-network
    depends_on:
      - laravel
      - redis
    environment:
      - DB_CONNECTION=pgsql
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_DATABASE=gestion_connect
      - DB_USERNAME=laravel_user
      - DB_PASSWORD=secret
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - REDIS_PREFIX=laravel-database-
    command: php artisan redis:listen-expired
    restart: unless-stopped

volumes:
  pgdata:
  redisdata:

networks:
  app-network:
    driver: bridge