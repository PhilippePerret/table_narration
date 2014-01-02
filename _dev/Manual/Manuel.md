#Manuel de l'application “Collection”

(note&nbsp;: ex "Table narration")

* [TEXTES](#texte)
* [Style du texte (balises)](#style_texte)
* [FICHES](#fiches)
* [Déplacement des fiches](#move_fiches)
* [Référence à une fiche](#ref_fiche)
* [FILMS](#films)
* [Balise Film](#balise_film)
* [PARAGRAPHES](#paragraphes)
* [Les paragraphes “Tableau”](#paragraphes_tableau)
* [Paragraphe insérant le texte d'un fichier](#paragraphe_fichier)



<a name="texte"></a>
##Texte

<a name="style_texte">
###Styles (balises) spéciales

En plus des balises `<b>`, `<strong>`, `<i>`, `<u>`, `<stroke>` on peut utiliser :

    <del>Texte supprimé</del>         // Sera barré en publication
                                      // Better than 'stroke'
    <ins>Texte en remplacement</ins>  // underlined en publication
                                      // need <del> before
    <bad>Mauvais texte</bad>          // rouge à l'affichage, waves en publication
  


<a name="fiches"></a>
##Les Fiches

<a name="ref_fiche"></a>
###Référence à une autre fiche

Pour coller une référence à une autre fiche&nbsp;:

* Sélectionner la fiche (livre, chapitre, page ou paragraphe) et taper la lettre "R".
* Placer le curseur à l'endroit où doit être insérée la référence
* Taper CMD + V.

####Les références faciles

Pour travailler confortablement avec les références, le plus simple est de “cloner” la collection courante en cliquant sur le bouton ![Dupliquer table](../../../lib/img/picto/dupliquer-fond-blanc.png)


<a name="move_fiches"></a>
###Déplacement des fiches

####Déplacement dans le même parent

Pour déplacer une fiche dans son propre parent, on peut :
* Soit utiliser la souris pour la mettre à la place voulue
* Soit la sélectionner puis utiliser les touches CMD+flèche haut/bas pour déplacer la fiche.

####Déplacement dans un autre parent

Pour déplacer la fiche dans un autre parent, on doit procéder à un couper-coller.

* On sélectionne la fiche à déplacer
* On joue CMD + X
* On sélectionne le nouveau parent ou la fiche du parent AVANT laquelle placer la fiche déplacée.
* On joue CMD + V


<a name="films"></a>
##Films


<a name="balise_film"></a>
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

<a name="paragraphes"></a>
##Paragraphes

<a name="paragraphes_tableau"></a>
###Paragraphes “Tableau”

Un paragraphe tableau (table HTML) se définit en choisissant le `ptype` “Type : Tableau” (après avoir retourné la fiche).

Un tableau peut se définir en ajoutant un caractère "|" avant chaque ligne.

* La première ligne doit définir la largeur des colonnes (et donc leur nombre)&nbsp;;
  * Soit ce sont des nombres seuls, dont le TOTAL fait 100, ils sont alors considérés
  comme des pourcentages&nbsp;;
  * Soit ce sont des nombres seuls, dont le TOTAL ne fait pas 100, ils sont considérés comme des pixels&nbsp;;
  * Soit ce sont des nombres avec leur unités (quelconque).
* Chaque rangée (tr) doit être séparée par `|---` (au moins 3 "-")&nbsp;;
* Chaque cellule peut être définie soit par un retour à la ligne, soit par des `||` si les cellules sont sur la même ligne.

Exemple&nbsp;:

    |50 50          2 colonnes de 50% (total = 100)
    |---            Début d'une rangée
    |Cellule 1
    |Cellule 2
    |---            Nouvelle rangée
    |CellA || CellB   2 cellules définies sur 1 seule rangée

Produira&nbsp;:

    <table>
      <colgroup>
        <col width="50%">
        <col width="50%">
      </colgroup>
      <tr>
        <td>Cellule 1</td>
        <td>Cellule 2</td>
      </tr>
      <tr>
        <td>CellA</td>
        <td>CellB</td>
      </tr>
    </table>

####Colspan

Le `colspan` d'une cellule peut être défini simplement en mettant "-" (1 moins) dans la cellule sur laquelle doit se prolonger la cellule précédente. Par exemple&nbsp;:

    |---
    | Une cellule sur 2 colonnes || - || Cell 3
    
… ou :

    |---
    | Une cellule sur 2 colonnes
    | -
    | Cell 3

… produira :

    <tr>
      <td colspan="2">Une cellule sur 2 colonnes</td>
      <td>Cell 3</td>
    </tr>

*Note&nbsp;: Pas de rowspan pour le moment dans ce format.*


<a name="paragraphe_fichier"></a>
###Paragraphe insérant le texte d'un fichier

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