# Vérification : test-3d

```
✓ Durée
    audio : 5.00 s (3 mots/s)
    script : 15 mots, soit environ 6 s au rythme indicatif de 2.5 mots/s
✓ Silences
    aucun silence de plus de 0.6 s
✓ Nouveaux éléments
    aucune scène ne reste plus de 6 s sans nouvel élément
✓ Ancres
    heures des mots : ESTIMATION (Whisper indisponible : Whisper désactivé (KIT_WHISPER=non)). Écarts mesurés par rapport à cette estimation.
    6 ancres, écart maximal 11 ms (seuil 150 ms)
✓ Bords
    14 instants mesurés (ancres et toutes les 0,5 s, hors transitions), marge 60 px
✓ Images
    6 images extraites de out/test-3d.mp4 dans docs/verifications/test-3d/
```

| Scène | Ancre | Mot | Mot (s) | Événement (s) | Écart (ms) |
| --- | --- | --- | --- | --- | --- |
| s1 | `@serveur` | serveur, | 0.59 | 0.60 | 5 |
| s1 | `@pizzeria` | pizzeria : | 3.28 | 3.27 | 11 |
| s1 | `@part` | part | 0.00 | 0.00 | 0 |
| s1 | `@ordinateur` | ordinateur | 1.13 | 1.13 | 2 |
| s1 | `@dort` | dort | 4.23 | 4.23 | 3 |
| s1 | `@jamais` | jamais. | 4.50 | 4.50 | 2 |
