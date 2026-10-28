# Ancres : astuces-003

Chaque événement visuel ou sonore est lié à un mot du script par une ancre, et se déclenche à l'heure de ce mot
(Whisper, sinon estimation), à 150 ms près. Dans le code d'une scène : `S.ancre('@mot')` ou `S.zoomMot('@mot')`.

Syntaxe : `@mot` (1re occurrence dans la scène), `@mot#2` (2e), `@chauff*` (début de mot), `@mot+0.1` (décalage en s, 0,15 max),
`@0` (début de la vidéo). Écrire le mot sans accent ni tiret si besoin : `@elleme*`.

Règles : un nouvel élément toutes les 1,5 à 3 s ; zoom rapide sur le mot clé de chaque scène ; rien de vide dans la
première seconde (l'action commence à 0 s, un son à 0,2 s est ajouté automatiquement).

| Scène | Ancre | Événement | Bruitage |
| --- | --- | --- | --- |
| s1 | @0 | l'objet principal est déjà là et bouge | pop (automatique à 0,2 s) |
| s1 | @mot | … | |
| s2 | @mot | début de scène (transition zoom ou balayage, dans video.json) | whoosh (automatique) |
