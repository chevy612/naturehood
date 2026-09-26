# NATUREHOOD Brand Design System

Single source of truth for the NATUREHOOD brand across web, mobile, and social media.

## Structure

```
brand/
├── tokens/           # Platform-agnostic design tokens (JSON)
│   ├── colors.json
│   ├── typography.json
│   ├── spacing.json
│   ├── radii.json
│   └── motion.json
├── guidelines/       # Brand rules and usage documentation
│   ├── themes.md     # Marketing (light) vs Platform (dark)
│   ├── components.md # Button, card, tag, avatar patterns
│   └── photography.md # Image style, overlays, aspect ratios
├── assets/           # Asset inventory
├── scripts/          # Build scripts for platform-specific tokens
└── README.md         # This file
```

## Quick Start

### For developers (Claude Code)

Use the `/brand` command to load design context during development:

```
/brand           # Full overview
/brand colors    # Color palette with usage rules
/brand typography # Font system and type scale
/brand check     # Audit current file for brand compliance
```

### Edit tokens

1. Edit the relevant JSON file in `brand/tokens/`
2. Run `npm run brand:build` from `my-app/` to regenerate platform tokens
3. Run `npm run brand:validate` to verify sync

**Never edit generated files directly:**
- `my-app/app/components/ui/tokens.ts` (web)

### Build commands

| Command | What it does |
|---|---|
| `npm run brand:build` | Regenerate web tokens from JSON source |
| `npm run brand:build:web` | Regenerate web tokens only |
| `npm run brand:validate` | Verify all tokens are in sync |

## Font System

**2-font system** (Inter has been removed):

| Font | Use |
|---|---|
| **Sk Modernist** | Display headings — hero, h1, h2 |
| **DM Sans** | Everything else — h3, body, buttons, labels, nav, forms |

## Figma Setup (Free)

1. Create a free Figma account at [figma.com](https://figma.com)
2. Create a new file: "NATUREHOOD Design System"
3. Install the **Tokens Studio** plugin (free) from the Figma Community
4. In Tokens Studio, add a new token source pointing to your `brand/tokens/` directory
5. Sync — the plugin reads the JSON and creates Figma styles/variables automatically

**Sync flow:** Edit `brand/tokens/*.json` → `npm run brand:build` → re-sync in Tokens Studio
