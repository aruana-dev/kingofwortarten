# 🎨 Design-Dokumentation: Deutsch-Profi

## Konzept

**Deutsch-Profi** ist eine interaktive Lern-App für den Deutschunterricht, inspiriert von Kahoot. Die App ermöglicht es Lehrkräften, spielerische Sessions zu erstellen, bei denen Schüler in Echtzeit Wortarten, Satzglieder oder Fälle bestimmen.

### Kernprinzipien
- **Gamification**: Spielerisches Lernen mit Punktesystem und Rangliste
- **Echtzeit-Interaktion**: Lehrer und Schüler agieren synchron
- **Mobile-First**: Optimiert für Tablets und Smartphones
- **Klarheit**: Intuitive Benutzeroberfläche ohne Ablenkung
- **Barrierefreiheit**: Große Buttons, klare Farbkontraste

---

## Spielvarianten

Die App unterstützt drei verschiedene Lernmodi:

### 1. Wortarten bestimmen
Schüler ordnen Wörter den richtigen Wortarten zu.

### 2. Satzglieder bestimmen
Schüler identifizieren Satzteile und ordnen sie korrekt zu.

### 3. Fall bestimmen
Schüler erkennen den grammatischen Fall von Nomen, Pronomen und Artikeln.

---

## Farbschema

### Primäre Farben
- **Primary (Blau)**: `#3B82F6` (blue-500)
  - Verwendet für: Hauptaktionen, Lehrer-Interface
- **Secondary (Violett)**: `#8B5CF6` (purple-500)
  - Verwendet für: Schüler-Interface, Akzente

### Wortarten-Farben
Jede Wortart hat eine eigene, konsistente Farbe:

| Wortart | Farbe | Hex | Tailwind |
|---------|-------|-----|----------|
| **Nomen** | Blau | `#3B82F6` | `blue-500` |
| **Verben** | Grün | `#10B981` | `green-500` |
| **Adjektive** | Gelb | `#F59E0B` | `yellow-500` |
| **Artikel** | Violett | `#8B5CF6` | `purple-500` |
| **Pronomen** | Pink | `#EC4899` | `pink-500` |
| **Adverbien** | Indigo | `#6366F1` | `indigo-500` |
| **Präpositionen** | Rot | `#EF4444` | `red-500` |
| **Konjunktionen** | Orange | `#F97316` | `orange-500` |
| **Andere Wortart** | Grau | `#6B7280` | `gray-500` |

### Satzglieder-Farben

| Satzglied | Farbe | Hex | Tailwind |
|-----------|-------|-----|----------|
| **Subjekt** | Blau | `#3B82F6` | `blue-500` |
| **Prädikat** | Grün | `#10B981` | `green-500` |
| **Objekt** | Gelb | `#F59E0B` | `yellow-500` |
| **Adverbiale** | Violett | `#8B5CF6` | `purple-500` |
| **Attribut** | Pink | `#EC4899` | `pink-500` |
| **Anderes Satzglied** | Grau | `#6B7280` | `gray-500` |

### Fall-Farben

| Fall | Farbe | Hex | Tailwind |
|------|-------|-----|----------|
| **Nominativ (1. Fall)** | Blau | `#3B82F6` | `blue-500` |
| **Genitiv (2. Fall)** | Grün | `#10B981` | `green-500` |
| **Dativ (3. Fall)** | Gelb | `#F59E0B` | `yellow-500` |
| **Akkusativ (4. Fall)** | Rot | `#EF4444` | `red-500` |
| **Anderer Fall** | Grau | `#6B7280` | `gray-500` |

### Status-Farben
- **Erfolg (Richtig)**: Grün (`green-500`, `#10B981`)
- **Fehler (Falsch)**: Rot (`red-500`, `#EF4444`)
- **Neutral (Andere)**: Gelb (`yellow-500`, `#F59E0B`) mit Fragezeichen-Icon
- **Info**: Blau (`blue-500`, `#3B82F6`)
- **Warnung**: Orange (`orange-500`, `#F97316`)

