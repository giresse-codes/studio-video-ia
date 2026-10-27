# DevsTeach #014 : le formulaire

> Source : channels/scripts-complets.md. Les lignes « > » ne sont pas lues.
> Écran : formulaires de connexion, d'inscription et de contact qui défilent. Code :
> ```html
> <form>
>   <label for="nom">Nom</label>
>   <input id="nom" name="nom" type="text">
>
>   <label for="email">E-mail</label>
>   <input id="email" name="email" type="email">
>
>   <label for="message">Message</label>
>   <textarea id="message" name="message"></textarea>
>
>   <button type="submit">Envoyer</button>
> </form>
> ```
> Erreur du navigateur sur un e-mail sans arobase. Gag : la commande part dans une cuisine vide, avec une étiquette « Back-end : bientôt ». Écran « TA MISSION ». Teaser « Bloc CSS ».
> Légende de publication :
>   Épisode 14 : form, input, label, button. Ton premier formulaire, et pourquoi il ne peut pas encore envoyer de message.
>   Ton formulaire est prêt ?
>   #apprendreacoder #html #formulaire #devweb #devsteach

[curieux] Les formulaires sont partout : connexion, inscription, contact. On en fabrique un.
La balise form entoure tout le formulaire. Dedans, chaque champ, c'est un input. Et chaque input a son label, l'étiquette qui dit ce qu'on doit écrire.
Le type change tout. Type text pour du texte, type email pour une adresse : le navigateur vérifie déjà qu'il y a un arobase. Et à la fin, un bouton pour envoyer.
[amusé] Maintenant, la vérité qui fait mal : si tu cliques sur Envoyer, il ne se passe rien d'utile. Ton formulaire, c'est la salle du restaurant. Il manque la cuisine.
Tu te souviens de l'épisode trois ? Le back-end. C'est lui qui recevra ces données, avec PHP, plus tard dans le parcours.
[énergique] Ta mission : dans contact point html, crée un formulaire avec un nom, un e-mail, un message et un bouton Envoyer. Puis add, commit, push.
[souriant] Prochain bloc : le CSS, pour rendre tout ça beau. Ton formulaire est prêt ?
