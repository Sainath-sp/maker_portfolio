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
| Colours | `:root` tokens at the top of `styles.css` (green, yellow, red, blue) |

## Design rules
- Fonts: **Space Grotesk** (everything) + **JetBrains Mono** (small labels only). Self-hosted in `vendor/`.
- Palette: green `#2BFF88`, yellow `#FFD23F`, red `#FF4D6D`, blue `#2E9BFF`, white `#F4F7FB` on `#06080D`.
- Every heading highlight uses the same `.hl` gradient; every card title is white `h3`.

## Structure
`index.html` · `styles.css` · `script.js` · `vendor/` (three.js + fonts) · `assets/` (profile, resume, tool logos)
