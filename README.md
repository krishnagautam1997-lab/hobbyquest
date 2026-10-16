# HobbyQuest — Day 1

A local prototype of your Curiosity Atlas. No installation, API key, paid service, or external library is required for this version.

## Try it

Open `index.html` in a modern browser. All three app files (`index.html`, `styles.css`, `app.js`) must stay in the same folder.

If Node.js is installed, `node server.mjs` starts an optional preview at http://127.0.0.1:4173. Keep that terminal open while using the preview; Ctrl+C stops it. The server accepts connections only from this computer.

Try entering an interest, saving it, and adding a note. Then open another interest to see that its notes are separate. Return to My atlas to resume an interest.

## What works

- Dark, responsive Curiosity Atlas interface with guest access.
- Any typed topic can have its own interest space; example cards are starting points, not a topic restriction.
- Conversation Ready and deeper-exploration examples for four topics.
- Saved interests and separate notes for each interest in this browser.
- Keyboard navigation, accessible dialog tabs, and reduced-motion support.

## What comes later

This is a design and interaction prototype, not a live AI product. The four included topic explanations are written examples. Other topics show a general reflection framework, not generated knowledge. No live AI chat, photo understanding, voice input, personalized recommendations, account registration, or cloud synchronization is connected.

Notes are the first building block for separate interest memories; automatic conversational AI memory is not implemented. Browser storage is not an account or backup. Clearing browser data removes saved interests. Storage belongs to the current browser address: file mode and the optional local server do not share an atlas. Private browsing or browser settings can prevent persistence.

## Ownership and budget

Source repository: [krishnagautam1997-lab/hobbyquest](https://github.com/krishnagautam1997-lab/hobbyquest). The repository is currently public. The app code and this setup guide are included; internal research and founder notes are kept outside this repository.

This version sends no data to AI providers and incurs no application service charges. Before adding hosted services or AI, verify current free allowances and spending controls. Do not enable billing, paid trials, or automatic paid upgrades under the $0 budget.

Next increment: review the interface and agree on one real text conversation flow before adding photo, voice, registration, or cloud memory.

## Verification

JavaScript syntax checks passed. Automated logic checks passed for arbitrary topics, separate notes, persistence after reloading, case-insensitive topic lookup, protection against accidentally removing notes, safe display of user text, tab keyboard navigation, blank inputs, and unavailable or corrupt browser storage.

The environment blocked local preview connections, so browser appearance, native dialog behavior, and responsive layout have not yet been visually verified. These are the first things to check when opening the prototype in your browser.
