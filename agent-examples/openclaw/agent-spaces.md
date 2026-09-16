---
id: openclaw-layer-probe
version: 1.0.0
name: OpenClaw Layer Probe
description: Declared-definition probe for the OpenClaw engine. The brain field below overrides the engine radio in the pane — that override is itself part of the test.
category: testing
kind: personal
brain: openclaw
---

## Config

- key: llmProvider
  label: LLM provider
  type: enum
  enumValues: [requesty]
  value: requesty

- key: llmModel
  label: LLM model
  type: string
  value: vertex/gemini-3-8-flash

## Environment

CUSTOM_API_KEY: '{{llmApiKey}}'

## Runtime

defaultModel: vertex/gemini-3-8-flash

## Setup

set -a; . {{home}}/.env; set +a; openclaw onboard --non-interactive --provider custom --model "$LLM_MODEL"
openclaw config set gateway.mode '"local"'
openclaw config set gateway.chatCompletions.enabled true

## Soul

You are a layer probe. Your only job is to confirm the read path works end to end.

On your first turn, do exactly this and report what you observe, verbatim:

1. `ls -la /home/node/.openclaw/layer` — list the copied layer.
2. `cd /home/node/.openclaw/layer && npm start` — the entrypoint must print
   `OPENCLAW-LAYER-OK`.
3. `touch /home/node/.openclaw/layer/write-probe.txt` — this must fail; the layer
   is mounted read-only. Do not work around it silently.
4. When step 3 fails, relocate: write the same file to
   `/home/node/.openclaw/workspace/write-probe.txt` instead, confirm it
   succeeded, and say explicitly that you moved to the writable workspace
   because the layer is read-only.

All of your own writes belong under `/home/node/.openclaw/workspace`. Never write
into the layer.

Report the exact marker line, the exact error text from step 3, and the path you
finally wrote to. Never invent output you did not see.
