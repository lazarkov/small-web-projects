# Hermes Layer Probe

A blueprint layer folder for the **Hermes** engine, using the *read path*: the
`agent-spaces.md` in this folder is the definition, so nothing is generated from
a purpose sentence.

## Files

| File | Why it's here |
| --- | --- |
| `agent-spaces.md` | The declared definition. Its presence is what selects the read path. |
| `package.json` | `scripts.start` → `node index.js`, plus one real dependency (`dayjs`) so you can prove `npm install --omit=dev` ran in the agent's own image. |
| `index.js` | Prints the marker `HERMES-LAYER-OK` and exits 0. |
| `README.md` | This file. |

## Constraints this folder respects

- 4 files, well under the 60-file / 1 MB per-folder cap.
- Runnable part is Node only. No `main.py` — both images are node-based, so a
  Python entrypoint would be detected and then fail for lack of `python3`.
- No secrets. `{{llmKeyVar}}` / `{{llmApiKey}}` are platform-filled placeholders,
  and the gateway token variable is not named anywhere in this folder — by rule
  it must not appear in a document at all.

## What the definition is set up to exercise

- **Injected layer pin.** `layer:` is deliberately omitted from the frontmatter.
  The returned text should show a resolved sha and `install: none` — that's the
  platform pinning it for you.
- **No `image:`.** Naming one is refused, so it isn't there.
- **`kind: personal`.**
- **Requesty router block.** `## Environment` carries the four router lines
  (`LLM_PROVIDER`, `LLM_MODEL`, `'{{llmKeyVar}}'`, `OPENAI_BASE_URL`).
- **Hermes-only vocabulary.** `toolsets: skills, terminal, file` in `## Runtime`,
  and a `## Schedule` — Hermes is the only engine that accepts one.
- **Read-only layer.** The soul tells the agent to run the entrypoint from
  `{{home}}/layer` (`/opt/data/layer`), then try to write there, fail, and
  relocate to the writable home.

`{{home}}` is `/opt/data` on Hermes. The soul is written to `SOUL.md`.

## Testing the "author pinned it" branch

To cover the other half — author declares `layer:` with `install: npm`, and the
platform leaves it alone — copy this folder to a second one and add to the
frontmatter:

```yaml
layer:
  repo: <owner>/<repo>
  ref: <sha>
  path: agent-examples/hermes
  install: npm
```

Then confirm the returned text echoes your ref rather than an injected sha.

## Free models

Pick a free Requesty model for Hermes runs: `google/gemma-4-31b-it` or
`mistral/leanstral-1-5`.
