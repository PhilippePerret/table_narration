# Gestion des images

##Image

Taille maximale (intérieur d'un format A5 = 11cm)

##Balise image

La balise image s'écrit dans le texte par :

    [img:path/to/image|options]

L'image doit obligatoirement se trouver dans le dossier ou un sous-dossier de :

./collection/<collection>/ressource/img/
  
C'est le `path/to` depuis ce dossier qu'on doit indiquer dans la balise.

Donc pour une image se trouvant à&nbsp;:

    ./collection/test/ressource/img/picto/rectangle.jpg

… la balise sera&nbsp;:

    [img:picto/rectangle.jpg]

Les **options** est une liste de `attribut=valeurs` séparés par des espaces et définissant les attributs de la balise `img` (et/ou de l'image PostScript dans la publication).

Par exemple&nbsp;:

    [img:picto/rectangle.jpg|width=200px height=50px id=lerectangle]

*Noter que les apostrophes ne sont pas nécessaire (aucune valeur ne doit posséder d'espace — ce qui interdit les title, ce qui est dommage, puisqu'ils pourraient servir à faire des captions au niveau de la publication)*
  
##Fabrication de l'image

Pour pouvoir utiliser des images dans le navigateur et pouvoir les imprimer avec LaTex, le mieux est de les faire en deux formats&nbsp;:

* Un format pour le navigateur (jpg ou png)
* Un format pour LaTex (PostScript)

###Images PostScript

Il faut fabriquer des images eps ayant une résolution de 300ppp.

* Créer une nouvelle image dans Gimp en choisissant la résolution 300 (cf. options avancées)
* Concevoir l'image
* Imprimer l'image > Choisir le format PostScript
* (Exporter l'image au format jpg ou png pour pouvoir l'utiliser dans le navigateur.)

###Note sur le nom des images

Les images utiles sont toutes copiées dans le dossier `publication/source/ressource/<collection>/img/` d'où que soient leur provenance. Il faut donc s'assurer que deux noms ne soient pas égaux dans deux destinations différentes.

##Problème lors de la fabrication du PDF

Avec les images, la publication ne peut pas toujours se faire correctement. Si elle échoue (mais que le fichier .dvi a bien été conçu/actualisé), lancer la commande suivante en ligne :

    $ dvipdfm source

Ou relancer le builder ?