# OpenClaw Layer Probe

A blueprint layer folder for the **OpenClaw** engine, using the *read path*: the
`agent-spaces.md` in this folder is the definition.

## Files

| File | Why it's here |
| --- | --- |
| `agent-spaces.md` | The declared definition. |
| `package.json` | `scripts.start` → `node index.js`, plus one real dependency (`dayjs`). |
| `index.js` | Prints the marker `OPENCLAW-LAYER-OK` and exits 0. |
| `README.md` | This file. |

## Constraints this folder respects

- 4 files, well under the 60-file / 1 MB per-folder cap.
- Node-only entrypoint.
- No secrets. `{{llmApiKey}}` is a platform-filled placeholder, and the gateway
  token variable is not named anywhere in this folder — by rule it must not
  appear in a document at all.

## What the definition is set up to exercise

- **`brain: openclaw` overriding the radio.** This is by design and worth
  testing deliberately: select *Hermes* in the pane and confirm you still get an
  OpenClaw container.
- **Single-provider config.** `llmProvider` with `enumValues: [requesty]` and
  `value: requesty`, plus `llmModel` as a Requesty id spelled with dashes.
- **One-line environment.** `CUSTOM_API_KEY: '{{llmApiKey}}'` and nothing else —
  no router block here.
- **No Hermes vocabulary.** `## Runtime` has `defaultModel` only; `toolsets` is
  Hermes-only, and there is no `## Schedule`.
- **The mandatory `## Setup` block.** Without those three lines the container
  comes up with no model and a gateway that won't start.
- **Read-only layer.** The soul runs the entrypoint from `{{home}}/layer`, tries
  to write there, fails, and relocates.

`{{home}}` is `/home/node/.openclaw` on OpenClaw. The soul goes to
`workspace/AGENTS.md`, and the agent's own writes belong in `{{home}}/workspace`.

## ⚠️ Two things to verify before your first run

1. **The `## Setup` block was reconstructed, not copied.** The canonical source
   is `headless-service/src/blueprints/definitions/openclaw.md`, which is not in
   this repo. Diff the three lines in `agent-spaces.md` against that file and fix
   any drift — especially the `openclaw onboard …` flags.
2. **Model id spelling.** The definition uses `vertex/gemini-3-8-flash` (dashes,
   per the Requesty id convention). The live-testing note writes it as
   `vertex/gemini-3.8-flash`. Confirm which form the router accepts and make
   `llmModel` and `defaultModel` match it.
