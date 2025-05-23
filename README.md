# XRPL Pizza Symphony 🍕🎶

Une application interactive qui transforme les transactions XRPL en temps réel en musique visuelle et animations de pizza !

## 🌟 Fonctionnalités

- **Stream XRPL en temps réel** : Connexion directe au réseau XRPL mainnet
- **Visualisation musicale** : Chaque transaction génère des notes basées sur les données
- **Animations dynamiques** : Pizza qui tourne avec des garnitures volantes
- **Explorateur intégré** : Détails des transactions avec liens vers l'explorateur officiel
- **4 styles musicaux** : Pepperoni (Techno), Margherita (Jazz), Hawaiian (Reggaeton), Cheese (Vaporwave)

## 🚀 Installation

```bash
# Clone le projet
git clone <votre-repo>
cd xrpizza

# Installe les dépendances avec PNPM
pnpm install

# Lance le serveur de développement
pnpm dev
```

## 🔧 Configuration

### Variables d'environnement (optionnelles)

Créez un fichier `.env` à la racine pour personnaliser la connexion XRPL :

```bash
# Pour le mainnet (par défaut)
VITE_XRPL_SERVER=wss://xrplcluster.com/

# Pour le testnet
# VITE_XRPL_SERVER=wss://s.altnet.rippletest.net:51233
```

## 🎵 Comment ça marche

1. **Connexion** : L'app se connecte au réseau XRPL via WebSocket
2. **Streaming** : Écoute toutes les transactions validées en temps réel
3. **Transformation musicale** :
   - Type de transaction → Gamme musicale
   - Montant → Fréquence de base
   - Index du ledger → Harmonique
   - Fee → Durée de la note
4. **Visualisation** : Animations synchronisées avec la musique

## 🍕 Types de Pizza & Styles Musicaux

- **Pepperoni** : Style Techno avec onde en dents de scie
- **Margherita** : Style Jazz avec onde sinusoïdale 
- **Hawaiian** : Style Reggaeton avec onde triangulaire
- **Cheese** : Style Vaporwave ambient

## 📊 Données XRPL Affichées

- Hash de transaction
- Type de transaction (Payment, OfferCreate, etc.)
- Compte source et destination
- Montant en XRP
- Frais de transaction
- Index du ledger
- Timestamp

## 🛠 Technologies

- **Frontend** : React 18 + TypeScript + Vite
- **Styling** : Tailwind CSS + Shadcn/ui
- **XRPL** : Bibliothèque officielle XRPL.js
- **Audio** : Web Audio API
- **Package Manager** : PNPM

## 🎯 Développé par

[Mathys Cogne](https://link.mathys-cognefoucault.fr/) pour [XRPL Commons Pizza Night](https://www.xrpl-commons.org/) 2025 🍕

---

*"1ère pizza : 10k BTC. Cette pizza : gratuite !"* 🍕
