/*
 *  Méthodes DOM des Fiches
 *  -----------------------
 *  
 */
Object.defineProperties(Fiche.prototype,{

  /*
   *  Raccourcis pour obtenir les éléments DOM de la fiche
   *    
   */
  /* Définit et retourne le JID de la fiche */
  "jid":{
    get:function(){
      if(this._jid == undefined) this._jid = "fiche#"+this.dom_id ;
      return this._jid
    }
  },
  /* Définit et retourne le `dom_id' qui va permettre de construire l'id des éléments DOM */
  "dom_id":{
    get:function(){
      if(this._dom_id == undefined) this._dom_id = "f-"+this.id ;
      return this._dom_id
    }
  },
  /* Recto de la fiche */
  "recto_jid":{get:function(){return 'recto#'+this.dom_id+'-recto'}},
  "recto":{get:function(){ return $(this.recto_jid) }},
  
  /* Verso de la fiche */
  "verso_jid":{get:function(){ return 'verso#'+this.dom_id+'-verso'}},
  "verso":{get:function(){ return $(this.verso_jid) }},
  
  /* ---------------------------------------------------------------------
   *  Items de la fiche
   --------------------------------------------------------------------- */
  /* Div des items (children) de la fiche */
  "items_jid":{get:function(){return 'div#'+this.dom_id+'-items'}},
  "div_items":{
    get:function(){
      if(!this._div_items || this._div_items.length == 0) this._div_items = $(this.items_jid);
      return this._div_items
    }
  },
  
  
  /*
   *  Définit si nécessaire l'objet jQuery de la fiche et le retourne
   *  
   */
  "obj":{
    get:function(){
      if(undefined == this._obj){
        var obj = $(this.jid)
        obj.length && (this._obj = obj)
      } 
      return this._obj
    }
  },
  
  /* Retourne le DOM élément de la fiche */
  "dom_obj":{
    get:function(){
      if(undefined == this._dom_obj) this._dom_obj = this.obj[0]
      return this._dom_obj
    }
  },

  /* ---------------------------------------------------------------------
   *
   *  MÉTHODES DE SÉLECTION
   *  
   --------------------------------------------------------------------- */
  
  
  /* Sélection et désélection de la fiche 
   *
   * NOTES
   * -----
   *  # Stoppe l'évènement pour qu'il ne se propage pas aux fiches
   *    ancêtres si elles existent.
   *
   * @param evt   Évènement click qui a permis de sélectionner/déselectionner la fiche
   *              En fonction de la pression ou non de la touche majuscule le comportement
   *              et différent.
   */
  "toggle_select":{
    value:function(evt){
      var idm = "Fiche::toggle_select ["+this.type_id+"] (this.selected:"+this.selected+")"
      dlog("---> "+idm, DB_FCT_ENTER )
      if (false == this.selected) this.select ;
      dlog("<- "+idm+ " (en stoppant l'évènement)", DB_FCT_ENTER )
      return stop_event(evt)
    }
  },
  "select":{
    get:function(){
      FICHES.add_selected( this )
      this.selected = true
      if(this.built) this.obj.addClass('selected')
      this.repercute_zindex_on_ancestors(5 + parseInt(this.obj.css('z-index'),10))
    }
  },
  "deselect":{
    get:function(){
      var idm = "Fiche::deselect ["+this.type_id+"] / this.selected:"+this.selected
      dlog("---> "+idm, DB_FCT_ENTER)
      FICHES.remove_selected( this )
      if(this.retourned) this.retourne
      this.selected = false
      if(this.built) this.obj.removeClass('selected')
      this.repercute_zindex_on_ancestors('')
      dlog("<- "+idm, DB_FCT_ENTER)
    }
  },
  
  /*
   *  Sélectionne le parent
   *  
   */
  "select_parent":{
    get:function(){
      if(this.is_book) return F.show(LOCALE.fiche.message['book has no parent'])
      if(!this.parent) return F.show(LOCALE.fiche.message['no parent'])
      this.parent.select
    }
  },
  
  /*
   *  Sélectionne le premier enfant
   *  
   *  NOTES
   *  -----
   *    = La méthode gère sans problème les enfants non chargés et la fermeture
   *      de la fiche.
   */
  "select_first_child":{
    get:function(){
      if(this.has_children == false) return F.show(LOCALE.fiche.message['no children'])
      if(this.opened == false)
      {
        if(this.is_not_openable) return this.rend_openable('select_first_child')
        else this.open
      } 
      this.enfants[0].select
    }
  },
  
  /*
   *  Sélection la fiche précédente (sibling)
   *  
   *  NOTES
   *  -----
   *    = Le traitement est spécial pour les livres, ils sont conservés
   *      dans l'ordre de leur instanciation (création) dans Collection.books
   */
  "select_previous":{
    get:function(){
      if(this.is_book)
      {
        prev_indice = this.indice ? this.indice - 1 : Collection.books.length - 1
        Collection.books[prev_indice].select
      }
      else
      {
        if(this.indice == 0) return
        this.parent.enfants[this.indice - 1].select
      }
    }
  },
  
  /*
   *  Sélectionne la fiche suivante (sibling)
   *  
   */
  "select_next":{
    get:function(){
      if(this.is_book)
      {
        next_indice = this.indice + 1
        if(next_indice > Collection.books.length - 1) next_indice = 0
        Collection.books[next_indice].select
      }
      else
      {
        if(this.indice == this.parent.enfants.length -1) return
        this.parent.enfants[this.indice + 1].select
      }
    }
  },
  
  /* ---------------------------------------------------------------------
   *
   *  CONSTRUCTEURS DE CODE
   *  
   --------------------------------------------------------------------- */
  
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
  
  /* ---------------------------------------------------------------------
   *  Champ principal
   *
   *  - C'est le titre pour les book, chap et page. C'est le texte pour les
   *    paragraphes.
   *  - Il peut être en champ de saisie (input-text ou textarea) quand la fiche
   *    est ouverte ou div quand la fiche est fermée (tout type).
   *
   *  C'est donc une propriété définie dynamiquement.
   *
   */
  
  /* Propriété principale */
  "main_prop":{
    get:function(){return this.is_paragraph ? 'texte' : 'titre' }
  },
  
  /* 
   * Retourne le champ principal (soit div soit saisie suivant le contexte) 
   *
   *  NOTES
   *  -----
   *  Pour forcer la définition, utiliser `this._main_field = null'
   *
   */
  "main_field":{
    get:function(){
      if(!this._main_field || this._main_field.length == 0)
      {
        if(this.is_paragraph)
        {
          if(this.opened) this._main_field = $(this.textarea_texte_jid)
          else            this._main_field = $(this.div_texte_jid)
        }
        else
        {
          if(this.opened) this._main_field = $(this.input_titre_jid)
          else            this._main_field = $(this.div_titre_jid)
        }
      }
      return this._main_field
    },
    set:function(obj){this._main_field = obj}
  },
  "main_field_as_div":{
    get:function(){ 
      return $(this.is_paragraph ? this.div_texte_jid : this.div_titre_jid)
    }
  },
  "main_field_as_input":{
    get:function(){
      return $(this.is_paragraph ? this.textearea_texte_jid : this.input_titre_jid)
    }
  },
  "titre_id"        :{get:function(){return this.dom_id+'-titre'}},
  "input_titre_jid" :{get:function(){return 'input#'+this.titre_id}},
  "div_titre_jid"   :{get:function(){return 'div#'+this.titre_id}},
  
  /* 
   * Remplace le DIV du main field par son champ d'édition (tout type de fiche) 
   *
   *  NOTES
   *  -----
   *    = Avant de procéder à l'opération, on désactive le click sur le DIV
   *      du titre (pas vraiment utile)
   *    = C'est la méthode appelante qui doit faire suivre le champ par UI.Input
   *
   */
  "set_main_field_as_input":{
    get:function(){
      // On désactive le click sur le DIV titre
      // this.main_field.unbind('click', $.proxy(FICHES.on_click_on_main_field, FICHES, this))
      if(this.is_paragraph) this.texte_in_textarea
      else                  this.titre_in_input
      this.main_field = this.main_field_as_input
      this.main_field.set( this.main_field_value(false) )
    }
  },
  "set_main_field_as_div":{
    get:function(){
      if(this.is_paragraph) this.texte_in_div
      else                  this.titre_in_div
      this.main_field = this.main_field_as_div
      this.main_field.set( this.main_field_value(true) )
    }
  },
  "titre_in_input":{
    get:function(){
      // if(this.built && this.main_field_as_div.length == 0)
      // {
      //   console.warn("Le DIV du champ principal de "+this.type_id+" est introuvable…")
      // }
      // else 
      this.main_field_as_div.replaceWith(this.html_input_titre)
    }
  },
  "titre_in_div":{
    get:function(){
      // if(this.built && this.main_field_as_input.length == 0)
      // {
      //   console.warn("Le champ de saisie principal de "+this.type_id+" est introuvable…")
      // }
      // else 
      this.main_field_as_input.replaceWith( this.html_div_titre )
    }
  },
  /* Place le texte dans un textarea */
  "texte_in_textarea":{
    get:function(){
      var idm = "Paragraph::texte_in_textarea ["+this.type_id+"]"
      dlog("---> "+idm, DB_FCT_ENTER)
      // if(this.main_field_as_div.length == 0)
      // {
      //   console.error("Le DIV du champ principal de "+this.type_id+" est introuvable…")
      // }
      // else 
      this.main_field_as_div.replaceWith(this.html_textarea_texte)
      dlog("<- "+idm, DB_FCT_ENTER)
    }
  },
  /* Place le texte dans un div */
  "texte_in_div":{
    get:function(){
      var idm = "Paragraph::texte_in_div ["+this.type_id+"]"
      dlog("---> "+idm, DB_FCT_ENTER)
      // if(this.main_field_as_input.length == 0)
      // {
      //   console.error("Le champ de saisie principal de "+this.type_id+" est introuvable…")
      // }
      // else 
      this.main_field_as_input.replaceWith( this.html_div_texte )
      dlog("<- "+idm, DB_FCT_ENTER)
    }
  },
  
  /* /Fin champ principal
     --------------------------------------------------------------------- */
  
  /* ---------------------------------------------------------------------
   *
   *  Méthodes d'actions
   *  
   --------------------------------------------------------------------- */
  
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

      // On remplace le DIV par un INPUT/TEXTAREA
      this.set_main_field_as_input

      // On le suit
      UI.Input.bind( this.main_field ).select()
      
      dlog("<- "+idm, DB_FCT_ENTER)
    }
  },
  "disable_main_field":{
    get:function(){
      var idm = "Fiche::disable_main_field ["+this.type_id+"]"
      dlog("---> "+idm, DB_FCT_ENTER)
      
      // On arrête le suivi par UI.Input (pas vraiment utile puisque le
      // champ de saisie va être supprimé, mais c'est plus correct, non?…)
      UI.Input.unbind(this.main_field)
      
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
      this.main_field.set(this.main_field_value(true))
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
                  '<div id="'+this.dom_id_clone+'-titre" class="titre">'+this.main_field_value(true)+'</div>'+
                '</recto>'+
              '</fiche>'
    }
  },
  
  
})