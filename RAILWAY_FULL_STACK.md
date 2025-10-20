# 🚂 Railway Full-Stack Deployment

## Beide Services auf Railway hosten

### 📋 Übersicht

Du erstellst **2 Services** auf Railway:
1. **Next.js App** (Frontend + API Routes)
2. **POS Tagger** (Python/Flask)

---

## 🚀 Deployment Schritte

### 1. Next.js App auf Railway

#### Via Web Interface:

1. **Gehe zu [railway.app](https://railway.app)**
2. **"New Project"**
3. **"Deploy from GitHub repo"**
4. **Repository:** `aruana-dev/kingofwortarten`
5. **Service Name:** `kingofwortarten-app`

#### Settings:
- **Root Directory:** `/` (leer lassen)
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm run start`
- **Watch Paths:** `/app/**,/components/**,/lib/**,/types/**`

#### Environment Variables:
```bash
NODE_ENV=production
OPENAI_API_KEY=sk-...
POS_TAGGER_URL=http://kingofwortarten-pos:5000
PORT=3000
```

⚠️ **Wichtig:** `POS_TAGGER_URL` nutzt Railway's **Private Networking**!
- Format: `http://SERVICE-NAME:PORT`
- Beide Services müssen im **gleichen Project** sein

#### Generate Domain:
- Settings → Networking → Generate Domain
- Du bekommst: `kingofwortarten-app.up.railway.app`

---

### 2. POS Tagger auf Railway

#### Via Web Interface:

1. **Im GLEICHEN Project:** "New Service"
2. **"Deploy from GitHub repo"**
3. **Repository:** `aruana-dev/kingofwortarten`
4. **Service Name:** `kingofwortarten-pos`

#### Settings:
- **Root Directory:** `/pos-tagger`
- **Build Command:** `pip install -r requirements.txt && python -m spacy download de_core_news_sm`
- **Start Command:** `python app.py`
- **Watch Paths:** `/pos-tagger/**`

#### Environment Variables:
```bash
PORT=5000
PYTHON_VERSION=3.11
```

#### KEIN Public Domain nötig!
- POS Tagger ist nur intern erreichbar
- Frontend erreicht ihn via Private Network

---

## 🔧 Alternative: Railway CLI

### Schnellere Methode:

```bash
# Railway CLI installieren
npm i -g @railway/cli

# Login
railway login

# Neues Project erstellen
railway init

# Service 1: Next.js App
railway link  # Wähle dein Project
railway up
railway variables set OPENAI_API_KEY="sk-..."
railway variables set POS_TAGGER_URL="http://kingofwortarten-pos:5000"
railway domain  # Domain generieren

# Service 2: POS Tagger (in pos-tagger folder)
cd pos-tagger
railway link  # Wähle das GLEICHE Project (create new service)
railway up
railway variables set PORT="5000"
```

---

## 🌐 Private Networking

Railway Services im gleichen Project können sich gegenseitig erreichen:

```bash
# Von Next.js → POS Tagger
http://kingofwortarten-pos:5000/analyze

# Format: http://SERVICE-NAME:PORT/path
```

**Service Name finden:**
- Railway Dashboard → Service → Settings → Service Name

---

## 💰 Kosten

### Railway Pricing:

**Hobby Plan:** Pay-as-you-go
- **Next.js App:** ~$5-7/Monat (512MB RAM, 0.5 vCPU)
- **POS Tagger:** ~$3-5/Monat (512MB RAM)
- **Total:** ~$8-12/Monat

**Pro Plan:** $20/Monat + Usage
- Mehr Ressourcen
- Priority Support
- Custom Domains

### Vergleich:

| Option | Frontend | Backend | Total |
|--------|----------|---------|-------|
| Vercel + Railway | $0 | $5 | **$5/Monat** ⭐ |
| Nur Railway | $5 | $5 | **$10/Monat** |
| Nur Vercel | $0 | $0 | **$0** (ohne POS) |

---

## ⚡ Performance Optimierung

### Next.js auf Railway:

```bash
# Environment Variables hinzufügen:
NEXT_TELEMETRY_DISABLED=1
NODE_OPTIONS="--max-old-space-size=512"
```

### Memory Settings:

Railway Dashboard → Settings → Resources:
- **Next.js:** 1GB RAM (empfohlen)
- **POS Tagger:** 512MB RAM (ausreichend)

---

## 🔍 Monitoring

### Logs anschauen:

```bash
# Via CLI
railway logs

# Via Dashboard
Project → Service → Deployments → View Logs
```

### Health Checks:

```bash
# Next.js
curl https://your-app.up.railway.app/api/health

# POS Tagger (intern)
curl http://kingofwortarten-pos:5000/health
```

---

## 🐛 Troubleshooting

### "Connection refused" zwischen Services

**Problem:** Next.js kann POS Tagger nicht erreichen

**Lösung:**
1. Beide Services im **gleichen Project**?
2. `POS_TAGGER_URL` korrekt? → `http://SERVICE-NAME:5000`
3. POS Tagger läuft? → Check Logs

### "Out of Memory"

**Problem:** Next.js Build schlägt fehl

**Lösung:**
```bash
railway variables set NODE_OPTIONS="--max-old-space-size=1024"
```

Oder: Bump RAM zu 1GB in Settings

### Build dauert ewig

**Problem:** Jeder Deploy dauert 5-10 Minuten

**Lösung:** Watch Paths einschränken:
- Next.js: `/app/**,/components/**,/lib/**`
- POS Tagger: `/pos-tagger/**`

---

## ✅ Post-Deployment Checklist

- [ ] Beide Services deployed
- [ ] Next.js Domain generiert
- [ ] Environment Variables gesetzt
- [ ] POS Tagger Health Check OK
- [ ] Next.js kann POS Tagger erreichen
- [ ] OpenAI generiert Sätze
- [ ] Spiel funktioniert end-to-end

---

## 🎉 Fertig!

Deine App läuft jetzt komplett auf Railway:
- **Frontend:** `https://kingofwortarten-app.up.railway.app`
- **POS Tagger:** Intern erreichbar

**Alternative empfohlen:** Vercel für Frontend (kostenlos + schneller!) + Railway nur für POS Tagger = $5/Monat statt $10

