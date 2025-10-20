# ✅ Deployment Checklist

Drucke diese Seite aus oder öffne sie parallel beim Deployment!

---

## 🎯 VOR dem Deployment

- [ ] GitHub Repository ist aktuell (letzter Commit: pushed)
- [ ] OpenAI API Key bereit (https://platform.openai.com/api-keys)
- [ ] Railway Account erstellt (https://railway.app)
- [ ] Vercel Account erstellt (https://vercel.com)

---

## 🚂 RAILWAY - POS Tagger Backend

### Setup (5 Minuten)

- [ ] 1. Railway.app öffnen
- [ ] 2. "New Project" klicken
- [ ] 3. "Deploy from GitHub repo" wählen
- [ ] 4. Repository `aruana-dev/kingofwortarten` auswählen
- [ ] 5. **NUR Python Service** auswählen (Node.js löschen!)
- [ ] 6. Service umbenennen zu: `pos-tagger`

### Configuration

- [ ] 7. Settings → Root Directory: `/pos-tagger`
- [ ] 8. Variables → `PORT=5000` hinzufügen
- [ ] 9. Variables → `PYTHON_VERSION=3.11` hinzufügen
- [ ] 10. Networking → "Generate Domain" klicken
- [ ] 11. **URL NOTIEREN:** _________________________________

### Verify

- [ ] 12. Warten bis Deployment: ✅ Success
- [ ] 13. URL im Browser öffnen: `/health`
- [ ] 14. Response prüfen: `{"status": "ok"}`

---

## ▲ VERCEL - Frontend

### Setup (3 Minuten)

- [ ] 1. Vercel.com öffnen
- [ ] 2. "Add New..." → "Project"
- [ ] 3. "Import Git Repository"
- [ ] 4. Repository `aruana-dev/kingofwortarten` auswählen
- [ ] 5. "Import" klicken

### Configuration

Framework: Next.js ✅ (automatisch erkannt)

- [ ] 6. "Environment Variables" ausklappen

### Environment Variables

Variable 1:
- [ ] 7. Name: `OPENAI_API_KEY`
- [ ] 8. Value: `sk-proj-...` (dein OpenAI Key)

Variable 2:
- [ ] 9. Name: `POS_TAGGER_URL`
- [ ] 10. Value: `https://...railway.app` (von Railway!)

### Deploy

- [ ] 11. "Deploy" Button klicken
- [ ] 12. Warten (2-3 Minuten)
- [ ] 13. **URL NOTIEREN:** _________________________________

---

## 🧪 TESTING

### Basis-Test

- [ ] 1. Vercel URL im Browser öffnen
- [ ] 2. "Lehrer" auswählen
- [ ] 3. Wortarten auswählen (z.B. Nomen, Verben)
- [ ] 4. "Session erstellen" klicken
- [ ] 5. Warten (kann 10-30 Sek. dauern beim ersten Mal)
- [ ] 6. Session-Code erscheint? ✅

### Schüler-Test

- [ ] 7. Neues Browser-Tab öffnen (Incognito)
- [ ] 8. Vercel URL öffnen
- [ ] 9. "Schüler" auswählen
- [ ] 10. Session-Code eingeben
- [ ] 11. Nickname eingeben
- [ ] 12. "Beitreten" klicken
- [ ] 13. Erscheint in Lehrer-Liste? ✅

### Spiel-Test

- [ ] 14. Als Lehrer: "Spiel starten" klicken
- [ ] 15. Als Schüler: Aufgabe erscheint? ✅
- [ ] 16. Als Schüler: Wort anklicken → Container erscheinen? ✅
- [ ] 17. Als Schüler: Wort zuordnen → Feedback? ✅
- [ ] 18. Als Schüler: "Abgeben" klicken
- [ ] 19. Als Lehrer: "1/1 abgegeben" erscheint? ✅
- [ ] 20. Als Lehrer: Lösungen werden angezeigt? ✅
- [ ] 21. Als Lehrer: "Nächste Aufgabe" klicken
- [ ] 22. Als Schüler: Neue Aufgabe erscheint? ✅
- [ ] 23. Leaderboard zeigt Punkte? ✅

### Multi-Task Test

- [ ] 24. Alle Aufgaben durchspielen
- [ ] 25. Am Ende: Rangliste erscheint? ✅

---

## 🎉 FERTIG!

### URLs notiert?

- **Frontend:** https://_____________________
- **Backend:** https://_____________________

### Nächste Schritte:

- [ ] URLs mit Kollegen teilen
- [ ] Mit echten Schülern testen
- [ ] Feedback sammeln
- [ ] Custom Domain einrichten (optional)

---

## 🆘 PROBLEME?

### Railway Deployment failed

→ `DEPLOY_INSTRUCTIONS.md` Sektion "Fehlerbehebung"

### Vercel Build Error

→ Settings → Root Directory überprüfen (`./`)

### POS Tagger nicht erreichbar

→ Railway Logs checken: Dashboard → Service → Logs

### OpenAI Error

→ API Key überprüfen
→ Credits auf OpenAI Dashboard checken

---

## 📞 Support

**GitHub Issues:**
https://github.com/aruana-dev/kingofwortarten/issues

**Dokumentation:**
- Quick Start: `QUICKSTART.md`
- Detailliert: `DEPLOY_INSTRUCTIONS.md`
- Troubleshooting: Siehe beide Docs

---

**Viel Erfolg! 🚀**

