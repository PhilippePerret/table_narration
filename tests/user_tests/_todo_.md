* Tester le réglage de top et left
  En profiter pour implémenter, dans 'create' ou 'built' l'appel à une méthode
  qui placera une fiche à un endroit précis (sans écraser une autre fiche)
  Noter que cet emplacement pourra avoir été déterminé par le déplacement d'un
  des outils pour créer une fiche (qui aura été déplacé à un endroit particulier)
  
* Vérifier que <fiche>.built est mis à true quand la fiche est construite
* Test des backup (normaux et forcés)
* Test du chargement de la collection (Collection.load)
* Tester en profondeur la méthode Fiche.dispatch pour voir si elle
  retransforme bien les {id:xxx, type:xxxx} en fiche pour les propriétés
  concernées (enfants, parent, etc.)
* Tester la propriété 'loaded' de Fiche. Une fiche est chargée lorsqu'elle
  définit autre chose que son type et son id (titre aussi ? dans le cas où
  je prévois plus tard un chargement seulement avec le titre, pour les
  références et les chapitres fermés)