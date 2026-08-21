# Mes Propriétés V5.3 Cloud

Cette version ajoute :
- connexion par e-mail + mot de passe via Supabase Auth ;
- synchronisation automatique des données entre Android et Windows ;
- conservation locale des données pour continuer à travailler hors ligne ;
- bouton de synchronisation manuelle ;
- configuration Supabase stockée localement sur chaque appareil ;
- isolation des données par utilisateur avec Row Level Security.

## Mise en service Supabase
1. Créer un projet gratuit sur Supabase.
2. Ouvrir SQL Editor et exécuter `supabase/setup.sql`.
3. Dans Project Settings > API, copier l'URL du projet et la clé publique anon/publishable.
4. Dans l'application : Sociétés & Cloud > Configuration Supabase, coller ces deux valeurs.
5. Créer le compte utilisateur avec e-mail + mot de passe.
6. Répéter uniquement la configuration Supabase sur le second appareil, puis se connecter avec le même compte.

Les données restent aussi présentes localement. À chaque modification, la V5.3 programme une synchronisation automatique vers le cloud quand un utilisateur est connecté.

Note : les photos et plans sont actuellement inclus dans l'état synchronisé. Pour de gros volumes, une évolution ultérieure pourra les déplacer vers Supabase Storage afin d'économiser la taille de la base PostgreSQL.
