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
      'no book for publishing'      : "Cette fiche n'appartient à aucun livre. Donc impossible de procéder à la publication.",
      'is not child'                : "Impossible de retirer l'enfant, ça n'est pas un enfant de la fiche.",
      'no copied fiche'             : "Il faut copier ou couper la fiche à coller…",
      'no fiche in clipboard'       : "Le presse-papier ne contient pas de fiche…",
      'bad child type in clipboard' : "La fiche dans le presse-papier ne peut pas être collée dans ce type de conteneur…",
      'no parent for clipboarded fiche':"Cette fiche est orpheline, impossible de lui coller un frère…",
      'clipboarded fiche already in parent':"La fiche coupée appartient déjà à ce parent.\nSauver et recharger l'application pour la voir ré-apparaitre dans le parent."
    },
    
    // LOCALE.fiche.message
    message:{
      'book publishing'             : "Publication du livre “_LIVRE_”_OPTIONS_.",
      'book has no parent'          : "Un livre ne peut pas avoir de parent…",
      'no parent'                   : "Cette fiche n'a pas de parent, elle est orpheline.",
      'no children'                 : "Cette fiche n'a pas d'enfants",
    }
  },
  
  // LOCALE.image
  image:{
    
    // LOCALE.image.error
    error:{
      'bad format'            : "L'image `_PATH_IMAGE_` n'est pas d'un format reconnu (png, jpg, "+
                                "jpeg, gif, tif, tiff). Vous devez la modifier.",
      'bad options in balise' : "Mauvaise option `_OPTION_' dans la balise `_BALISE_'. Les options doivent "+
                                "être composée de `attribut=valeur` et être séparés par des espaces simples."
    }
  },
  // LOCALE.paragraph
  paragraph:{
    
    // LOCALE.paragraph.tip
    tip:{
      'how to create a new para'  : "Tip: Pour créer un nouveau paragraphe à la suite d'un paragraphe édité, utiliser CMD + ENTER.",
      'new images'                :
        "De nouvelles images ont été ajoutées (_IMAGES_).\nPour qu'elles puissent être utilisées "+
        "pour la publication, elles doivent exister, au même endroit, au format PostScript (.ps)."+
        "Cette image postscript sera copiée dans le dossier "+
        "publication (./publication/source/ressource/_COLLECTION_/img/)."
    },
    
    // LOCALE.paragraph.message
    message:{
      
    },
    
    //LOCALE.paragraph.error
    error:{
      'code must be valid' :"\nUn code de paragraphe de ptype 'code' doit être valide en javascript et retourner le texte à écrire dans le paragraphe ('return \"...\"')"
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