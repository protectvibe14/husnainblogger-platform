# AI Tools — Finalized List (48 tools, approved 2026-10-01)

New 11th category: `ai-tools`. User decision: ALL 48 get built, including the 8 cloud-API tools —
user will add API keys later; tools ship with key slots + graceful no-key states. Site stays $0
(keys are the user's, stored in their own browser localStorage, sent only to the provider).

## Lane A — REAL-AI, 100% client-side (Transformers.js/WebGPU/WASM + browser-native APIs). No key.
| # | Slug | Tool |
|---|---|---|
| A1 | neural-tts-studio | Neural TTS studio — Kokoro-82M in-browser, 28 voices, WAV download, Web Speech fallback |
| A2 | ai-background-remover | Background remover — RMBG-1.4 client-side, batch drag-drop, PNG + ZIP download |
| A3 | ai-image-upscaler | Image upscaler 2x/4x — Real-ESRGAN WebGPU, tile-based, before/after slider |
| A4 | ai-audio-transcriber | Audio transcriber — Whisper tiny/base in-browser, 99 langs, SRT/VTT export |
| A5 | ai-translator-offline | Translator — MarianMT/NLLB client-side, offline after model load |
| A6 | read-aloud-tts-voice-browser | Read-aloud web app + TTS voice browser — device voices, speed/pitch bench |
| A7 | product-photo-white-background-maker | Product-photo white-bg maker — bg removal + Amazon/eBay 2000px presets |
| A8 | passport-id-photo-maker | Passport/ID photo maker — bg removal + regulation crops per country |

## Lane B — REAL-AI via bring-your-own-key (Gemini/Groq/OpenRouter free tiers, CORS direct). $0 site cost.
| # | Slug | Tool |
|---|---|---|
| B1 | free-ai-chatbot-byok | Free AI chatbot — paste-your-own key, localStorage |
| B2 | resume-bullet-enhancer | Resume bullet-point enhancer — action verbs + metrics rewrite |
| B3 | cover-letter-generator | Cover-letter generator — tailored from pasted job description |
| B4 | ai-email-blog-writer | AI email / blog-title / outline writer (+ llm7.io keyless fallback lane) |
| B5 | linkedin-headline-about-writer | LinkedIn headline + About-section writer |
| B6 | ai-text-summarizer | AI text summarizer — BYOK with extractive client-side fallback |
| B7 | ai-paraphraser-rewriter | AI paraphraser/rewriter — BYOK with SmolLM2 client-side fallback |

## Lane C — HYBRID helpers (honest rule-based, no fake "AI" claims)
| # | Slug | Tool |
|---|---|---|
| C1 | midjourney-flux-prompt-builder | Midjourney v7 / Flux prompt builder — params, styles, aspect ratios |
| C2 | ai-video-scene-planner | AI video prompt + scene planner — Veo/Sora/Runway builder + credit-cost estimator |
| C3 | ai-image-aspect-ratio-planner | AI image aspect-ratio & resolution planner — per-platform specs + pixel calc |
| C4 | suno-music-prompt-builder | Suno/Udio music prompt builder — genre/mood/structure/style tags |
| C5 | ats-resume-checker | ATS resume checker — keyword match + formatting rules, 0–100 score |
| C6 | elevenlabs-voiceover-script-formatter | Voiceover script formatter for ElevenLabs — chunking, SSML pauses, pronunciation dict |
| C7 | system-prompt-builder | System-prompt builder — role/task/context/format wizard |
| C8 | ai-headshot-prompt-pack-builder | AI headshot prompt-pack builder — styles/outfits/backgrounds |
| C9 | ideogram-logo-prompt-builder | AI logo prompt builder optimized for Ideogram text-in-image |
| C10 | voiceover-timing-cost-calculator | Voiceover timing & cost calculator — words→minutes, per-provider pricing |
| C11 | prompt-token-cost-estimator | Prompt token & API-cost estimator — per-model pricing table |
| C12 | negative-prompt-library | Negative-prompt library for SD/Flux — searchable, copy-paste |
| C13 | cross-model-prompt-converter | Cross-model prompt converter — ChatGPT↔Claude↔Gemini |
| C14 | prompt-health-debugger | Prompt health-score debugger — 12+ rule checks + auto-fix |
| C15 | lyrics-rhyme-syllable-checker | Lyrics rhyme & syllable checker for AI-generated songs |
| C16 | interview-question-generator | Job-interview question generator — rule-based by role |
| C17 | ocr-text-extractor | OCR text extractor — TrOCR, screenshot/photo → editable text |
| C18 | old-photo-restorer | Old-photo restorer — Real-ESRGAN + colorization, before/after |
| C19 | ai-image-captioner-alt-text | AI image captioner / alt-text generator — BLIP client-side |
| C20 | image-object-tagger | Image object tagger — client-side classifier auto-tagging |
| C21 | sentiment-analyzer | Sentiment analyzer — distilbert client-side, instant |
| C22 | semantic-note-search | Semantic search over pasted notes — bge embeddings, fully local |
| C23 | keyword-tag-extractor | Keyword/tag extractor — embeddings + rules |
| C24 | bpm-key-detector | BPM & musical-key detector — Web Audio analysis of uploads |
| C25 | svg-logo-composer | Procedural SVG logo composer — honest "template-based, not AI" label |

## Lane D — Cloud API tools (user adds key later; ship with key-vault UI + no-key placeholder)
| # | Slug | Tool | Intended providers (verify CORS before build) |
|---|---|---|---|
| D1 | ai-voice-cloning-studio | AI voice-cloning studio | ElevenLabs (user key) |
| D2 | text-to-video-generator | Text-to-video generator | fal.ai (CORS-friendly), verify alternatives |
| D3 | ai-headshot-generator | AI headshot generator | fal.ai / HF Inference FLUX (user key) |
| D4 | ai-music-generator | AI music generator | Suno/Udio-compatible API (user key) |
| D5 | photo-cartoonizer | Photo cartoonizer/avatar-ifier | fal.ai ControlNet/LoRA (user key) |
| D6 | talk-to-pdf-chatbot | Talk-to-PDF chatbot | BYOK LLM (Gemini/Groq) |
| D7 | ai-image-detector | AI-generated-image detector | Hive/cloud detector API (user key), honest confidence labels |
| D8 | ai-image-generator | AI image generator | fal.ai / HF Inference / OpenRouter image models (user key) |

## Standing rules carried over
- 100% client-side, $0 site cost. Lane D keys live in the USER's browser only.
- Honest labeling: Lane C/D never claim on-device "AI" where none runs.
- No fake data: pricing tables need source + date + verification; estimates labeled.
- Per-tool contract: logic.ts + logic.test.ts + meta.ts; 90/100 QA bar.
- Lane A needs NEW shared infra (model loader w/ progress, WebGPU/WASM fallback) — extends the
  10-template system; logic.ts purity rule needs a defined pattern for model-backed tools.
- Lane B/D need NEW shared infra: key-vault UI (per-provider key fields, localStorage,
  show/hide, never transmitted except to the provider), no-key/demo states, cost disclosures.
