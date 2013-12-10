* ÉDITION FILM
  - désactiver les gestions de keypress quand on édite le film.
  - les remettre quand on finit (FILMS.Edition.end)

* En basculant du texte à l'édition (peut-être tous les champs), il faut
  corriger les balises


*?* Voir comment gérer les sorties d'un parent. Soit on peut glisser en
  dehors de lui, soit un raccourci pour le sortir (en scrollant jusqu'à lui
  ou en le plaçant là où on se trouve.)
  => Raccourci "E" (Extraire)

* Tester le réglage de top et left
  En profiter pour implémenter, dans 'create' ou 'built' l'appel à une méthode
  qui placera une fiche à un endroit précis (sans écraser une autre fiche)
  Noter que cet emplacement pourra avoir été déterminé par le déplacement d'un
  des outils pour créer une fiche (qui aura été déplacé à un endroit particulier)

* Vérifier que <fiche>.built est mis à true quand la fiche est construite


* Tester en profondeur la méthode Fiche.dispatch pour voir si elle
  retransforme bien les {id:xxx, type:xxxx} en fiche pour les propriétés
  concernées (enfants, parent, etc.)
  -   Voir aussi si elle ouvre bien les fiches à ouvrir (FICHES.open), si elle
     ferme bienles fiches non ouverte (FICHES.close) et si elle range bien les
     fiches à ranger (FICHES.range)

* Tester la propriété 'loaded' de Fiche. Une fiche est chargée lorsqu'elle
  définit autre chose que son type et son id (titre aussi ? dans le cas où
  je prévois plus tard un chargement seulement avec le titre, pour les
  références et les chapitres fermés)