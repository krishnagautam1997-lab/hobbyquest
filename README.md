# HobbyQuest — Get into anything

[Open the live prototype](https://krishnagautam1997-lab.github.io/hobbyquest/)

A guest-first interest discovery prototype with a founder-selected crimson-neon identity. Source: krishnagautam1997-lab/hobbyquest. GitHub Pages publishes from main/root. No paid API or service is connected.

## Working features

- Spacious vertical homepage with horizontal topic collections, touch scrolling, arrows, and keyboard scrolling.
- Any-topic entry. Curated topics receive original images and example guides. Unknown topics receive a labelled decorative cover and reflection framework.
- Saved interests and separate notes, including compatibility with interests saved before this redesign.
- Discovery collections, unique world counts, current saved-interest counts, and optional badges based on real local actions.
- Crimson cursor glow, particle connections, card response, and hero parallax; motion toggle, reduced-motion handling, and touch fallback.
- A visible Sign in entry that clearly explains account syncing is not connected yet.

## Future work

Live text AI, arbitrary-topic image lookup, secure accounts and guest-data migration, cross-device interest memories, full scrolling world pages and story saves, photo and voice input. Current guides are static examples, not live AI responses.

## Guest storage

hobbyquest.atlas.v1 stores saved IDs, titles and notes. hobbyquest.progress.v1 stores unique explored IDs and explicitly collected discoveries. hobbyquest.motion.v1 stores the motion preference. These are browser-local records, not cloud accounts. Clearing browser data removes them. Other browsers/devices do not share them. Unavailable storage produces visible session-only feedback.

## Run locally

Open index.html with the other files and assets kept together, or run `node server.mjs` for a local-only preview at http://127.0.0.1:4173. Ctrl+C stops it. Google Fonts needs a connection; local fallbacks are provided.

See THEME.md for design rules and ASSETS.md for original artwork and generation briefs. Internal research stays outside this public repository. Do not commit secrets or enable paid services under the strict initial $0 cash budget.

