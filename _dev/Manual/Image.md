# Gestion des images


##Fabrication de l'image

Il faut fabriquer des images eps ayant une résolution de 300ppp.

* Créer une nouvelle image dans Gimp en choisissant la résolution 300 (cf. options avancées)
* Concevoir l'image
* Imprimer l'image > Choisir le format PostScript

###Note sur le nom des images

Les images utiles sont toutes copiées dans le dossier `publication/source/ressource/img/` d'où que soient leur provenance. Il faut donc s'assurer que deux noms ne soient pas égaux dans deux destinations différentes.

##Problème lors de la fabrication du PDF

Avec les images, la publication ne peut pas toujours se faire correctement. Si elle échoue (mais que le fichier .dvi a bien été conçu/actualisé), lancer la commande suivante en ligne :

    $ dvipdfm source

Ou relancer le builder ?