# 🚨 Railway Build Fehler - LÖSUNG

## Das Problem:

Railway versucht, **BEIDE** Services im gleichen Build zu bauen:
- ❌ Python + Node.js im gleichen Container
- ❌ Konflikt: `libpython3.12.so.1.0`

## ✅ Die Lösung: Separate Services!

### **WICHTIG: Du musst die Services MANUELL trennen!**

---

## 🔧 **So geht's richtig:**

### **SCHRITT 1: Lösche das aktuelle Project**

1. Railway Dashboard → Dein Project
2. Settings → "Danger" → **"Delete Project"**
3. Bestätige

---

### **SCHRITT 2: Neues Project - ABER 2 SEPARATE SERVICES!**

#### **A) Erstes Service: Next.js Frontend**

1. **"New Project"** → **"Deploy from GitHub repo"**
2. Wähle: `kingofwortarten`
3. **Service 1 Settings:**
   - **Root Directory:** `/` (oder leer)
   - **Watch Paths:** Leave empty or `app/,components/,lib/,types/`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`

4. **Variables:**
   ```
   OPENAI_API_KEY=sk-proj-...
   POS_TAGGER_URL=http://pos-tagger:5000
   ```

5. **Generate Domain**

---

#### **B) Zweites Service: POS Tagger**

1. **Im GLEICHEN Project:** "New Service"
2. **"GitHub Repo"** → `kingofwortarten`
3. **Service 2 Settings:**
   - **Root Directory:** `/pos-tagger` ⚠️ **WICHTIG!**
   - **Watch Paths:** `pos-tagger/**`
   - **Build Command:** Wird automatisch erkannt
   - **Start Command:** `python app.py`

4. **Variables:**
   ```
   PORT=5000
   PYTHON_VERSION=3.12
   ```

5. **KEIN Domain!** (nur intern erreichbar)

---

## 🎯 **Railway erkennt Services automatisch - ABER:**

**Problem:** Wenn du das ganze Repo hinzufügst, sieht Railway beide `package.json` UND `requirements.txt` und wird verwirrt!

**Lösung:** 
- **Service 1:** Root Directory `/` → Sieht nur `package.json`
- **Service 2:** Root Directory `/pos-tagger` → Sieht nur `requirements.txt`

---

## ⚡ **Alternative: Railway CLI (Schneller!)**

```bash
# Installation
npm i -g @railway/cli
railway login

# Service 1: Next.js
cd /path/to/kingofwortarten
railway init
railway link # Create new project
railway up
railway variables set OPENAI_API_KEY="sk-..."
railway variables set POS_TAGGER_URL="http://pos-tagger:5000"
railway domain

# Service 2: POS Tagger
cd pos-tagger
railway service # Create new service in SAME project
railway up
railway variables set PORT="5000"
```

---

## 📋 **Wichtige Punkte:**

1. ✅ **Beide Services im GLEICHEN Project**
2. ✅ **Unterschiedliche Root Directories**
3. ✅ **Service Namen: `frontend` und `pos-tagger`**
4. ✅ **Private Networking: `http://pos-tagger:5000`**

---

## 🆘 **Wenn es immer noch nicht geht:**

### **Plan B: Monorepo Struktur**

Das ist komplizierter, aber eine Option:
1. Zwei separate GitHub Repos
2. Jedes Repo ein Service
3. Kein Konflikt mehr

**ABER:** Einfacher ist die Root Directory Methode oben!

---

## 🎉 **Nach dem Fix:**

Beide Services sollten erfolgreich bauen:
- ✅ Frontend: Node.js Build
- ✅ POS Tagger: Python Build
- ✅ Kommunikation via Private Network

**Teste dann die Domain!**

