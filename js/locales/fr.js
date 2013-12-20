window.LOCALE = {
  
  // LOCALE.app
  app:{
    // LOCALE.app.error
    error:{
      'current config error': "Des erreurs sont survenues en essayant d'application la"+
                              " configuration courante (le problème peut peut-être se "+
                              "résoudre simplement en prenant un flash de la configuration"+
                              "courante) :\n"
    }
  },
  
  // LOCALE.collection
  collection:{
    // LOCALE.collection.ask
    ask:{
      'things not save'       : "Des éléments ne sont pas sauvés. ",
      'follow though'         : "Veux-tu réellement poursuivre ?"
    }
  },
  
  fiche:{
    'want delete fiche'             : "Détruire définitivement cette fiche ?",
    'kill children'                 : "Détruire aussi tout son contenu",
    
    // LOCALE.fiche.error
    error:{
      'no empty text'               : "Impossible d'enregistrer un texte vide !",
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
  
  // LOCALE.paragraph
  paragraph:{
    
    // LOCALE.paragraph.tip
    tip:{
      'how to create a new para'    : "Tip: Pour créer un nouveau paragraphe à la suite d'un paragraphe édité, utiliser CMD + ENTER."
    }
  },
  
  // LOCALE.film
  film:{
    // LOCALE.film.ask
    ask:{
      'want delete film'            : "Veux-tu vraiment détruire définitivement le film :\n\n"
    },
    // LOCALE.film.label
    label:{
      'destroy'                     :"Détruire le film"
    },
    // LOCALE.film.message
    message:{
      'is saved'                    : "Le film est enregistré",
      'must choose a film'          : "Il faut choisir un film !",
      'no item selected'            : "Aucun film sélectionné.",
      'cant remove item'            : "Je ne peux pas détruire le film.",
      'choose item to edit it'      : "Choisissez un film, pour pouvoir l'éditer."
    },
    
    // LOCALE.film.error
    error:{
      'title is required'           : "Le titre est absolument requis !",
      'no id supplied'              : "Aucun identifiant fourni à l'instanciation. Je renonce",
      'no titre to find'            : "Il faut donner un titre à chercher !"
    }
  },
  
  // LOCALE.dico
  dico:{
    ask:{
      
    },
    // LOCALE.film.label
    label:{
      'destroy'                       :"Détruire le mot"
    },  
    message:{
      'is saved'                      : "Le mot est sauvegardé",
    },
    
    error:{
      
    }
  }
}