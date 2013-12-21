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