# Regenesy Flux

Design system "vivo" per acqua, gas ed elettrico: componenti custom fatti con SVG, CSS e JavaScript,
senza librerie UI, alimentati da dati simulati in tempo reale.

## Avvio in locale

Dalla cartella `regenesy-ds`:

```bash
python3 serve.py
```

Poi apri http://localhost:8780. `serve.py` è come `python3 -m http.server` ma senza cache,
così ogni modifica ai file si vede ricaricando la pagina.

## Sezioni

- **Home** — palco live, i tre settori affiancati, prova degli stili.
- **Componenti** — galleria live: 23 componenti custom + UI di base, filtri, preferiti (export Markdown/JSON),
  codice e vista ingrandita.
- **Confronta** — lo stesso componente in più stili × settori × modalità, o combinazioni salvate, affiancati.
- **POC** — tre prodotti finiti: AquaSense (acqua), GasLink (gas), VoltGrid (elettrico), con "Simula un evento"
  e schermo intero.
- **Studio temi** — combina stile, settore, modalità e regolazioni; salva, rinomina, confronta, esporta (CSS/JSON) e importa.
- **Centro di controllo** (icona in alto a destra) — tutto a portata: settore, stile, modalità, live (pausa, velocità),
  angoli, bagliore, densità, vetro, animazioni, accento personale, simulazione eventi.
- **⌘K / Ctrl+K** — ricerca globale di pagine, componenti e stili.

## Temi combinabili

Stile (Cupertino, Aurora Glass, Neon Control, Carta, Soft UI) × Settore (colori d'accento acqua/gas/elettrico)
× Modalità (chiaro, scuro, automatica) × regolazioni. Tutto diventa variabili CSS (`--bg`, `--surface`, `--acc`, `--r`, …):
i componenti leggono solo quelle.

## Componenti

Sono custom elements (`<rg-odometer>`, `<rg-network>`, …): funzionano in HTML puro e in Angular 22
(con `CUSTOM_ELEMENTS_SCHEMA`). Ogni componente accetta `utility="water|gas|power"`, altrimenti segue la pagina.

| File | Componenti |
| --- | --- |
| `js/components/numbers.js` | totalizzatore meccanico, numero vivo, quadrante del contatore |
| `js/components/gauges.js` | arco con lancetta a molla, anelli, serbatoio vivo, matrice a punti |
| `js/components/charts.js` | flusso in tempo reale, orologio dei consumi, mappa di calore, bilancio a flussi, classifica in corsa, previsione |
| `js/components/twin.js` | rete viva, mappa isometrica 3D, radar delle anomalie, battito della rete |
| `js/components/experience.js` | Dynamic Island, carta olografica, macchina del tempo, controlli fluidi, command palette, fasori trifase |

Altri file: `js/live.js` (dati simulati e eventi), `js/theme.js` (stili e variabili), `js/store.js` (stato salvato nel browser),
`css/flux.css` (componenti), `css/site.css` (il sito).

La versione precedente del sito è in `../archivio/regenesy-ds-v1`.
