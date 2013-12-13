IMPLÉMENTER
-----------

CRÉATION FILM
- Le nouveau film se crée bien (vérifier qu'il est son ID)
MAIS
  > Le fichier interdata film_data.js ne s'actualise pas
  > La donnée FILMS.DATA ne s'actualise pas
    NOTE : Pour cette dernière, plutôt que de tout recharger, ajouter simplement
    le nouveau film à FILMS.DATA (en le classant) et rafraichir son listing comme
    je le fais déjà ici.
    Vérifier avant comme sont relevés les films d'une lettre, si c'est fait avant.
    En fait, je crois qu'il parcourt simplement la liste qui, par défaut, est 
    forcément ordonnée.
DONC
  Le vrai problème à régler est l'actualisation de film_data.js
  
EDITION FILM
  Sur listing : "E" permet d'éditer le film, ERASE permet de le détruire
  # On ne peut pas utiliser RETURN sur les textarea
    On pourrait imaginer mettre une class css 'returnable' ou 'enterable' qui
    dirait à UI.Input (si c'est lui) qu'on peut ajouter des retours chariots.

RACCOURCIS CLAVIER
  > Les faire plutôt apparaitre dans une ligne fixe en bas de la fenêtre
    div#div_shortcuts
  > Faire un objet Shortcuts qui gèrera ça.

DESTRUCTION FILM
  > bouton "x"
  > requête "film/destroy"
  
CHOIX D'UN FILM
  # [pas toujours…] Les raccourcis ne fonctionnent plus sur un deuxième champ édité
  # Quand on passe d'un listing à l'autre, les flèches concernent toujours
    l'autre listing (pourtant, il m'avait semblé avec prévu ça…)
  # L'année ne s'indique pas dans les options

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