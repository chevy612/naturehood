# Naturehood Content Engine — Split Plan

Goal: separate marketing/content creation from product development, with a Claude Code-driven engine that outputs SVGs editable in Figma/Illustrator.

## Where each thing lives

| Layer | Tool | Why |
|---|---|---|
| Content engine (source) | Local git repo `~/Developer/naturehood-content` | Claude Code needs local files; git gives history/rollback. **Do not put the repo in Google Drive** — Drive sync corrupts `.git` and chokes on `node_modules`. Push to a private GitHub repo for backup/sharing. |
| Finished assets (distribution) | Google Drive team space | Team-facing layer. A `Naturehood Content/` folder with exported SVG/PNG/PDF, organized by campaign. The engine publishes here via a script. |
| Briefs + calendar (planning) | Notion | Content calendar database: brief, format, deadline, status, link to Drive asset. Claude reads briefs via the Notion connector and updates status when assets ship. |

Flow: **Notion brief → Claude Code generates SVG → edit in Figma if needed → export → publish to Drive → mark done in Notion.**

## Repo structure

```
naturehood-content/
├── CLAUDE.md              # brand rules + SVG conventions for Claude
├── brand/                 # SYNCED from NATUREHOOD/brand — never edit here
│   ├── tokens/            # colors, typography, spacing (JSON)
│   ├── guidelines/
│   └── assets/            # logos, fonts
├── templates/             # reusable SVG bases
│   ├── ig-post-1080.svg       (1080×1080)
│   ├── ig-story-1080x1920.svg
│   ├── event-poster-a3.svg
│   └── appstore-screenshot.svg
├── content/               # generated work, by campaign
│   └── 2026/08-<campaign>/
├── scripts/
│   ├── sync-brand.sh      # pull tokens/guidelines/assets from NATUREHOOD/brand
│   ├── export.ts          # SVG → PNG/PDF (sharp or resvg)
│   └── publish.sh         # copy exports to the Drive-synced folder
└── out/                   # rendered exports (gitignored)
```

## SVG conventions (so files open cleanly in Figma/Illustrator)

- Keep text as `<text>` elements with `font-family="Sk Modernist"` / `"DM Sans"` — never outline to paths. Figma matches installed fonts by name.
- Inline all styling as attributes (`fill`, `font-size`), no `<style>` blocks or CSS classes — these import unreliably.
- Use `id` on every group (`id="headline"`, `id="logo"`) — ids become layer names in Figma.
- `viewBox` = final artboard size; one artboard per file.
- Photos: use a named placeholder `<rect>` (swap in Figma) or base64-embed — linked `<image href>` won't import.
- Colors only from `brand/tokens/colors.json` (lime `#D8FF3E`-family accent, ink `#141115`, cloud `#F5F5F5` — exact values from tokens).

## Brand sync (one-way)

`sync-brand.sh` copies `NATUREHOOD/brand/{tokens,guidelines,assets}` into the content repo. NATUREHOOD/brand stays the single source of truth; run sync after any token change. Later, if brand churn grows, extract `brand/` into its own repo pulled by all three consumers (my-app, mobile, content).

## Migration

1. Scaffold `naturehood-content` repo (structure above + CLAUDE.md).
2. Move `naturehood-mobile/design/` out of the app repo: `appstore-*.svg` and `moodboard-ref/` → content repo; reconcile `design/tokens.json` against `brand/tokens/`. Delete `design/` from the mobile repo.
3. Keep true app assets (icons, splash, fonts) in the app repos — those are product, not content.
4. Write content-repo CLAUDE.md: brand token paths, SVG conventions, template usage, "always start from a template" rule.
5. Set up Drive folder (`Naturehood Content/` with `01-Templates`, campaigns by month) + Notion content calendar DB.
6. First run: pick a real brief, generate, round-trip through Figma, publish — fix conventions where the import breaks.

## What this buys you

- Product repos stop accumulating marketing files; content work never touches app code review.
- Brand consistency enforced by tokens + CLAUDE.md, not memory.
- Team sees only Drive + Notion; the engine is your (git-backed) workshop.
