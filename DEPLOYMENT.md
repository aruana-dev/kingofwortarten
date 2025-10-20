# 🚀 Deployment Guide - KingOfWortarten

## 📋 Übersicht

Die App besteht aus:
1. **Next.js Frontend** (inkl. API Routes) → Vercel
2. **POS Tagger Service** (Python/Flask) → Railway oder Fly.io

## 1️⃣ Vercel Deployment (Frontend + API)

### Vorbereitung

1. **GitHub Repository ist bereit** ✅
   - Dein Code ist bereits auf GitHub: `aruana-dev/kingofwortarten`

2. **Environment Variables vorbereiten:**
   - `OPENAI_API_KEY` - Dein OpenAI API Key
   - `POS_TAGGER_URL` - URL des POS Tagger Service (nach Railway Deployment)

### Deployment Schritte

1. **Gehe zu [vercel.com](https://vercel.com)**
2. **"Add New Project"**
3. **Import Git Repository:**
   - Wähle `aruana-dev/kingofwortarten`
4. **Configure Project:**
   - Framework Preset: **Next.js** (wird automatisch erkannt)
   - Root Directory: `./` (Standard)
   - Build Command: `npm run build` (Standard)
   - Output Directory: `.next` (Standard)
5. **Environment Variables hinzufügen:**
   ```
   OPENAI_API_KEY=sk-...
   POS_TAGGER_URL=https://dein-pos-tagger.railway.app
   ```
6. **Deploy** klicken! 🚀

### Nach dem Deployment

- URL: `https://kingofwortarten.vercel.app` (oder Custom Domain)
- Auto-Deploy: Jeder Push zu `main` deployt automatisch
- Preview Deploys: Jeder Branch bekommt eine eigene URL

---

## 2️⃣ Railway Deployment (POS Tagger)

### Option A: Web Interface

1. **Gehe zu [railway.app](https://railway.app)**
2. **"New Project" → "Deploy from GitHub repo"**
3. **Repository auswählen:** `aruana-dev/kingofwortarten`
4. **Settings:**
   - Root Directory: `/pos-tagger`
   - Build Command: `pip install -r requirements.txt && python -m spacy download de_core_news_sm`
   - Start Command: `gunicorn -w 4 -b 0.0.0.0:$PORT app:app`
5. **Environment Variables:**
   ```
   PORT=5000
   PYTHON_VERSION=3.11
   ```
6. **Deploy!**

### Option B: Railway CLI

```bash
# Railway CLI installieren
npm i -g @railway/cli

# Login
railway login

# In pos-tagger Verzeichnis wechseln
cd pos-tagger

# Neues Projekt erstellen
railway init

# Deployen
railway up

# URL erhalten
railway domain
```

### Nach dem Deployment

- Kopiere die Railway URL (z.B. `https://pos-tagger-production.up.railway.app`)
- Füge diese als `POS_TAGGER_URL` in Vercel hinzu
- Redeploye Vercel (oder warte auf Auto-Deploy)

---

## 3️⃣ Alternative: Fly.io (POS Tagger)

Falls Railway nicht funktioniert:

```bash
# Fly CLI installieren
brew install flyctl

# Login
fly auth login

# In pos-tagger Verzeichnis
cd pos-tagger

# Fly.toml erstellen
cat > fly.toml << 'EOF'
app = "kingofwortarten-pos"
primary_region = "ams"

[build]
  builder = "paketobuildpacks/builder:base"

[env]
  PORT = "8080"

[[services]]
  internal_port = 8080
  protocol = "tcp"

  [[services.ports]]
    port = 80
    handlers = ["http"]
  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

[deploy]
  release_command = "python -m spacy download de_core_news_sm"
EOF

# Deployen
fly launch --no-deploy
fly deploy
```

---

## 4️⃣ Environment Variables Übersicht

### Vercel (Next.js)

| Variable | Beschreibung | Beispiel |
|----------|--------------|----------|
| `OPENAI_API_KEY` | OpenAI API Key für Task-Generierung | `sk-proj-...` |
| `POS_TAGGER_URL` | URL des POS Tagger Service | `https://pos-tagger.railway.app` |
| `DISABLE_OPENAI` | OpenAI deaktivieren (optional) | `true` |

### Railway/Fly.io (POS Tagger)

| Variable | Beschreibung | Beispiel |
|----------|--------------|----------|
| `PORT` | Server Port | `5000` oder `8080` |
| `PYTHON_VERSION` | Python Version | `3.11` |

---

## 5️⃣ Post-Deployment Checklist

- [ ] Frontend ist erreichbar
- [ ] POS Tagger ist erreichbar (teste: `https://your-url/health`)
- [ ] OpenAI generiert Sätze (teste Session-Erstellung)
- [ ] Schüler können beitreten
- [ ] Spiel funktioniert (mehrere Aufgaben testen!)
- [ ] Leaderboard wird angezeigt
- [ ] Custom Domain (optional)

---

## 🔧 Troubleshooting

### Frontend-Fehler

**Problem:** "Session creation failed"
- **Lösung:** Prüfe `OPENAI_API_KEY` in Vercel Environment Variables

**Problem:** "POS Tagger not available"
- **Lösung:** Prüfe `POS_TAGGER_URL` und dass Railway/Fly läuft

### POS Tagger-Fehler

**Problem:** 404 bei `/analyze`
- **Lösung:** Prüfe, ob gunicorn läuft: `railway logs` oder `fly logs`

**Problem:** "spacy model not found"
- **Lösung:** Build Command ergänzen:
  ```bash
  pip install -r requirements.txt && python -m spacy download de_core_news_sm
  ```

---

## 📊 Monitoring

### Vercel
- **Analytics:** [vercel.com/dashboard](https://vercel.com/dashboard)
- **Logs:** Vercel Dashboard → Deployments → Logs

### Railway
- **Dashboard:** [railway.app/dashboard](https://railway.app/dashboard)
- **Logs:** `railway logs` oder im Dashboard

### Fly.io
- **Dashboard:** [fly.io/dashboard](https://fly.io/dashboard)
- **Logs:** `fly logs`

---

## 💰 Kosten

### Vercel
- **Hobby Plan:** Kostenlos
  - 100 GB Bandwidth/Monat
  - Unlimited Requests
  - Auto-Scaling

### Railway
- **Free Trial:** $5 Credit
- **Developer Plan:** $5/Monat
  - 5GB RAM
  - 100GB Bandwidth

### Fly.io
- **Free Tier:** 3 VMs (256MB RAM)
- **Paid:** $1.94/Monat pro VM

---

## 🎉 Fertig!

Deine App ist jetzt live unter:
- **Frontend:** `https://kingofwortarten.vercel.app`
- **POS Tagger:** `https://pos-tagger.railway.app`

**Share Link mit Lehrern und Schülern! 🚀**

