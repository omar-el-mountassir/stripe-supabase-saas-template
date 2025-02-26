# Documentation Technique - NexCallAI

## Vue d'ensemble

NexCallAI est une plateforme SaaS de centre d'appels alimentée par l'IA, développée en utilisant le framework Next.js. La plateforme permet aux entreprises de gérer et automatiser leurs appels téléphoniques grâce à des agents IA intelligents.

Ce document technique décrit l'architecture, les choix techniques et les recommandations pour le développement et le déploiement de NexCallAI.

## Architecture

### Stack technologique

NexCallAI est construit sur la base du template Next.js SaaS Starter (dzlau), avec les technologies suivantes:

- **Frontend**: Next.js (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes, Drizzle ORM
- **Base de données**: PostgreSQL (via Supabase)
- **Authentification**: Supabase Auth
- **Téléphonie**: Twilio
- **IA**: OpenAI (GPT-4 et GPT-3.5 Turbo)
- **Facturation**: Stripe

### Structure du projet

```plaintext
nexcallai/
├── app/                         # Application Next.js avec App Router
│   ├── api/                     # API Routes
│   │   ├── calls/               # Endpoints pour la gestion des appels
│   │   └── twiml/               # Webhooks pour Twilio
│   ├── dashboard/               # Pages du dashboard
│   │   ├── calls/               # Pages de gestion des appels
│   │   └── ...
│   ├── auth/                    # Pages d'authentification
│   └── ...
├── components/                  # Composants React réutilisables
│   ├── calls/                   # Composants liés aux appels
│   ├── ui/                      # Composants UI génériques
│   └── ...
├── lib/                         # Bibliothèques et utilitaires
│   ├── ai-agent.ts              # Logique de l'agent IA
│   ├── twilio.ts                # Intégration avec l'API Twilio
│   └── db/                      # Logique de base de données
│       ├── schema.ts            # Schéma Drizzle ORM
│       └── index.ts             # Initialisation de la base de données
├── types/                       # Types TypeScript
│   └── call.ts                  # Types pour les appels
└── utils/                       # Fonctions utilitaires diverses
```

## Intégrations principales

### 1. Twilio (API téléphonique)

L'intégration avec Twilio permet à NexCallAI de gérer les appels téléphoniques. Le module `lib/twilio.ts` fournit les fonctions principales:

- `initiateCall`: Pour démarrer un appel sortant
- `getCallDetails`: Pour récupérer les détails d'un appel existant
- `endCall`: Pour terminer un appel en cours
- `generateTwiML`: Pour générer des instructions vocales TwiML
- `startRecording`: Pour enregistrer un appel

Les webhooks Twilio sont gérés via l'endpoint `/api/twiml`, qui traite les événements d'appel et génère des réponses TwiML appropriées.

### 2. OpenAI (Agent IA)

Le module `lib/ai-agent.ts` gère la logique de l'agent IA qui traite les appels. Les principales fonctionnalités sont:

- `createAgent`: Fonction factory pour créer un agent IA avec des instructions spécifiques
- `processInput`: Traitement des entrées utilisateur et génération de réponses via l'API OpenAI
- `handleIncomingCall`: Gestion des appels entrants avec génération de message d'accueil
- `generateConversationSummary`: Génération de résumés de conversation

L'agent IA utilise GPT-4 Turbo pour le traitement des conversations et GPT-3.5 Turbo pour la génération de résumés.

### 3. Base de données

Le schéma de base de données (`lib/db/schema.ts`) comprend les tables principales suivantes:

- `calls`: Pour stocker les informations d'appel
- `callConversations`: Pour stocker les échanges de conversation
- `aiAgents`: Pour configurer différents agents IA

Drizzle ORM est utilisé pour interagir avec la base de données PostgreSQL.

## Flux de traitement d'un appel

1. **Initiation d'un appel**:
   - L'utilisateur initie un appel via l'interface ou une API
   - L'appel est créé via Twilio avec une URL de callback
   - Les détails de l'appel sont enregistrés dans la base de données

2. **Traitement de l'appel**:
   - Twilio envoie des webhooks à `/api/twiml` pour chaque événement d'appel
   - Pour un nouvel appel, l'agent IA est initialisé et un message d'accueil est généré
   - Les entrées vocales sont transcrites par Twilio et envoyées à l'agent IA
   - L'agent génère des réponses qui sont converties en TwiML et lues au client

3. **Fin d'appel**:
   - Lorsque l'appel se termine, un résumé est généré
   - Les données d'appel sont mises à jour dans la base de données
   - Les statistiques sont recalculées

## Interface utilisateur

L'interface de NexCallAI comprend plusieurs pages clés:

1. **Dashboard principal**: Vue d'ensemble des statistiques et activités
2. **Gestion des appels**: Liste des appels avec filtres et recherche
3. **Détails d'appel**: Vue détaillée d'un appel avec transcription
4. **Configuration des agents IA**: Personnalisation des agents IA

Les composants UI sont construits avec Tailwind CSS pour un design moderne et responsive.

## Recommandations de test

### Tests unitaires

Pour les tests unitaires, nous recommandons Jest avec React Testing Library. Priorités de test:

1. **Fonctions d'agent IA**:
   - Tests des fonctions `processInput`, `handleIncomingCall`
   - Utilisation de mocks pour l'API OpenAI

2. **Intégrations Twilio**:
   - Tests des fonctions `initiateCall`, `generateTwiML`
   - Utilisation de mocks pour les appels API Twilio

3. **Logique de base de données**:
   - Tests CRUD sur les entités principales
   - Utilisation d'une base de données de test

### Tests end-to-end

Pour les tests end-to-end, nous recommandons Playwright. Scénarios de test prioritaires:

1. **Flux d'authentification**:
   - Inscription, connexion, récupération de mot de passe

2. **Gestion d'appels**:
   - Création d'un nouvel appel
   - Consultation de la liste d'appels
   - Filtrage et recherche d'appels
   - Consultation des détails d'un appel

3. **Interface utilisateur**:
   - Navigation dans le dashboard
   - Affichage des éléments sur différentes tailles d'écran

## Déploiement

Pour le déploiement, nous recommandons:

1. **Environnements**:
   - Développement: déploiement automatisé sur chaque commit
   - Staging: déploiement manuel après tests
   - Production: déploiement manuel avec approbation

2. **Infrastructure**:
   - Vercel ou AWS Amplify pour l'hébergement Next.js
   - Base de données PostgreSQL via Supabase
   - Variables d'environnement pour les clés API

3. **Monitoring**:
   - Sentry pour la surveillance des erreurs
   - Datadog ou New Relic pour les performances
   - Alertes automatisées pour les incidents critiques

## Prochaines étapes

Améliorations futures à considérer:

1. **Améliorations de l'agent IA**:
   - Personnalisation avancée des agents
   - Support multilingue
   - Analyse de sentiment

2. **Intégrations additionnelles**:
   - CRM (Salesforce, HubSpot)
   - Outils de helpdesk (Zendesk, Intercom)
   - Services de messagerie (WhatsApp, SMS)

3. **Fonctionnalités analytiques**:
   - Tableaux de bord analytiques avancés
   - Rapports personnalisables
   - Prédictions basées sur l'IA

## Conclusion

NexCallAI offre une base solide pour une plateforme de centre d'appels alimentée par l'IA. L'architecture modulaire et les intégrations avec Twilio et OpenAI permettent une grande flexibilité et des possibilités d'évolution importantes.
