IMPLÉMENTER
-----------

-# Empêcher de pouvoir sauver un film sans titre

SCÉNODICO (objet DICO / class Mot)
  Récupérer les données
    
* Help contextuel complexe
  Elle doit toujours tester où l'on en est (une fiche sélectionnée/ou non, un 
  parent ou non, des enfants ou non) et proposer les raccourcis possibles

* Une recherche spéciale sur le DICO quand le focus est sur le listing, comme dans
  le finder (premières lettres).
  Fonctionnement : dès qu'on tape une lettre, ça interrompt le timer courant et
  ça en relance un de 1 seconde. Tout en recherchant le premier mot qui commence
  par les lettres tapées.
  NOTE: Il faut désactiver le "e" pour éditer (utiliser CMD+E — MÊME chose pour FILM)
  DONC :
    - focus sur le listing
    - Une première lettre tapée
    =>  - Mémorise cette lettre 
        - Lance le timer
        - Sélectionne le premier mot correspondant (si la première lettre
          et la lettre du listing, c'est le premier mot)
    - Une autre lettre tapée AVANT la fin du timer
    =>  - Mémorise cette lettre avec l'autre
        - Arrête le timer et le relance
        - Sélectionne le premier mot correspondant aux deux lettres
    - Une autre lettre tapée APRÈS la fin du timer
    =>  - La lettre est mémorisée comme première lettre
FICHES
------
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