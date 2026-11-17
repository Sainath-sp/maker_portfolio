# maker_portfolio

Sainath Punchbhai's portfolio — plain HTML / CSS / JS, no build step.
A 3D robot arm (three.js) sits in the background and moves as you scroll.

## Run locally
```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Deploy (GitHub Pages)
Repo → **Settings → Pages → Deploy from a branch → `main` / root**.
Live at `https://<your-username>.github.io/maker_portfolio/`

## Things to personalise
| What | Where |
|---|---|
| Instagram link (currently the generic instagram.com) | search `data-todo="instagram"` in `index.html` (2 places) |
| GitHub link | `https://github.com/sainath-sp` in `index.html` (2 places) — change if different |
| Real project photos | In `index.html`, each project has a `.thumb` block — replace its `<svg>` with `<img src="assets/projects/arm.jpg" alt="Robotic arm">` |
| Arm poses per section | `POSES` array in `script.js` |
| Colours | `:root` tokens at the top of `styles.css` (bg, steel, soft, tx, amber, clay) |

## Design rules
- Fonts: **Space Grotesk** (everything) + **JetBrains Mono** (small labels only). Self-hosted in `vendor/`.
- Palette: amber `#F2A33A`, brick `#C4685F`, text `#ECEBEE`, muted `#AAA8AD`, steel `#606467`, surface `#313B44` on `#1C1D22`.
- Every heading highlight uses the same `.hl` gradient; every card title is white `h3`.

## Structure
`index.html` · `styles.css` · `script.js` · `vendor/` (three.js + fonts) · `assets/` (profile, resume, tool logos)
