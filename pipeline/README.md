# Pipeline « basket lyrics » (v2)

- Format d'origine respecté : vidéo verticale (rotation -90 dans les métadonnées) -> 1080x1586
- `esr.py` : upscale IA Real-ESRGAN (realesr-general-x4v3) image par image
- `masks2.py` : détourage joueuse + ballon (RMBG-1.4 + YOLO11-seg) sur les passages où le texte passe derrière elle
- `real_lyrics.py` : vraies paroles calées sur le timing Whisper -> `lyrics.json`
- `render3.py` : lyrics style serif élégant (Bodoni Moda condensé, majuscules espacées), phrase construite mot par mot,
  écho géant en transparence, texture usée, petits glitchs, alternance voile clair/sombre, vignette, grain.
