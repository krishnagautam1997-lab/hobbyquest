# HobbyQuest text AI beta

Frontend: GitHub Pages in the founder-owned `krishnagautam1997-lab/hobbyquest` repository. Backend: Cloudflare Worker `hobbyquest-ai`, deployed through the account dashboard. The matching source is `worker.mjs`; `wrangler.jsonc` records its bindings for reproducibility. No Cloudflare or AI API token is needed in the browser or this repository. GitHub Pages deploys automatically; the Worker is currently deployed separately through the dashboard. Changes to this folder alone do not redeploy Cloudflare.

## Zero-cash guardrail

Keep the account on **Workers Free**, without paid upgrade, prepaid gateway credits, paid models, or automatic provider fallback. Workers AI's free allowance is 10,000 Neurons per account per day, resetting at 00:00 UTC. Free-plan excess operations fail. The source does not control the account's billing plan: upgrading the account later would remove this financial protection. The 360-output-token cap and rate limiter are usage controls, not hard spending caps.

Verified official references, 17 October 2026:

- [AI pricing and free quota](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- [Workers pricing and Free default](https://developers.cloudflare.com/workers/platform/pricing/)
- [Selected model and response schema](https://developers.cloudflare.com/workers-ai/models/llama-3.1-8b-instruct-fp8/)
- [Binding API](https://developers.cloudflare.com/workers-ai/configuration/bindings/)
- [Rate limiter configuration and limitations](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
- [Provider content/metadata policy](https://developers.cloudflare.com/workers-ai/platform/data-usage/)

## Deployment configuration

Worker bindings: Workers AI named `AI`, and rate limiter named `CHAT_LIMITER`, namespace `1001`, limit `5`, period `60`. Match `wrangler.jsonc`. Both are required; absent bindings fail closed before inference. Dashboard: edit the Worker source with the complete contents of `worker.mjs`, deploy, and configure bindings in Settings. Do not paste private notes or secrets into source.

GET `/` returns a non-sensitive readiness response without AI inference. POST `/chat` accepts `{topic,messages}` from the exact production GitHub Pages origin only. The browser sends no cookies. The server validates the actual byte size, topic, message count, alternating roles, individual message sizes, and overall context before calling the fixed model. There are no tools, arbitrary upstream requests, dynamic model selection, prompt logging, or raw error returns. Responses are not cached. A 30-second response deadline does not guarantee cancellation of underlying inference.

## Prototype security limits

This is a small guest beta, **not authenticated production access**. Origin/CORS checks do not prevent a non-browser client from forging the Origin header. Rate limits are per Cloudflare location and eventually consistent, not globally exact. We use the Cloudflare-provided connecting IP because guests have no authenticated identity; people sharing a network may share the approximately five-questions/minute limit. Changing networks or distributed abuse can still exhaust the shared free AI quota. The code does not retain or log IP addresses; Cloudflare's rate limiter and platform process them. Before a larger public launch, add verified abuse protection, authenticated fair-use controls, and operational monitoring. Never advertise unlimited free AI.

## Guest conversations and privacy

`hobbyquest.conversations.v1` holds up to 50 interest threads and the latest 10 complete exchanges per thread in this browser. Sending explicitly shares the interest title, question, and at most three recent exchanges from this interest with Cloudflare Workers AI. The UI requires an acknowledgement first and links the provider data policy. Old atlas notes and other interest chats are never attached. Replies are rendered with `textContent`, not HTML. Failed questions remain in the input for manual retry; no automatic retries consume quota. Storage failures show a session-only warning. Resetting one chat requires confirmation and leaves atlas notes, saved stories, and other chats untouched.

This is bounded conversation context, not secure cross-device accounts, semantic long-term memory, a cloud backup, a live web search service, or verified current information. Sensitive personal details, credentials, and high-stakes decisions do not belong in this beta.

## Verification

Run `node tests/chat.cjs` and `node tests/worker.mjs` from the repository root, plus the existing regression/world/motion/globe/scroll tests. These use deterministic mocks, not billable inference. Then verify the deployed site with a small number of non-sensitive questions, a follow-up, a second interest, refresh, and mobile layout. Do not repeatedly test the real endpoint to exhaustion.