### Hintergrund & Neutral
- **Background**: Gradient von `primary-50` zu `secondary-50`
- **Card Background**: Weiß (`#FFFFFF`)
- **Text Primary**: `gray-900` (`#111827`)
- **Text Secondary**: `gray-600` (`#4B5563`)
- **Border**: `gray-200` (`#E5E7EB`)

---

## Typografie

### Schriftart
- **Font Family**: Inter (Google Fonts)
- **Subsets**: Latin

### Schriftgrößen
- **H1**: `text-3xl` (30px) - Haupttitel
- **H2**: `text-2xl` (24px) - Untertitel
- **H3**: `text-xl` (20px) - Sektionen
- **H4**: `text-lg` (18px) - Karten-Titel
- **Body**: `text-base` (16px) - Fließtext
- **Small**: `text-sm` (14px) - Hinweise
- **Tiny**: `text-xs` (12px) - Metadaten

### Schriftstärken
- **Light**: `font-light` (300)
- **Normal**: `font-normal` (400)
- **Medium**: `font-medium` (500)
- **Semibold**: `font-semibold` (600)
- **Bold**: `font-bold` (700)

---

## Komponenten

### Buttons

#### Primary Button
```css
bg-primary-600 hover:bg-primary-700 text-white 
font-semibold py-3 px-6 rounded-lg 
transition-colors duration-200
```

#### Secondary Button
```css
bg-white hover:bg-gray-50 text-gray-900 
border-2 border-gray-200 hover:border-gray-300
font-semibold py-3 px-6 rounded-lg 
transition-all duration-200
```

#### Danger Button
```css
bg-red-600 hover:bg-red-700 text-white 
font-semibold py-3 px-6 rounded-lg 
transition-colors duration-200
```

#### Wortart/Satzglied/Fall Button (selektiert)
```css
bg-[color] text-white border-2 border-[color]
p-3 rounded-lg transition-all font-semibold
```

#### Wortart/Satzglied/Fall Button (nicht selektiert)
```css
border-2 border-gray-200 bg-white text-gray-700 
hover:border-gray-300 hover:bg-gray-50
p-3 rounded-lg transition-all font-semibold
```

### Cards
```css
bg-white rounded-xl shadow-md p-6 
border border-gray-100
```

### Input Fields
```css
w-full px-4 py-3 
border-2 border-gray-200 rounded-lg 
focus:border-primary-500 focus:ring-2 focus:ring-primary-200 
transition-all duration-200
```

### Code Display (Session-Code)
```css
text-6xl font-bold tracking-wider 
text-primary-600
```

---

## Icons

Die App verwendet **Lucide React Icons**:

- **Crown** 👑: Logo/Branding
- **BookOpen** 📖: Lehrer-Rolle
- **Users** 👥: Schüler-Rolle
- **CheckCircle** ✓: Richtige Antwort
- **XCircle** ✗: Falsche Antwort
- **HelpCircle** ?: Andere Wortart/Satzglied/Fall
- **Clock**: Timer/Zeitlimit
- **Trophy**: Rangliste

---

## Layout

### Spacing
- **Container**: `max-w-2xl mx-auto` für Config/Session
- **Container**: `max-w-6xl mx-auto` für Game/Results
- **Padding**: `p-4` (Mobile), `p-6` (Desktop)
- **Gap**: 
  - Klein: `gap-2` (8px)
  - Normal: `gap-4` (16px)
  - Groß: `gap-6` (24px)

### Breakpoints (Tailwind Standard)
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

### Grid
- **Config (Wortarten-Auswahl)**: `grid-cols-2` (2 Spalten)
- **Config (Varianten-Auswahl)**: `grid-cols-3` (3 Spalten)
- **Game (Wort-Buttons)**: `grid-cols-2` auf Mobile, `grid-cols-3` auf Desktop

---

## Animationen & Transitions

### Standard Transitions
```css
transition-colors duration-200
transition-all duration-200
```

### Loading Spinner
```css
animate-spin rounded-full h-4 w-4 
border-b-2 border-white
```

### Hover Effects
- **Buttons**: Farbwechsel + leichtes Anheben (`hover:shadow-xl`)
- **Cards**: Schatten-Vergrößerung (`hover:shadow-xl`)

---

## Responsive Design

