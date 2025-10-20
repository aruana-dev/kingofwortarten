# ⚡ Quick Start - 5 Minuten zum Live-App

## 🎯 Das Wichtigste zuerst:

1. **Railway Account** → https://railway.app (mit GitHub)
2. **Vercel Account** → https://vercel.com (mit GitHub)
3. **OpenAI API Key** → https://platform.openai.com/api-keys

---

## 🚂 RAILWAY (3 Minuten)

### Web Interface - Einfachste Methode:

1. **Öffne:** https://railway.app
2. **Login** mit GitHub
3. **"New Project"** → **"Deploy from GitHub repo"**
4. **Wähle:** `aruana-dev/kingofwortarten`
5. **Wichtig:** Nur **Python** Service auswählen (Node.js löschen!)
6. **Settings:**
   - Root Directory: `/pos-tagger`
   - Variables: `PORT=5000`
7. **Generate Domain** → URL kopieren!
8. **Warten** bis ✅ Success (3-5 min)

**URL sichern!** Brauchst du für Vercel.

---

## ▲ VERCEL (2 Minuten)

1. **Öffne:** https://vercel.com
2. **Login** mit GitHub
3. **"Add New..."** → **"Project"**
4. **Import:** `aruana-dev/kingofwortarten`
5. **Environment Variables:**
   ```
   OPENAI_API_KEY=sk-proj-...
   POS_TAGGER_URL=https://DEINE-RAILWAY-URL.railway.app
   ```
6. **Deploy!**
7. **Fertig!** 🎉

---

## ✅ Test

Öffne deine Vercel URL:
1. ✅ Lehrer → Session erstellen
2. ✅ Schüler → Beitreten
3. ✅ Spielen!

---

## 🆘 Hilfe?

Siehe: `DEPLOY_INSTRUCTIONS.md` (detailliert)

Oder: https://github.com/aruana-dev/kingofwortarten/issues

