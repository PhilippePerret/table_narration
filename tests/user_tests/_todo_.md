IMPLÉMENTER
-----------

CHOIX D'UN FILM
  - Lors du choix d'un film, il faut blurer le champ courant, mais conserver
    en mémoire sa selection.
    À la fin du choix du film, il faut remettre l'édition en place.
    NOTE : le travail n'est pas du tout le même avec un champ de saisie normal
    (qu'il suffit de quitter) et un main field qui nécessite la reconstruction
    du champ de saisie.

- Fiche sélectionnée + CMD + FLECHES => Déplacer la fiche

- Voir si au lieu de définir un `window.onkeypress' il ne vaut pas mieux définir
  le keypress toujours sur l'élément visé. Note : prendre en compte le fait que
  cela signifie qu'il faut que l'élément DOM soit focusé pour que les keypress
  s'applique à lui.
  
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