#!/bin/bash
# Script d'intégration FreeRADIUS avec Laravel Backend

# Configuration REST module pour FreeRADIUS
cat > /etc/freeradius/3.0/mods-available/rest_laravel << 'EOF'
rest rest_laravel {
    connect_uri = "http://laravel:8000"
    
    authorize {
        uri = "${..connect_uri}/api/radius/auth"
        method = 'post'
        body = 'json'
        data = '{"username":"%{User-Name}","password":"%{User-Password}","mac":"%{Calling-Station-Id}","ip":"%{Framed-IP-Address}"}'
        
        tls = ${..tls}
        
        # Headers
        header {
            "Content-Type" = "application/json"
            "X-API-Key" = "supersecretkey"
        }
    }
    
    accounting {
        uri = "${..connect_uri}/api/radius/accounting/%{Acct-Status-Type}"
        method = 'post'
        body = 'json'
        
        # Start
        start {
            uri = "${..connect_uri}/api/radius/accounting/start"
            data = '{"username":"%{User-Name}","mac":"%{Calling-Station-Id}","ip":"%{Framed-IP-Address}","voucher_code":"%{User-Password}"}'
        }
        
        # Stop
        stop {
            uri = "${..connect_uri}/api/radius/accounting/stop"
            data = '{"session_id":"%{Acct-Session-Id}"}'
        }
        
        # Interim
        interim-update {
            uri = "${..connect_uri}/api/radius/accounting/interim"
            data = '{"session_id":"%{Acct-Session-Id}"}'
        }
        
        header {
            "Content-Type" = "application/json"
            "X-API-Key" = "supersecretkey"
        }
    }
    
    pool {
        start = 0
        min = 4
        max = 32
        spare = 1
        uses = 0
        retry_delay = 30
        lifetime = 0
        idle_timeout = 60
    }
}
EOF

# Activer le module
ln -sf /etc/freeradius/3.0/mods-available/rest_laravel /etc/freeradius/3.0/mods-enabled/

# Configuration du site default
cat > /etc/freeradius/3.0/sites-available/laravel-hotspot << 'EOF'
server laravel-hotspot {
    listen {
        type = auth
        ipaddr = *
        port = 1812
    }
    
    listen {
        type = acct
        ipaddr = *
        port = 1813
    }
    
    authorize {
        filter_username
        preprocess
        
        # Appel à Laravel pour authentification
        rest_laravel
        
        if (ok) {
            update reply {
                Session-Timeout := 3600
                Idle-Timeout := 300
            }
        }
    }
    
    authenticate {
        # Pas d'authentification locale, tout via REST
    }
    
    preacct {
        preprocess
        acct_unique
        suffix
    }
    
    accounting {
        # Appel à Laravel pour accounting
        rest_laravel
    }
    
    post-auth {
        exec
        Post-Auth-Type REJECT {
            attr_filter.access_reject
        }
    }
}
EOF

# Activer le site
ln -sf /etc/freeradius/3.0/sites-available/laravel-hotspot /etc/freeradius/3.0/sites-enabled/

# Configuration des clients (routeurs autorisés)
cat > /etc/freeradius/3.0/clients.conf << 'EOF'
# Client par défaut (localhost pour tests)
client localhost {
    ipaddr = 127.0.0.1
    secret = testing123
    require_message_authenticator = no
    nas_type = other
}

# Votre routeur WiFi
client router {
    ipaddr = 192.168.1.1
    secret = your-router-secret
    require_message_authenticator = no
    nas_type = other
    shortname = main-router
}

# Réseau local (ajustez selon votre réseau)
client local_network {
    ipaddr = 192.168.1.0/24
    secret = testing123
    require_message_authenticator = no
    nas_type = other
}
EOF

echo "Configuration FreeRADIUS terminée!"
echo "Redémarrez FreeRADIUS: systemctl restart freeradius"
