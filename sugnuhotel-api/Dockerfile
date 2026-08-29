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

# IMPORTANT : tout sur UNE SEULE LIGNE, volontairement. Une commande CMD répartie sur
# plusieurs lignes avec des "\" de continuation devient fragile dès que le fichier est
# édité/copié depuis Windows (les fins de ligne CRLF cassent la continuation "\", et Docker
# finit par interpréter "&&" comme un argument au lieu d'un séparateur de commandes).
CMD php artisan config:clear && php artisan storage:link && php artisan migrate --force && php artisan db:seed --force && php artisan serve --host 0.0.0.0 --port ${PORT:-10000}
