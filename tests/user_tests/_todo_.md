  
AJOUTER
-------
- Créer un fichier CSS qui contiendra les styles pour les balises
  > lk_film     Pour les films dans le texte

- Dans la balise film, en troisième argument, pouvoir ajouter des
  options, séparées par des espaces :
  [film:DancerInTheDark|Dancer In The Dark|date titre_fr]
  `date' indique qu'il faut mettre la date
  `titre_or` indique qu'il faut utiliser le titre original et indiquer le titre
  français
  => Documenter pour un accès facile à ces options.

- Fiche sélectionnée + CMD + FLECHES => Déplacer la fiche

- Sortir de l'édition du paragraphe (et autre) => correction du texte, suppression
  des balises, évaluation du code si code, etc.
  > En basculant du texte à l'édition (peut-être tous les champs), il faut
    corriger les balises
    -> UI.Input.check_value
    Note&nbsp;: penser que l'on pourra avoir un type de paragraphe qui sera
    du chargement de fichier, ou du code quelconque (js, ruby, etc.).


*?* Voir comment gérer les sorties d'un parent. Soit on peut glisser en
  dehors de lui, soit un raccourci pour le sortir (en scrollant jusqu'à lui
  ou en le plaçant là où on se trouve.)
  => Raccourci "E" (Extraire)

* Tester le réglage de top et left
  En profiter pour implémenter, dans 'create' ou 'built' l'appel à une méthode
  qui placera une fiche à un endroit précis sans écraser une autre fiche (donc
  l'idée de "place libre" aka `free_space')
  Noter que cet emplacement pourra avoir été déterminé par le déplacement d'un
  des outils pour créer une fiche (qui aura été déplacé à un endroit particulier)