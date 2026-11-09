# NextReel Agency – Montaggio Reels 9:16

Pipeline automatica per Shorts, Reels e TikTok (1080×1920) costruita con **Remotion** + **ffmpeg** + **faster-whisper**.

## Stile applicato

| Regola | Implementazione |
|---|---|
| 9:16, 1080×1920, safe zone 200px | `src/theme.ts` (sottotitoli al 70%, grafiche al 52%) |
| Taglio pause > 0,3 s | `scripts/build_timeline.py` misura le pause dalla trascrizione (`pausesOver300ms` in `data/reel.json`) |
| Zoom 10% sui cambi di frase | `zooms` in `data/reel.json`, applicati a scatto in `src/Reel.tsx` |
| Sottotitoli karaoke MAIUSCOLI, Montserrat, bianco + giallo #FFD700 | `src/Captions.tsx` |
| Pop-up icone/numeri con molla elastica | `src/Popups.tsx`, `src/icons.tsx` |
| Slide / Fade to black 0,1 s sui cambi di capitolo | `src/Reel.tsx` |
| Voce -14 LUFS, musica -25 LUFS in loop, SFX whoosh/pop/click | `scripts/make_audio.py`, `scripts/mix.sh` |

## Come montare un nuovo video

1. Metti il video in `input/source.mov` (o `.mp4`). Facoltativo: una musica in `input/music.mp3`.
2. Cancella `data/transcript.json` (verrà rigenerato).
3. Modifica `data/edit_plan.json`: correzioni ortografiche, capitoli e parole chiave che fanno apparire icone o numeri.
4. `npm install` e poi `npm run render` → risultato in `output/reel_final.mp4`.

Anteprima interattiva: `npm run studio`.

Requisiti: Node 18+, Python 3 con `pip install faster-whisper numpy`, ffmpeg.
