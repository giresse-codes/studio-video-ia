# Ancres : devsteach-001

Chaque événement visuel ou sonore est lié à un mot du script par une ancre, et se déclenche à l'heure de ce mot
(Whisper, sinon estimation), à 150 ms près. Dans le code d'une scène : `S.ancre('@mot')` ou `S.zoomMot('@mot')`.

Syntaxe : `@mot` (1re occurrence dans la scène), `@mot#2` (2e), `@chauff*` (début de mot), `@mot+0.1` (décalage en s, 0,15 max),
`@0` (début de la vidéo). Écrire le mot sans accent ni tiret si besoin : `@elleme*`.

Règles : un nouvel élément toutes les 1,5 à 3 s ; zoom rapide sur le mot clé de chaque scène ; rien de vide dans la
première seconde (l'action commence à 0 s, un son à 0,2 s est ajouté automatiquement).

| Scène | Ancre | Mot | Heure (s) |
| --- | --- | --- | --- |
| s1 | `@0` | début de scène (zoom) | 0.00 |
| s1 | `@0` | (début) | 0.00 |
| s1 | `@seconde` | seconde. | 1.34 |
| s1 | `@mais` | Mais | 2.26 |
| s1 | `@quatre` | quatre | 3.90 |
| s2 | `@imagine` | début de scène (balayage) | 5.04 |
| s2 | `@imagine` | Imagine | 5.04 |
| s2 | `@commandes` | commandes | 5.60 |
| s2 | `@pizza` | pizza. | 6.17 |
| s3 | `@etape` | début de scène (zoom) | 6.93 |
| s3 | `@tapes` | tapes | 7.96 |
| s3 | `@navigateur` | navigateur, | 9.40 |
| s3 | `@navigateur+0.1` | navigateur, | 9.50 |
| s3 | `@commandes` | commandes. | 10.40 |
| s4 | `@etape` | début de scène (balayage) | 11.41 |
| s4 | `@etape` | Étape | 11.41 |
| s4 | `@demande` | demande | 12.47 |
| s4 | `@annuaire` | annuaire, | 13.23 |
| s4 | `@dns` | DNS, | 13.98 |
| s4 | `@trouve` | trouve | 14.51 |
| s4 | `@repond` | répond | 16.26 |
| s4 | `@chiffres` | chiffres. | 17.24 |
| s5 | `@etape` | début de scène (zoom) | 18.17 |
| s5 | `@etape` | Étape | 18.17 |
| s5 | `@commande` | commande | 19.23 |
| s5 | `@part` | part | 19.70 |
| s5 | `@serveur` | serveur, | 20.29 |
| s5 | `@ordinateur` | ordinateur | 20.82 |
| s5 | `@allume` | allumé. | 21.89 |
| s5 | `@pizzeria` | pizzeria : | 22.96 |
| s5 | `@dort` | dort | 23.91 |
| s5 | `@jamais` | jamais. | 24.18 |
| s6 | `@etape` | début de scène (balayage) | 25.09 |
| s6 | `@etape` | Étape | 25.09 |
| s6 | `@fichiers` | fichiers. | 27.05 |
| s6 | `@html` | HTML | 28.02 |
| s6 | `@structure` | structure, | 28.74 |
| s6 | `@css` | CSS | 29.55 |
| s6 | `@style` | style, | 30.20 |
| s6 | `@javascript` | JavaScript | 30.71 |
| s6 | `@actions` | actions. | 32.26 |
| s7 | `@assemble` | début de scène (zoom) | 33.89 |
| s7 | `@assemble` | assemble | 33.89 |
| s7 | `@tout` | tout, | 34.29 |
| s7 | `@pizza` | pizza | 34.98 |
| s7 | `@arrive` | arrive : | 35.29 |
| s7 | `@page` | page. | 36.15 |
| s8 | `@mission-0.2` | début de scène (balayage) | 36.93 |
| s8 | `@mission` | mission : | 37.13 |
| s8 | `@ordinateur` | ordinateur, | 37.83 |
| s8 | `@fais` | fais | 38.53 |
| s8 | `@clic` | clic | 38.95 |
| s8 | `@droit` | droit | 39.23 |
| s8 | `@inspecter` | Inspecter ». | 40.48 |
| s8 | `@telephone` | téléphone, | 41.82 |
| s8 | `@viewsource` | view-source: | 43.18 |
| s8 | `@adresse` | l'adresse. | 44.73 |
| s9 | `@trouve` | début de scène (zoom) | 45.88 |
| s9 | `@titre` | titre | 46.30 |
| s9 | `@trouve#2` | trouvé ? | 48.13 |
| s9 | `@commentaire` | commentaire. | 49.48 |
| s9 | `@prochain` | Prochain | 50.39 |
| s9 | `@url` | l'URL. | 51.66 |
