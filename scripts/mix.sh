#!/usr/bin/env bash
# Mix finale: voce normalizzata a -14 LUFS, musica a -25 LUFS in loop, SFX sopra.
# Uso: scripts/mix.sh <video_muto.mp4> <sorgente_con_voce> <uscita.mp4>
set -euo pipefail
VIDEO=$1; SRC=$2; OUT=$3
VOICE_LUFS=-14
MUSIC_LUFS=-25

# Musica: usa input/music.* se presente, altrimenti la base generata
MUSIC=$(ls input/music.* 2>/dev/null | head -1 || true)
MUSIC=${MUSIC:-build/music.wav}

# loudnorm a due passaggi (misura, poi correzione lineare precisa)
measure() { # $1=file $2=target
  ffmpeg -hide_banner -nostats -i "$1" -af "loudnorm=I=$2:TP=-1.5:LRA=11:print_format=json" -f null - 2>&1 \
    | python3 -c "import sys,json,re; d=json.loads(re.findall(r'\{[^{}]*\}', sys.stdin.read(), re.S)[-1]); print(f\"measured_I={d['input_i']}:measured_TP={d['input_tp']}:measured_LRA={d['input_lra']}:measured_thresh={d['input_thresh']}:offset={d['target_offset']}\")"
}
VM=$(measure "$SRC" $VOICE_LUFS)
ffmpeg -v error -y -stream_loop -1 -i "$MUSIC" -t "$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$VIDEO")" build/music_loop.wav
MM=$(measure build/music_loop.wav $MUSIC_LUFS)

ffmpeg -v error -y -i "$VIDEO" -i "$SRC" -i build/music_loop.wav -i build/sfx.wav -filter_complex "
[1:a]aresample=48000,loudnorm=I=$VOICE_LUFS:TP=-1.5:LRA=11:$VM:linear=true,aresample=48000[v];
[2:a]aresample=48000,loudnorm=I=$MUSIC_LUFS:TP=-1.5:LRA=11:$MM:linear=true,aresample=48000[m];
[3:a]aresample=48000,volume=0dB[s];
[v][m][s]amix=inputs=3:normalize=0:duration=first,alimiter=limit=0.89:level=false,aformat=channel_layouts=stereo[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart "$OUT"
echo "Mix completato: $OUT"
