# 🚀 Deploy Instructions - Vercel + Railway

## ✅ Vorbereitung abgeschlossen!

Alle Config-Dateien sind erstellt. Jetzt nur noch deployen!

---

## 📋 Was du brauchst:

- [ ] GitHub Account (hast du schon ✅)
- [ ] OpenAI API Key
- [ ] Vercel Account (kostenlos)
- [ ] Railway Account (kostenlos)

---

## 🎯 SCHRITT 1: Railway - POS Tagger deployen

### 1.1 Railway Account erstellen
1. Gehe zu: https://railway.app
2. "Login" → "Login with GitHub"
3. Authorisiere Railway

### 1.2 Neues Project erstellen
1. Klicke "New Project"
2. Wähle "Deploy from GitHub repo"
3. Suche: `aruana-dev/kingofwortarten`
4. Klicke auf dein Repository

### 1.3 Service konfigurieren
**WICHTIG:** Railway erkennt automatisch mehrere Services. Wähle:
- ✅ **Python (pos-tagger)**
- ❌ NICHT Node.js auswählen!

Wenn beide erscheinen:
1. Lösche den Node.js Service
2. Behalte nur den Python Service

### 1.4 Settings anpassen
1. Klicke auf den **Python Service**
2. Gehe zu **Settings**
3. **Root Directory:** `/pos-tagger`
4. **Service Name:** `pos-tagger` (oder wie du willst)

### 1.5 Environment Variables
Settings → Variables → Add Variable:

```
PORT=5000
PYTHON_VERSION=3.11
```

### 1.6 Domain generieren
1. Settings → Networking
2. "Generate Domain"
3. **Kopiere die URL!** (z.B. `pos-tagger-production.up.railway.app`)

### 1.7 Warten bis Deployment fertig ist
- Gehe zu "Deployments"
- Warte bis Status: ✅ "Success" (ca. 3-5 Minuten)

### 1.8 Testen
Öffne in Browser:
```
https://DEINE-RAILWAY-URL.railway.app/health
```

Du solltest sehen:
```json
{
  "status": "ok",
  "port": 5000,
  "model": "de_core_news_sm"
}
```

✅ **Railway fertig!** Notiere dir die URL für Vercel.

---

## 🎯 SCHRITT 2: Vercel - Frontend deployen

### 2.1 Vercel Account erstellen
1. Gehe zu: https://vercel.com
2. "Sign Up" → "Continue with GitHub"
3. Authorisiere Vercel

### 2.2 Neues Project
1. Klicke "Add New..." → "Project"
2. "Import Git Repository"
3. Suche: `aruana-dev/kingofwortarten`
4. Klicke "Import"

### 2.3 Configure Project
**Framework Preset:** Next.js (automatisch erkannt)
**Root Directory:** `./` (Standard)
**Build Command:** `npm run build` (Standard)
**Install Command:** `npm install` (Standard)

### 2.4 Environment Variables hinzufügen
Klicke auf "Environment Variables" und füge hinzu:

**Variable 1:**
```
Name: OPENAI_API_KEY
Value: sk-proj-... (dein OpenAI Key)
```

**Variable 2:**
```
Name: POS_TAGGER_URL
Value: https://DEINE-RAILWAY-URL.railway.app
```
⚠️ **WICHTIG:** Verwende die Railway URL von Schritt 1.6!

**Variable 3 (optional):**
```
Name: NEXT_PUBLIC_APP_URL
Value: (leer lassen, Vercel setzt automatisch)
```

### 2.5 Deploy!
1. Klicke "Deploy"
2. Warte ca. 2-3 Minuten
3. 🎉 **Fertig!**

### 2.6 URL kopieren
Nach dem Deployment bekommst du eine URL wie:
```
https://kingofwortarten.vercel.app
```

### 2.7 Testen
Öffne deine Vercel URL und teste:
1. Lehrer-Interface → Session erstellen
2. Schüler-Interface → Beitreten
3. Spiel starten und durchspielen

---

## 🔧 FEHLERBEHEBUNG

### Railway Deployment schlägt fehl

**Problem:** "Failed to download spaCy model"

**Lösung:**
1. Railway Dashboard → Service → Variables
2. Füge hinzu: `BUILD_COMMAND=pip install -r requirements.txt && python -m spacy download de_core_news_sm`
3. Redeploy: Deployments → ⋯ → "Redeploy"

---

### Vercel Build Error

**Problem:** "Module not found"

**Lösung:**
1. Vercel Dashboard → Project → Settings → General
2. "Root Directory": sicherstellen dass `./` (leer)
3. Redeploy

---

### POS Tagger nicht erreichbar

**Problem:** Frontend zeigt "POS Tagger not available"

**Lösung:**
1. Prüfe Railway URL im Browser: `/health`
2. Vercel → Settings → Environment Variables
3. `POS_TAGGER_URL` korrekt? (mit https:// !)
4. Redeploy: Deployments → ⋯ → "Redeploy"

---

### OpenAI funktioniert nicht

**Problem:** "Session creation failed"

**Lösung:**
1. Vercel → Settings → Environment Variables
2. `OPENAI_API_KEY` korrekt?
3. OpenAI Dashboard: Credits vorhanden?
4. Redeploy

---

## 🎨 Optional: Custom Domain

### Für Vercel:
1. Vercel → Project → Settings → Domains
2. "Add" → Deine Domain eingeben
3. DNS Records bei Domain-Provider hinzufügen

### Für Railway:
1. Railway → Service → Settings → Networking
2. "Custom Domain" → Domain eingeben
3. CNAME Record hinzufügen

---

## 📊 Monitoring

### Vercel Logs:
```
Dashboard → Project → Deployments → [Deployment] → Logs
```

### Railway Logs:
```
Dashboard → Service → Deployments → [Deployment] → View Logs
```

Oder via CLI:
```bash
npm i -g @railway/cli
railway login
railway logs
```

---

## 💰 Kosten-Übersicht

### Monatliche Kosten:

| Service | Plan | Kosten |
|---------|------|--------|
| Vercel | Hobby | **$0** |
| Railway | Hobby | **~$5** |
| **TOTAL** | | **~$5/Monat** |

### Railway Details:
- $5 Trial Credit (einmalig)
- Dann: ~$0.000463/GB-hour
- Durchschnitt: $5/Monat für POS Tagger

---

## ✅ Fertig! Deine App ist live!

**Frontend:** https://kingofwortarten.vercel.app
**Backend:** https://pos-tagger-production.up.railway.app

### Automatische Deployments:
- Jeder Push zu `main` → Vercel deployt automatisch
- Jeder Push zu `main` → Railway deployt automatisch

### Nächste Schritte:
1. Teile die URL mit Lehrern und Schülern
2. Sammle Feedback
3. Entwickle weiter auf einem Branch
4. Merge zu `main` → Automatisches Deployment!

🎉 **Viel Erfolg mit KingOfWortarten!**

