window.LOCALE = {
  fiche:{
    'want delete fiche'             : "Détruire définitivement cette fiche ?",
    'kill children'                 : "Détruire aussi tout son contenu",
    
    // LOCALE.fiche.error
    error:{
      'parent should be an object'  : "Le parent doit être un object (une fiche)",
      'parent should be a fiche'    : "Le parent doit être une fiche",
      'parent bad type'             : "Le parent n'est pas d'un type valide",
      'child should be an object'   : "L'enfant doit être un object (une fiche)",
      'child should be a fiche'     : "L'enfant doit être une fiche",
      'child bad type'              : "L'enfant n'est pas d'un type valide",
      'no fiche for dom obj'        : "Aucune fiche ne correspond à l'objet DOM…",
      'unable to range orphelin'    : "Impossible de ranger une fiche orpheline…",
      'unable to unrange orphelin'  : "Impossible de un-ranger une fiche orpheline…",
      'is not child'                : "Impossible de retirer l'enfant, ça n'est pas un enfant de la fiche."
    },
    
    // LOCALE.fiche.message
    message:{
      'book has no parent'          : "Un livre ne peut pas avoir de parent…",
      'no parent'                   : "Cette fiche n'a pas de parent, elle est orpheline.",
      'no children'                 : "Cette fiche n'a pas d'enfants",
    }
  },
  
  // LOCALE.film
  film:{
    // LOCALE.film.message
    message:{
      'must choose a film'          : "Il faut choisir un film !"
    },
    
    // LOCALE.film.error
    error:{
      'no id supplied'              : "Aucun identifiant fourni à l'instanciation. Je renonce",
      'no titre to find'            : "Il faut donner un titre à chercher !"
    }
  }
}