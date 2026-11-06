# Raad het Nummer 🎵

Een muziekquiz in de stijl van Songless: je hoort eerst 0,1 seconde van een nummer.
Raad je het niet of sla je over, dan hoor je een langer stuk (0,1s → 0,5s → 2s → 4s → 8s → 16s).
Je hebt 6 pogingen en kunt eindeloos doorspelen.

## Functies
- 9 vaste categorieën plus "Alles door elkaar"
- Zoekveld met suggesties (je kiest altijd een nummer uit de lijst)
- 🟨 als je de goede artiest hebt maar het verkeerde nummer
- Statistieken per categorie: gespeeld, % geraden, reeks, beste reeks, verdeling per poging
- Resultaat delen met emoji-blokjes
- Geen herhalingen tot alle nummers in een categorie geweest zijn
- Links naar Spotify, Apple Music en YouTube na elke ronde
- Spatiebalk = afspelen, werkt op mobiel en desktop

## Hoe het werkt
Pure HTML/CSS/JavaScript, geen build-stap en geen server nodig.
De 30-seconden-previews worden in de browser van de speler opgehaald via de gratis
iTunes Search API (met Deezer als reserve). Er is geen API-key nodig.

## Nummers aanpassen
Alle categorieën staan in `js/songs.js`, één nummer per regel als `Artiest — Titel`
(let op: lang streepje `—`). Nieuwe categorie toevoegen = nieuw blok in die lijst.

## Lokaal draaien
```bash
python3 -m http.server 8000
```
en open http://localhost:8000.

## Online zetten
Upload de bestanden naar elke statische hosting (eigen domein, Netlify, Vercel, Cloudflare Pages of GitHub Pages).
