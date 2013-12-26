#Manuel de rédaction des livres

##Déplacement des fiches

###Déplacement dans le même parent

Pour déplacer une fiche dans son propre parent, on peut :
* Soit utiliser la souris pour la mettre à la place voulue
* Soit la sélectionner puis utiliser les touches CMD+flèche haut/bas pour déplacer la fiche.

###Déplacement dans un autre parent

Pour déplacer la fiche dans un autre parent, on fait un couper-coller.

* On sélectionne la fiche à déplacer
* On joue CMD + X
* On sélectionne le nouveau parent ou la fiche du parent AVANT laquelle placer la fiche déplacée.
* On joue CMD + V


##Films

###Balise Film

On peut choisir un film en tapant CMD+F quand on se trouve dans un champ d'édition (n'importe lequel).

Après avoir choisi le film, une balise s'inscrit au cursor.

*Dans la fenêtre Film, des cases à cocher permettent de définir l'aspect du lien, ses options. Le plus simple est donc de définir l'affichage du titre en le choisissant. On peut cependant les régler dans la balise elle-même.*

La balise est composée de&nbsp;:

    [film:<id film>|<titre lien>|<options>]

Les options sont facultatives. On peut utiliser :

    [film:<id film>|<titre lien>]
  
`<titre lien>` peut avoir la valeur qu'on veut. C'est en général le titre du film dans sa langue originale.

####Les Options

`<options>` est une suite de termes séparés par des espaces.
  
    [film:<id>|<titre>|option1 option2... optionN]
    
Ces options peuvent être&nbsp;:

    date        Ajoute la date du film (après le titre)
    titrefr     Utilise le titre français (par défaut, c'est le
                titre original)
    titreor     Si titre_fr, le titre original est ajouté entre
                parenthèses
    nolink      Le film ne doit pas être lié, c'est-à-dire qu'il
                n'est pas cliquable.
    auteurs     Indication des auteurs du film.

-

##Paragraphes

###Paragraphe image

Un paragraphe peut être une image s'il est de type 'imag'.

Pour définir le type 'imag', retourner le paragraphe et choisir le ptype 'Type: Image'.

*Note&nbsp;: On peut aussi insérer une image dans un paragraphe à l'aide de la balise [img:path/dans/ressource/img/image.png|options].*

###Paragraphes insérant le texte d'un fichier

Ce sont des paragraphes de ptype 'file'. Pour le définir, retourner la fiche du paragraphe et choisir 'Type: Fichier à insérer' dans le menu des ptypes.

Le texte du paragraphe doit alors être le chemin d'accès au fichier voulu.

Ce chemin d'accès peut être&nbsp;:

* Le chemin d'accès absolu (mais ne fonctionnera pas online)
* Le chemin relatif depuis la racine de l'application (p.e. `../../dossier/fichier`)
* Le chemin relatif dans le dossier ressource/textes de la collection. Si le fichier est à la racine du dossier, seul son nom importe.

####Extension => type => traitement

C'est l'extension du fichier qui va déterminer son type et donc son traitement avant d'être inscrit dans le paragraphe. Pour le moment, ces extensions sont possibles&nbsp;:

* '**text**'. Un simple texte qui sera simplement traduit en HTML&nbsp;;
* '**html**', 'htm'.   Un texte au format HTML, copié tel quel&nbsp;;
* '**md**', '**markdown**'. Un fichier de type markdown&nbsp;;
* '**rb**'. Un fichier de type ruby, qui sera joué. Un tel fichier doit "putter" le texte à écrire&nbsp;;
* '**evc**'. Un fichier de type évènemencier, comme on peut le trouver dans le dossier des films interdata.