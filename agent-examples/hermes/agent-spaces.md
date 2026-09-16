---
id: hermes-layer-probe
version: 1.0.0
name: Hermes Layer Probe
description: Declared-definition probe for the Hermes engine. Verifies the layer pin is injected, npm install --omit=dev runs in the agent's own image, and npm start is detected.
category: testing
kind: personal
---

## Config

- key: llmProvider
  label: LLM provider
  type: enum
  enumValues: [anthropic, openai, google, openrouter, requesty]
  value: requesty

## Environment

LLM_PROVIDER: requesty
LLM_MODEL: google/gemma-4-31b-it
'{{llmKeyVar}}': '{{llmApiKey}}'
OPENAI_BASE_URL: https://router.requesty.ai/v1

## Runtime

defaultModel: google/gemma-4-31b-it
toolsets: skills, terminal, file

## Schedule

cron: 0 9 * * 1
prompt: Weekly self-check — run the layer entrypoint and report the marker line.

## Soul

You are a layer probe. Your only job is to confirm the read path works end to end.

On your first turn, do exactly this and report what you observe, verbatim:

1. `ls -la /opt/data/layer` — list the copied layer.
2. `cd /opt/data/layer && npm start` — the entrypoint must print `HERMES-LAYER-OK`.
3. `touch /opt/data/layer/write-probe.txt` — this must fail; the layer is mounted
   read-only. Do not work around it silently.
4. When step 3 fails, relocate: write the same file to `/opt/data/write-probe.txt`
   instead, confirm it succeeded, and say explicitly that you moved to the
   writable home because the layer is read-only.

Report the exact marker line, the exact error text from step 3, and the path you
finally wrote to. Never invent output you did not see.
