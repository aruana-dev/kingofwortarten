# 🚂 Railway Setup - FINALE Version

## ✅ Vorbereitung abgeschlossen!

Alle Config-Dateien sind optimiert. Jetzt nur noch deployen!

---

## 📋 **Was du jetzt tun musst:**

### **SCHRITT 1: Railway öffnen**

**Öffne:** https://railway.app

**Login:**
- Klicke "Login"
- Wähle "Login with GitHub"
- Authorisiere Railway

---

### **SCHRITT 2: Neues Project**

1. **Klicke:** "New Project" (großer violetter Button)
2. **Wähle:** "Deploy from GitHub repo"
3. **Suche:** `kingofwortarten`
4. **Klicke:** auf dein Repository

⏳ **Railway analysiert jetzt dein Repo...**

---

### **SCHRITT 3: Services erkennen**

Railway wird **2 Services** finden:

**A) 🟢 Node.js** (Next.js Frontend)
**B) 🐍 Python** (POS Tagger)

**→ Klicke auf BEIDE** (beide Services hinzufügen!)

---

### **SCHRITT 4: Services konfigurieren**

#### **A) Python Service (POS Tagger)**

1. **Klicke auf:** Python Service
2. **Gehe zu:** Settings (⚙️)
3. **Bei "Service Name":** Ändere zu `pos-tagger`
4. **Bei "Root Directory":** Setze `/pos-tagger`
5. **Gehe zu:** Variables (linke Sidebar)
6. **Klicke:** "New Variable"
7. **Füge hinzu:**
   ```
   PORT=5000
   ```
8. **Speichern!**

#### **B) Node.js Service (Frontend)**

1. **Zurück zum Dashboard** (klicke Project Name oben links)
2. **Klicke auf:** Node.js Service
3. **Gehe zu:** Settings (⚙️)
4. **Bei "Service Name":** Ändere zu `frontend`
5. **Root Directory:** LEER LASSEN (oder `/`)
6. **Gehe zu:** Variables
7. **Füge hinzu (2 Variables!):**

   **Variable 1:**
   ```
   OPENAI_API_KEY=sk-proj-...
   ```
   (Dein OpenAI Key)

   **Variable 2:**
   ```
   POS_TAGGER_URL=http://pos-tagger:5000
   ```
   ⚠️ **WICHTIG:** Genau so schreiben!
   - `pos-tagger` ist der Service Name!
   - Railway's Private Networking

8. **Speichern!**

---

### **SCHRITT 5: Domain generieren**

1. **Klicke auf:** Frontend Service
2. **Gehe zu:** Settings
3. **Scrolle zu:** "Networking"
4. **Klicke:** "Generate Domain"
5. **KOPIERE DIE URL!**

📋 Beispiel: `frontend-production-abc.up.railway.app`

---

### **SCHRITT 6: Deploy starten**

1. **Zurück zum Dashboard**
2. Du siehst beide Services
3. **Warte** bis beide Deployments fertig sind:
   - ⏳ Building...
   - ✅ Success!

⏱️ **Dauer:** 3-5 Minuten

---

### **SCHRITT 7: Testen!**

#### **A) POS Tagger testen (optional):**

POS Tagger ist intern, aber du kannst ihn testen:
1. Klicke auf POS Tagger Service
2. Settings → Networking → "Generate Domain"
3. Öffne: `https://deine-url.railway.app/health`
4. Sollte zeigen: `{"status": "ok"}`

#### **B) Frontend testen:**

1. **Öffne deine Frontend URL** (von Schritt 5)
2. **Test:** Lehrer → Session erstellen
3. **Wenn es funktioniert:** 🎉 **FERTIG!**

---

## 🎉 **Geschafft!**

Deine App läuft jetzt auf Railway:

**Frontend:** `https://frontend-production-...railway.app`
**Backend:** Intern erreichbar

### **Automatische Deployments:**

Jeder Push zu `main` → Railway deployt automatisch! 🚀

---

## 🆘 **Probleme?**

### **"POS Tagger build failed"**

**Lösung:**
1. Klicke auf POS Tagger Service
2. Gehe zu Deployments
3. Klicke auf das failed Deployment
4. "View Logs" - schau was steht
5. Meist: spaCy Model Problem
6. Fix: Klicke ⋯ → "Redeploy"

---

### **"Frontend can't reach POS Tagger"**

**Check:**
1. `POS_TAGGER_URL=http://pos-tagger:5000` korrekt?
2. Service Name ist wirklich `pos-tagger`?
3. Beide Services im **gleichen Project**?

**Fix:**
1. Variables überprüfen
2. Frontend neu deployen (⋯ → Redeploy)

---

### **"Session not found" Fehler**

**Das passiert NICHT mehr auf Railway!** 
- Railway hat persistenten State ✅
- Im Gegensatz zu Vercel!

---

## 💰 **Kosten**

**Hobby Plan:** Pay-as-you-go
- Frontend: ~$5-7/Monat
- POS Tagger: ~$3-5/Monat
- **Total: ~$8-12/Monat**

**Trial:** $5 Credit (einmalig)

---

## ✅ **Checklist**

- [ ] Railway Account erstellt
- [ ] Project von GitHub erstellt
- [ ] Beide Services hinzugefügt
- [ ] POS Tagger: `pos-tagger`, Root `/pos-tagger`, PORT=5000
- [ ] Frontend: `frontend`, Root `/`, OPENAI_API_KEY + POS_TAGGER_URL
- [ ] Domain generiert
- [ ] Beide deployed (✅ Success)
- [ ] App funktioniert im Browser
- [ ] Vercel Project gelöscht (optional)

---

## 🚀 **Nächste Schritte**

1. **URL teilen** mit Lehrern/Schülern
2. **Feedback sammeln**
3. **Custom Domain** (optional):
   - Settings → Networking → Custom Domain
4. **Monitoring:**
   - Dashboard → Metrics
   - Logs: Deployments → View Logs

**Viel Erfolg! 🎉**

