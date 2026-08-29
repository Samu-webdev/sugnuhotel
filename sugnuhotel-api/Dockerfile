FROM php:8.2-cli

# Installe les outils système et les extensions PHP nécessaires à Laravel
# (pdo_pgsql pour se connecter à Neon/PostgreSQL, zip/mbstring utilisés par Composer et Laravel)
RUN apt-get update && apt-get install -y \
    git unzip libpq-dev libzip-dev \
    && docker-php-ext-install pdo pdo_pgsql zip

# Installe Composer (gestionnaire de dépendances PHP) en le copiant depuis son image officielle
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copie tout le code du projet dans l'image
COPY . .

# Installe les dépendances PHP du projet (équivalent du "composer install" qu'on tape en local)
RUN composer install --no-dev --optimize-autoloader

# Render fournit son propre numéro de port via la variable $PORT au démarrage du conteneur.
# Cette commande prépare la config, crée le lien de stockage, applique les migrations,
# INSÈRE LES DONNÉES DE DÉMO (--seed), puis démarre le serveur.
# Le seeder a été rendu idempotent (firstOrCreate) : relancer --seed à chaque déploiement
# ne créera jamais de doublons ni d'erreur, même si les comptes existent déjà.
CMD php artisan config:clear && \
    php artisan storage:link && \
    php artisan migrate --force && \
    php artisan db:seed --force && \
    php artisan serve --host 0.0.0.0 --port ${PORT:-10000}
