# Pipeline « basket lyrics edit »

1. `ffmpeg` : débruitage (hqdn3d) + upscale 640x436 -> 1600x1090 (lanczos) + netteté (cas) -> `hq/%05d.jpg`
2. Transcription Whisper large-v3 (mots horodatés) -> `words.json`
3. `build_lyrics.py` : corrections des paroles -> `lyrics.json` (modifiable à la main, puis relancer le rendu)
4. `masks.py` : détourage de la joueuse + ballon (RMBG-1.4 filtré par YOLO11-seg) -> `masks/`
5. `render.py` : étalonnage chaud/doux, halo, grain, vignette, mot par mot (3 polices) + anneau circulaire rotatif DERRIÈRE la joueuse
