import json, sys
from faster_whisper import WhisperModel
m = WhisperModel("medium", device="cpu", compute_type="int8")
import numpy as np, wave
wf=wave.open(sys.argv[1]); a=np.frombuffer(wf.readframes(wf.getnframes()),np.int16).astype(np.float32)/32768
segs, info = m.transcribe(a, language="it", word_timestamps=True, vad_filter=False, beam_size=5)
out=[]
for s in segs:
    out.append({"start":s.start,"end":s.end,"text":s.text,"words":[{"w":w.word,"s":round(w.start,3),"e":round(w.end,3),"p":round(w.probability,2)} for w in s.words]})
json.dump(out, open(sys.argv[2],"w"), ensure_ascii=False, indent=1)
for s in out: print(f'{s["start"]:6.2f}-{s["end"]:6.2f} {s["text"]}')
