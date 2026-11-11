# Montaggio in CapCut Pro: guida rapida

Tutti i file partono da **00:00** e durano quanto il video: basta allinearli all'inizio della timeline.

## 1. Crea il progetto
- Nuovo progetto, formato **9:16**.
- Importa tutti i file di questa cartella (trascinali nella finestra "Media").

## 2. Video
| Traccia | File | Note |
|---|---|---|
| Principale | `1_video_base.mp4` | Video con zoom del 10% e transizioni già applicati, senza scritte |
| Sovrapposizione (sopra) | `2_grafiche_trasparenti.mov` | Icone e numeri con sfondo trasparente: puoi tagliare, spostare o cancellare i singoli pezzi |

Per eliminare una sola icona: dividi la clip delle grafiche (Ctrl/Cmd+B) prima e dopo l'icona e cancella il pezzo.

## 3. Audio
| File | Livello |
|---|---|
| `3_voce.wav` | Voce normalizzata a -14 LUFS |
| `4_musica.wav` | Musica a -25 LUFS (puoi sostituirla con un'altra traccia) |
| `5_effetti_sonori.wav` | Whoosh, pop e click già a tempo con transizioni e icone |

Lascia i volumi di CapCut a 0 dB: i livelli sono già quelli del mix finale.

## 4. Sottotitoli
**Opzione A: importa il file .srt (testo già corretto)**
- Menu **Testo → Sottotitoli locali → Importa** e scegli `sottotitoli.srt`.
- Seleziona tutti i sottotitoli e imposta: font **Montserrat Black** (o Impact), maiuscolo, bianco, contorno nero spesso.
- Posizione: centro-basso, a circa **3/4 dell'altezza** (Y 70%), lontano dai 200px inferiori.
- Per l'effetto karaoke applica un'animazione di testo con evidenziazione parola per parola, colore **#FFD700**.

**Opzione B: sottotitoli automatici di CapCut**
- Usa **Sottotitoli automatici** sulla traccia `3_voce.wav` e scegli un modello con la parola evidenziata.
- Correggi a mano "sollecitazioni" e "Commenta": il riconoscimento automatico spesso li sbaglia.

`sottotitoli_parola_per_parola.srt` contiene una parola per riga, utile se vuoi animare ogni parola separatamente.

## 5. Esporta
1080×1920, 30 fps, H.264.
