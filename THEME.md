# HobbyQuest — Neon Atlas

## Direction

A modern, immersive curiosity interface. Midnight surfaces, clean sans-serif typography, luminous cyan and violet accents, and an interactive constellation. Keep open-ended exploration and the user's saved interests as the focus.

## Visual foundations

| Role | Value |
| --- | --- |
| Background | `#070914` |
| Surface | `#101423` |
| Main text | `#f2f4ff` |
| Secondary text | `#a0a8c2` |
| Cyan accent | `#70efff` |
| Violet accent | `#a590ff` |
| Border | `#252b43` |
| Type | Local Segoe UI Variable / Segoe UI / Arial |

Use neon for interaction, emphasis, and diagrams. Body text stays clear without glow. Cards and controls use 7–14px rounded corners and thin luminous borders. Topic artwork is native SVG, so there are no paid image assets or external downloads.

## Interaction language

- A soft cyan/violet aura follows the pointer.
- Cards and controls reveal local light under the cursor; cards tilt by at most 2.5 degrees per axis.
- Background particles form faint connections near the pointer.
- The hero constellation shifts subtly, and its labelled nodes open real interest spaces.
- Keyboard focus uses a visible cyan outline.
- Save feedback appears inside an open interest dialog.

## Motion and accessibility

- Keep the native cursor and normal scrolling.
- Offer a persistent Motion on/off control.
- Respect the operating system's reduced-motion setting.
- Touch devices get the same controls and visual identity without pointer-only effects.
- Pause particle animation when the page is hidden; cap canvas pixel density at 1.5.
- Keep decorative SVG and canvas out of the accessibility tree.

The visual update does not change the interest storage key, note format, topic coverage, or AI capabilities. Live AI is not connected.