### Mobile-First Approach
Die App ist primär für mobile Geräte (Tablets, Smartphones) optimiert.

### Anpassungen nach Breakpoint
- **Mobile (< 640px)**:
  - Volle Breite für Buttons
  - 2-Spalten-Grid für Wortarten
  - Kompakte Card-Ansicht
  
- **Tablet (640px - 1024px)**:
  - Optimierte Grid-Layouts
  - Größere Schrift für bessere Lesbarkeit
  
- **Desktop (> 1024px)**:
  - Zentrierte Container mit max-width
  - 3-Spalten-Grid für Wortarten

---

## Barrierefreiheit

### Kontraste
Alle Farbkombinationen erfüllen **WCAG 2.1 Level AA**:
- Weiße Schrift auf farbigem Hintergrund: Mindestens 4.5:1
- Farbige Schrift auf weißem Hintergrund: Mindestens 3:1

### Interaktion
- **Große Touch-Targets**: Mindestens 44x44px
- **Fokus-Indikatoren**: `focus:ring-2 focus:ring-[color]-200`
- **Tastatur-Navigation**: Alle interaktiven Elemente erreichbar

### Semantisches HTML
- Korrekte Verwendung von `<button>`, `<input>`, `<label>`
- Strukturierung mit `<h1>`, `<h2>`, `<h3>`

---

## User Experience

### Feedback-Mechanismen

#### Visuelles Feedback
- **Richtige Antwort**: Grüner Haken + grüner Border
- **Falsche Antwort**: Rotes X + roter Border + Erklärung
- **Andere Wortart**: Gelbes Fragezeichen + Erklärung der korrekten Klassifikation
- **Loading States**: Spinner + "Erstelle Session..." Text

#### Status-Anzeigen
- **Session-Code**: Groß und zentriert (6xl)
- **Spieler-Liste**: Live-Updates via Polling
- **Fortschritt**: "Aufgabe X von Y"
- **Abgabe-Status**: "X von Y Schülern haben abgegeben"

### Doppel-Validierung
- OpenAI prüft jeden Satz **2x**
- Bei Unstimmigkeiten: **3. Prüfung** als Tiebreaker
- Majority Voting für finale Klassifikation

---

## Technische Details

### CSS Framework
**Tailwind CSS 3.3.0**
- Utility-First Approach
- JIT (Just-In-Time) Compiler
- Custom Configuration in `tailwind.config.js`

### Farb-Erweiterungen
```js
colors: {
  primary: colors.blue,
  secondary: colors.purple,
}
```

### Custom CSS
Minimale Custom CSS in `app/globals.css`:
- Reset für konsistentes Rendering
- Utility Classes: `.btn-primary`, `.input-field`, `.card`

---

## Zukünftige Erweiterungen

### Geplante Features
- **Dark Mode**: Alternative Farbschemata für Nachtmodus
- **Themes**: Anpassbare Farbschemata für verschiedene Schulen
- **Accessibility Mode**: Hochkontrast-Modus für Sehbehinderte
- **Animationen**: Subtile Micro-Interactions für besseres Feedback

### Design-Optimierungen
- **Illustrations**: Eigene Icons/Illustrationen für Wortarten
- **Sound Effects**: Audio-Feedback für richtige/falsche Antworten
- **Progress Bar**: Visuelle Fortschrittsanzeige während des Spiels
- **Konfetti-Animation**: Bei erfolgreichem Abschluss

---

## Branding

### Logo
👑 **Crown Icon** (Lucide React)
- Symbolisiert "Profi" und "Meisterschaft"
- Konsistente Verwendung auf allen Seiten

### Farbidentität
- **Primär**: Blau - Vertrauen, Intelligenz, Lernen
- **Sekundär**: Violett - Kreativität, Inspiration
- **Akzent**: Grün - Erfolg, Wachstum

### Tone of Voice
- **Freundlich**: "Lerne spielerisch"
- **Motivierend**: "Werde zum Deutsch-Profi"
- **Klar**: Präzise Anweisungen und Erklärungen

---

**Version**: 1.0  
**Letzte Aktualisierung**: Oktober 2025  
**Autor**: Deutsch-Profi Team

