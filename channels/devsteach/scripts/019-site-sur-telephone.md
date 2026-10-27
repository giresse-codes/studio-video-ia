# DevsTeach #019 : ton site sur téléphone

> Source : channels/scripts-complets.md. Les lignes « > » ne sont pas lues.
> Écran : site minuscule sur un téléphone, avec une loupe (gag). Le même site qui s'adapte sur trois écrans : téléphone, tablette, ordinateur. Code :
> ```html
> <meta name="viewport" content="width=device-width, initial-scale=1.0">
> ```
> ```css
> @media (max-width: 600px) {
>   body {
>     font-size: 18px;
>   }
>   p {
>     margin: 12px;
>   }
> }
> ```
> Étiquette « SI écran < 600 px ALORS… ». Vêtement réglable (gag). Écran « TA MISSION ». Frise : Outils ✓, HTML ✓, CSS ✓, JavaScript (prochain). Teaser.
> Légende de publication :
>   Épisode 19 : ton site s'adapte enfin au téléphone. La balise viewport et ta première media query.
>   Ça rend mieux sur ton téléphone ? Montre-moi.
>   #apprendreacoder #css #responsive #devweb #devsteach

[curieux] Ton site est en ligne. Ouvre-le sur ton téléphone. [amusé] Tout est minuscule, ou ça dépasse sur les côtés ? Normal. On règle ça.
Un site qui s'adapte à la taille de l'écran, on dit qu'il est responsive.
Première pièce : la balise meta viewport, dans le head. Elle dit au téléphone : affiche la page à la largeur de ton écran, sans la rétrécir. Bonne nouvelle : l'astuce du point d'exclamation dans VS Code l'a déjà écrite pour toi. Vérifie qu'elle est là.
Deuxième pièce : la media query. C'est une condition en CSS : si l'écran fait moins de six cents pixels, alors applique ces règles-là. Par exemple, des marges plus petites et un texte un peu plus grand.
[amusé] C'est le même vêtement, mais avec des réglages pour chaque taille.
[énergique] Ta mission : ajoute la media query à l'écran à ton fichier style point css, puis ouvre ton site sur ton téléphone après un push.
[souriant] Prochain bloc : JavaScript, pour que ton site réagisse quand on clique. Ça rend mieux sur ton téléphone ?
