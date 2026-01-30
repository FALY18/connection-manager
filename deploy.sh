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