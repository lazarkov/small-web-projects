# Blueprint layer test status

Scratchpad for live blueprint runs against the `hermes/` and `openclaw/` layer
folders in this repo. Record what you actually saw — exact marker lines, exact
error text. Leave rows unfilled rather than guessing.

## Ground rules

- **Throttling:** creates and chats cap at 5/min. Space them 13–16 s apart.
- **`AGENT_BUSY` after 120 s:** do not re-send. Read
  `GET /api/agents/:id/chat/history?limit=4` instead.
- **Cleanup:** delete every agent in a `finally`. The last agent on a host takes
  the host with it — sequence deletions accordingly.
- **Models:** Hermes → a free model (`google/gemma-4-31b-it` or
  `mistral/leanstral-1-5`). OpenClaw → `vertex/gemini-3.8-flash`.

## Runs

The full matrix in `docs/BLUEPRINT_LIVE_TESTING.md` is six creates: a
`generated/` folder on each engine, plus each declared folder. This repo covers
the two declared folders; add `generated/` rows if you add that folder.

| # | Folder | Engine picked in pane | Engine actually got | Agent id | Result |
| --- | --- | --- | --- | --- | --- |
| 1 | `hermes/` | Hermes | | | |
| 2 | `openclaw/` | OpenClaw | | | |
| 3 | `openclaw/` | Hermes (expect `brain:` override → OpenClaw) | | | |

### Per-run checklist

For each agent, ask it to run its entrypoint from `{{home}}/layer` and then try
writing a file there.

- [ ] `ls` of `{{home}}/layer` shows the copied folder
- [ ] `npm start` prints the marker (`HERMES-LAYER-OK` / `OPENCLAW-LAYER-OK`)
- [ ] write into `{{home}}/layer` fails read-only — record the exact error
- [ ] agent relocates to the writable home (`/opt/data` on Hermes,
      `/home/node/.openclaw/workspace` on OpenClaw)
- [ ] agent deleted

### Hermes-specific

- [ ] Returned text shows an **injected** layer pin: resolved sha + `install: none`
      (because `layer:` is omitted from the definition)
- [ ] `## Schedule` accepted
- [ ] Soul landed in `SOUL.md`

### OpenClaw-specific

- [ ] `brain: openclaw` overrode the radio (run 3)
- [ ] `## Setup` ran: model is configured and the gateway started
- [ ] Soul landed in `workspace/AGENTS.md`

## Observations

_Fill in._

## Open questions carried in from setup

1. The `## Setup` block in `openclaw/agent-spaces.md` was reconstructed from
   prose, not copied from
   `headless-service/src/blueprints/definitions/openclaw.md` (not present in this
   repo). Verify verbatim.
2. Requesty model id spelling: `vertex/gemini-3-8-flash` vs
   `vertex/gemini-3.8-flash`. Confirm which the router accepts.
