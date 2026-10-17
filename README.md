# HobbyQuest — Get into anything

[Open the live prototype](https://krishnagautam1997-lab.github.io/hobbyquest/)

A guest-first interest discovery prototype with a founder-selected crimson-neon identity. Source: krishnagautam1997-lab/hobbyquest. GitHub Pages publishes from main/root. Live text AI uses a separate Cloudflare Worker on Workers Free. No paid plan, provider fallback, or browser API key is enabled.

## Working features

- Live text AI Guide for virtually any interest, follow-up conversation, and separate browser-local threads. F1 and other topic panels have contextual AI entry buttons. Requests are explicit and require acknowledging the provider/privacy notice. Atlas notes are never automatically sent. The latest 10 exchanges per interest are retained; at most 3 recent exchanges are sent as context. See backend/README.md for configuration and limits.

- Spacious vertical homepage with horizontal topic collections, touch scrolling, arrows, and keyboard scrolling.
- Any-topic entry. Curated topics receive original images and example guides. Unknown topics receive a labelled decorative cover and reflection framework.
- Saved interests and separate notes, including compatibility with interests saved before this redesign.
- Discovery collections, unique world counts, current saved-interest counts, and optional badges based on real local actions.
- Crimson cursor glow, particle connections, card response, and hero parallax; motion toggle, reduced-motion handling, and touch fallback.
- A visible Sign in entry that clearly explains account syncing is not connected yet.
- A round red Earth with actual spherical surface projection and slow rotation; a round CSS fallback remains if WebGL is unavailable. Rotation stops when motion is off/reduced, the globe is offscreen, a reading dialog is open, or the tab is hidden.
- A Patek Philippe Nautilus-inspired illustrative Watches cover. Not an official product photograph or brand affiliation.
- First full scrolling topic world: [Formula 1](https://krishnagautam1997-lab.github.io/hobbyquest/#world/f1), with Conversation Ready and rivalries, people, engineering, and history sections. Eight prepared stories include primary-source links, explicit story-saving, and F1-only notes.
- Saved stories appear both in the F1 collection and My Atlas, independently of world saves and notes. Direct world links, refresh, Back navigation, unsaved-note draft retention, and refresh warnings are supported.
- Scroll-linked hero zoom-out/section zoom-in, with no scroll hijacking, plus bolder Space Grotesk headings and labels. Motion off/reduced motion disables scroll effects; reading dialogs and notes remain calm.

## Future work

Arbitrary-topic image lookup, secure accounts and guest-data migration, cross-device interest memories, scrolling world pages for additional topics, photo and voice input. Current story guides remain prepared examples. The separately labelled AI Guide generates live text but has no web search or live race feed and can be inaccurate or outdated.

## Guest storage

hobbyquest.atlas.v1 stores saved IDs, titles and notes. hobbyquest.progress.v1 stores unique explored IDs and explicitly collected discoveries. hobbyquest.stories.v1 stores explicitly saved story IDs. hobbyquest.motion.v1 stores the motion preference. These are browser-local records, not cloud accounts or GitHub backups. Clearing browser data removes them. Other browsers/devices do not share them. Unavailable storage produces visible session-only feedback. Stories and interest records use separate storage keys; removing a story never clears world notes.

## Run locally

Open index.html with the other files and assets kept together, or run `node server.mjs` for a local-only preview at http://127.0.0.1:4173. Ctrl+C stops it. Google Fonts needs a connection; local fallbacks are provided.

See THEME.md for design rules and ASSETS.md for original artwork and generation briefs. Internal research stays outside this public repository. Do not commit secrets or enable paid services under the strict initial $0 cash budget.

## Checks for maintainers

The dependency-free Node checks are `node tests/regression.cjs`, `node tests/world.cjs`, `node tests/atmosphere.cjs`, `node tests/globe.cjs`, `node tests/scroll.cjs`, `node tests/chat.cjs`, and `node tests/worker.mjs`. They cover storage compatibility, prepared worlds, routing, separate stories/notes/chats, motion, privacy boundaries, bounded context, safe rendering, retries/errors, backend validation, and rate-limiter/binding guards. They do not replace live desktop/mobile visual and actual provider/GPU checks.

