/*
 *  Méthodes DOM des Fiches
 *  -----------------------
 *  
 */
Object.defineProperties(Fiche.prototype,{
  /*
   *  Retourne le code HTML pour la fiche
   *  
   */
  "html":{
    get:function(){
      return  '<fiche id="' + this.dom_id + '" class="fiche '+this.type+'">' +
              this.html_recto + this.html_verso +
              '</fiche>' ;
    }
  },
  
  /*
   *  Retourne le code HTML du RECTO de la fiche
   *  
   */
  "html_recto":{
    get:function(){
      return  '<recto id="'+this.dom_id+'-recto" class="'+this.type+'">'+
              this.html_input_titre_and_other + // + champ 'real_titre' pour Book
              this.html_div_items   + // empty pour les paragraphes
              '</recto>'
    }
  },
  
  /*
   *  Retourne le code HTML pour le titre en fonction de l'état
   *  d'ouverture de la fiche
   *  
   */
  "html_for_titre":{
    get:function(){
      return  this.html_div_titre +
              (this.is_book ? this.html_input_real_titre : '')
    }
  },
  /* Retourne le code HTML pour le titre de la fiche (sauf paragraphe) */
  "html_input_titre_and_other":{
    get:function(){
      if(this.is_paragraph) return this.html_div_texte
      else                  return this.html_for_titre
    }
  },
  /*
   *  3 Méthodes pour construire le titre
   *  Car le titre peut apparaitre dans un DIV quand la fiche est fermée,
   *  ou dans un INPUT quand la fiche est ouverte.
   *  
   */
  "html_input_titre":{
    get:function(){
      return '<input id="'+this.titre_id+'" type="text" class="titre" value="" />'
    }
  },
  "html_div_titre":{
    get:function(){
      return '<div id="'+this.titre_id+'" class="titre"></div>'
    }
  },
  
  /* Retourne le code HTML pour le div des items de la fiche (sauf paragraphe) */
  "html_div_items":{
    get:function(){
      return this.is_paragraph ? "" : '<div id="'+this.dom_id+'-items" class="items"></div>'
    }
  },
  
  /*
   *  Passe le titre/texte en édition
   *  -------------------------------
   *  
   *  PRODUIT
   *  -------
   *    - Remplace le div contenant le titre (ou le texte) par un champ
   *      de saisie.
   *    - Place les observers sur le champ de saisie.
   *    - Sélectionne le texte
   *
   */
  "enable_main_field":{
    get:function(){
      var idm = "Fiche::enable_main_field ["+this.type_id+"]"
      dlog("---> "+idm, DB_FCT_ENTER)
      this.main_field.unbind('click', $.proxy(FICHES.on_click_on_main_field, FICHES, this))

      // On remplace le DIV par un INPUT/TEXTAREA
      this.set_main_field_as_input

      var obj = this.main_field
      // obj.bind('focus', $.proxy(FICHES.onfocus_textfield, FICHES, this))
      obj.bind('blur', $.proxy(FICHES.onblur_textfield, FICHES, this))
      obj[0].onfocus  = $.proxy(FICHES.onfocus_textfield, FICHES, this)
      obj[0].onchange = $.proxy(this.onchange_titre_or_texte, this)
      obj.select()
      dlog("<- "+idm, DB_FCT_ENTER)
    }
  },
  "disable_main_field":{
    get:function(){
      var idm = "Fiche::disable_main_field ["+this.type_id+"]"
      dlog("---> "+idm, DB_FCT_ENTER)
      var obj = this.main_field
      obj.unbind('focus', $.proxy(FICHES.onfocus_textfield, FICHES, this))
      obj.unbind('blur', $.proxy(FICHES.onblur_textfield, FICHES, this))
      
      // On remplace le INPUT/TEXTAREA par un DIV
      this.set_main_field_as_div
      
      this.main_field.bind('click', $.proxy(FICHES.on_click_on_main_field, FICHES, this))
      dlog("<- "+idm, DB_FCT_ENTER)
    }
  },
  
  
  /* Retourne l'objet DOM du clone de la fiche */
  "obj_clone":{
    get:function(){return $('fiche#'+this.dom_id_clone)}
  },
  
  /*
   *  Clone/Déclone la fiche courante
   *
   *  "Cloner la fiche" consiste à :
   *    - Placer un clone de la fiche dans le parent, à la place de la fiche
   *    - Sortir le DOM Objet du parent pour le mettre sur la table
   *  "Décloner" la fiche consiste à :
   *    - Remettre la fiche dans le parent
   *    - Détruire le clone
   */
  "clone":{
    get:function(){
      this.clone_in_parent
      $('section#table').append( this.obj )
    }
  },
  "unclone":{
    get:function(){
      if(this.obj_clone.length == 0) throw "Clone introuvable pour la fiche #"+this.dom_id
      this.obj.insertAfter( this.obj_clone )
      this.obj_clone.remove()
    }
  },
  /*
   *  Place un clone de la fiche dans son parent
   *  
   */
  "clone_in_parent":{
    get:function(){
      $(this.html_clone).insertAfter( this.obj )
    }
  },
  
  /*
   *  Met les valeurs de la fiche dans l'élément DOM de la fiche
   *  
   *  TODO: La fiche est complètement à implémenter suivant les valeurs
   *        qui seront éditables.
   */
  "set_values":{
    get:function(){
      var idm = "Fiche::set_values ["+this.type_id+"]"
      dlog("---> "+idm, DB_FCT_ENTER)
      this.main_field.set(this.main_field_value)
      if(this.is_book) this.input_real_titre.val(this.real_titre || "TITRE RÉEL")
      dlog("<- "+idm, DB_FCT_ENTER)
      return true
    }
  },
  
  /* Retourne le dom_id du clone */
  "dom_id_clone":{
    get:function(){return "clone"+this.dom_id }
  },
  /*
   *  Retourne le code HTML pour un clone de la fiche (dans parent)
   *  
   *  @note:  Pour le moment, seul une page a besoin d'un clone
   */
  "html_clone":{
      // id = 'clone'+this.dom_id => "clonef-12"
    get:function(){
      return  '<fiche id="'+this.dom_id_clone+'" class="fiche '+this.type+' clone ranged">'+
                '<recto>'+
                  '<div id="'+this.dom_id_clone+'-titre" class="titre">'+this.main_field_value+'</div>'+
                '</recto>'+
              '</fiche>'
    }
  },
  
  
})