/**
  * @module     fiche_dom
  * @submodule  dom
  * @main       Fiche
  */

/*
  * @class Fiche
  */
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
  /**
    * Définit et retourne le JID (selector jQuery) de la fiche
    *
    * @property jid
    * @type     {String}
    * 
    */
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
  /* jID du recto de la fiche */
  "recto_jid":{get:function(){return 'recto#'+this.dom_id+'-recto'}},
  /**
    * Objet DOM du recto de la fiche (jQuerySet)
    * @property {jQuerySet} recto
    */
  "recto":{get:function(){ return $(this.recto_jid) }},
  
  /* jID du verso */
  "verso_jid":{get:function(){ return 'verso#'+this.dom_id+'-verso'}},
  /**
    * Objet DOM du verso de la fiche (jQuerySet)
    * @property {jQuerySet} verso
    */
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
  
  
  /**
    * Définit si nécessaire l'objet jQuery de la fiche et le retourne
    *
    * NOTES
    * -----
    *   * C'est un set jQuery, mais il n'est défini QUE si l'objet existe
    *     vraiment dans le DOM. Inutile de faire `fiche.obj.length == 0` pour
    *     s'assurer qu'il existe bien, `fiche.obj` suffit car il renvoie null
    *     si la fiche n'est pas encore construite.
    *
    * @property {jQuerySet} obj
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
  
  /**
    * DOM élément de la fiche 
    * @property {HTMLDom} dom_obj
    */
  "dom_obj":{
    get:function(){
      if(undefined == this._dom_obj) this._dom_obj = this.obj[0]
      return this._dom_obj
    }
  },

  /**
    * Ouvre la fiche
    * --------------
    *
    * NOTES
    * -----
    *   * L'opération produit des résultats différents en fonction du type
    *     de la fiche. Par exemple, pour une page, on la sort de son parent
    *     et on montre ses enfants (paragraphes).
    *   * Propriété complexe, donc appeler sans parenthèses.
    *   * Si une méthode doit suivre, définir `this.pour_suivre_open`
    *   * La méthode peut être appelée même si la fiche est ouverte, dans lequel
    *     cas seul la méthode pour suivre sera traitée.
    *   * La méthode est récursive, c'est-à-dire qu'elle ouvre tous les parents
    *     avant de s'ouvrir.
    *   * Lorsque l'option "Livres rangés" est choisie dans les préférences de
    *     l'application, la méthode utilise un comportement particulier pour ouvrir
    *     le livre : elle le décale vers la droite de UI.GRID_X.
    *
    * @method open
    * @async
    *
    */
  "open":{
    get:function(){
      var idm = "Fiche::open ["+this.type_id+"]" 
      dlog("---> "+idm, DB_FCT_ENTER)
      if(!this.opened)
      {
        if(!this.loaded) return this.load('open')
        if(this.parent && !this.parent.opened)
        {
          this.parent.pour_suivre_open = $.proxy(FICHES.open, FICHES, this)
          return this.parent.open
        }
        if(this.is_not_openable) return this.rend_openable('open')
        this.opened = true // applique la class 'opened' à l'objet DOM
        if(this.parent && this.is_page) this.unrange
        else if (this.is_book && App.preferences['gridbook'] == true)
        {
          if(App.preferences['dirgridbook'] == 'v') this.left += UI.GRID_X
                                               else this.top += UI.GRID_Y
        }
        this.positionne
      }
      if('function' == typeof this.pour_suivre_open)
      {
        this.pour_suivre_open()
        delete this.pour_suivre_open
      }
      dlog("<- "+idm, DB_FCT_ENTER)
    }
  },
  /**
    * Ferme la fiche
    *
    * Notes
    * -----
    *   * Propriété complexe => appeler sans parenthèses
    *   * En mode fermé, le titre est disabled
    *   * Si la préférences "Livre rangé" est true et que c'est un livre, on
    *     doit le recaler à sa place.
    *
    * @method close
    */
  "close":{
    get:function(){
      var idm = "Fiche::close ["+this.type_id+"]"
      dlog("---> "+idm, DB_FCT_ENTER)
      if(this.retourned) this.retourne
      this.opened = false
      if(this.is_page && this.parent) this.range
      else if (this.is_book && App.preferences['gridbook'] == true)
      {
        if(App.preferences['dirgridbook'] == 'v') this.left -= UI.GRID_X
                                             else this.top -= UI.GRID_Y
      }
      dlog("<- "+idm, DB_FCT_ENTER)
    }  
  },
  
  /*
   *  Range la fiche
   *  
   *  NOTES
   *  -----
   *  * La fiche peut avoir un clone dans son parent, qu'il faut alors
   *    supprimer.
   *  * On supprime le draggable de la fiche et on ajoute un sortable
   *
   */
  "range":{
    get:function(){
      var idm = "Fiche::range ["+this.type_id+"]"
      dlog("---> "+idm, DB_FCT_ENTER)
      if(!this.parent) throw LOCALE.fiche.error['unable to range orphelin']
      if(this.obj_clone.length) this.unclone
      else this.parent.div_items.append( this.obj )
      if(this.draggable)
      {
        this.obj.draggable("destroy")
        this.draggable = false
      }
      // this.rend_sortable
      this.obj.addClass('ranged')
      dlog("<- "+idm, DB_FCT_ENTER)
    }
  },
  /*
   *  Sort la fiche de son rangement
   *  
   */
  "unrange":{
    get:function(){
      if(!this.parent) throw LOCALE.fiche.error['unable to unrange orphelin']
      this.clone
      this.obj.removeClass('ranged')
      if(this.sortable)
      {
        this.obj.sortable("destroy")
        this.sortable = false
      }
      this.rend_draggable
    }
  },
  
  /**
    * Montrer la fiche (quel que soit son type)
    *
    * Notes
    * -----
    *   * La méthode est principalement appelée quand on clique sur une référence
    *     dans un texte. Cela produit un appel à `FICHES.show` qui appelle la
    *     méthode `show` propre à chaque type de fiche.
    *   * La méthode est aussi intensivement utilisée pour les recherches dans les
    *     fiche, dans le listing de résultat.
    *   * Pour une page, la montrer consiste à l'ouvrir. Mais cette page peut ne pas
    *     être encore chargée, donc il faut s'assurer qu'elle puisse être ouverte
    *     en chargeant tous ses parents si elle en a.
    *   * La méthode est asynchrone seulement si ses parents et ses enfants ne sont
    *     pas encore chargés
    *
    * @method show
    * @param  {Object|Undefined} options Options d'affichage
    *   @param {Boolean}  options.select    Si true, sélectionne la fiche
    *   @param {Boolean}  options.open      Si true, ouvre la fiche
    *   @param {Function} options.suivre    La méthode pour suivre, if any
    *   @param {Boolean}  options.no_light  Si true, pas de clignotement
    * @async
    */
  "show":{
    value:function(options){
      dlog("-> Fiche::show ["+this.type_id+"]", DB_FCT_ENTER)
      if(!this.loaded) return this.load($.proxy(this.show, this, options))
      if(this.parent)
      {
        this.parent.pour_suivre_open = $.proxy(this.suite_show, this, options)
        return this.parent.open
      }
      else
      {
        this.suite_show(options)
      }
    }
  },
  
  /**
    * Retourne la fiche (sélectionnée)
    * Notes
    *   * À sa construction, la fiche ne prépare pas son verso (pour être plus efficace)
    *     Donc lorsqu'on retourne pour la première fois une fiche, il faut s'assurer
    *     que son verso est preparé (`verso_ready`). Cela se fait dans la méthode
    *     `regle_verso`.
    *
    * @property retourne
    * @type     {Nothing}
    */
  "retourne":{
    get:function()
    {
      this.recto[this.retourned ? 'show' : 'hide']()
      this.verso[this.retourned ? 'hide' : 'show']()
      this.retourned = !this.retourned
      if(this.retourned) this.regle_verso
    }
  },  

  /* ---------------------------------------------------------------------
   *
   *   MÉTHODES DOM DIVERSES
   *
   --------------------------------------------------------------------- */
  /**
    * Méthode appelée à la fin de chaque méthode `show` pour traiter 
    * la visibilité suivant les options
    * Notes
    * -----
    *   * Les options sont défines dans FICHES.show et dépendent des modifiers
    *     utilisés en cliquant sur la référence.
    *   * Si aucune option de sélection ou d'ouverture n'est demandé, la méthode
    *     fait simplement clignoter la fiche.
    *   * Pour un paragraphe, il faut scroller jusqu'à lui dans la page.
    *
    * @method suite_show
    * @param  {Object|Null} options
    *   @param {Boolean}  options.select    Si true, sélectionne la fiche
    *   @param {Boolean}  options.open      Si true, ouvre la fiche
    *   @param {Function} options.suivre    La méthode pour suivre, if any
    *   @param {Boolean}  options.no_light  Si true, pas de clignotement
    */
  "suite_show":{
    value:function(options){
      if(undefined == options) options = {}
      // if(this.is_paragraph && this.parent)
      // {
      //   this.parent.div_items.scrollTo(this.obj, 400, {axis:'y'})
      //   F.show("Je dois scroller jusqu'à para:"+this.id)
      // }
      if(options.select)  this.select
      if (options.open)   this.open
      if (!options.no_light) this.highlight()
      if (options.suivre) this.options.suivre()
    }
  },
  /**
    * Fait clignoter la fiche
    * Notes
    * -----
    *   * La méthode/procédure qui appelle cette méthode doit s'assurer que
    *     la fiche est chargée et visible
    *
    * @method highlight
    *
    */
  "highlight":{
    value:function(){
      if(undefined == this.highlight_count)
      { 
        this.highlight_count = 0
        this.timer_highlight = setInterval($.proxy(this.highlight, this), 100)
        this.color_highlight = ""
      }
      else 
      {
        if(this.highlight_count > 10)
        {
          clearInterval(this.timer_highlight)
          delete this.highlight_count
          this.color_highlight = "red" // pour ne pas avoir à compter
        }
        else
        {
          this.highlight_count ++ ;
        }
      }
      this.color_highlight = this.color_highlight=="red" ? "" : "red"
      this.obj.css('border-color', this.color_highlight)
      if(this.is_paragraph) this.obj.css('background-color', this.color_highlight)
    }
  },
  
  /* ---------------------------------------------------------------------
   *
   *  MÉTHODES DE DÉPLACEMENT
   *  
   --------------------------------------------------------------------- */
  /**
    * Déplacement de l'enfant vers le haut
    *
    * Notes
    * -----
    *   * Méthode "complexe", donc invoquée sans parenthèses
    *   * Je pourrais utiliser la méthode this.onchange_ordre_enfants pour prendre
    *     le nouvel ordre à chaque fois, mais ça risque d'être intense pour rien.
    *     Au lieu de ça, j'utilise un timeout qui appelera la méthode seulement 
    *     lorsque les déplacements sembleront terminés.
    *
    * @method move_up
    */
  "move_up":{
    get:function(){
      if(this.is_orpheline) return false
      this.unset_timer_move
      if(this.obj.prev().length)
      {
        this.obj.insertBefore(this.obj.prev())
      }
      else F.show("Impossible d'aller plus haut…")
      this.set_timer_move
    }
  },
  /**
    * Déplacement de l'enfant vers le bas
    * Notes
    * -----
    *   * Cf. les notes de la méthode `move_up`.
    * @method move_down
    *
    */
  "move_down":{
    get:function(){
      if(this.is_orpheline) return false
      this.unset_timer_move
      if(this.obj.next().length)
      {
        this.obj.insertAfter(this.obj.next())
      }
      else F.show("Impossible d'aller plus bas…")
      this.set_timer_move
    }
  },
  "set_timer_move":{
    get:function(){
      stop_save
      this.timer_move = setTimeout($.proxy(this.parent.onchange_ordre_enfants, this.parent), 2000)
    }
  },
  "unset_timer_move":{
    get:function(){
      if(this.timer_move) clearTimeout(this.timer_move)
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
  
  /**
    * Sélection la fiche précédente (sibling)
    * 
    * Notes
    * -----
    *   * Le traitement est spécial pour les livres, ils sont conservés
    *     dans l'ordre de leur placement sur la table
    *   * Propriété complexe => appeler sans parenthèses
    *
    * @method select_previous
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
      return '<div id="'+this.titre_id+'" class="titre">'+this.titre+'</div>'
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
  
  /** 
    * Propriété principale en fonction du type de la fiche. Pour un paragraphe,
    * la propriété principale est `texte`, pour toutes les autres fiches, c'est
    * `titre`
    *
    * @property {String} main_prop
    * @static
    */
  "main_prop":{
    get:function(){return this.is_paragraph ? 'texte' : 'titre' }
  },

  /** 
    * Retourne le champ principal (soit le DIV soit le champ de saisie suivant
    * le contexte) 
    * Notes
    *   * Pour forcer la définition, utiliser `this._main_field = null'
    *   * La propriété se sert de `this.opened` pour savoir si on est en édition
    *     ou non. Mais est-ce vraiment la bonne propriété à regarder ?…
    * @property {jQuerySet} main_field
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
          else            this._main_field = $(this.div_main_prop_jid)
        }
      }
      return this._main_field
    },
    set:function(obj){this._main_field = obj}
  },
  "main_field_as_div":{
    get:function(){ 
      return $(this.is_paragraph ? this.div_texte_jid : this.div_main_prop_jid)
    }
  },
  "main_field_as_input":{
    get:function(){
      return $(this.is_paragraph ? this.textearea_texte_jid : this.input_titre_jid)
    }
  },
  "titre_id"        :{get:function(){return this.dom_id+'-titre'}},
  "input_titre_jid" :{get:function(){return 'input#'+this.titre_id}},
  "div_main_prop_jid"   :{get:function(){return 'div#'+this[(this.is_paragraph?'texte':'titre')+'_id']}},
  
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
  /** 
    * Place le texte dans un textarea pour son édition
    * Notes
    *   * Pour les paragraphes, adapte la taille du textarea à la
    *     taille du texte.
    *   * Propriété complexe => appeler sans parenthèses
    *
    * @method texte_in_textarea
    */
  "texte_in_textarea":{
    get:function(){
      var idm = "Paragraph::texte_in_textarea ["+this.type_id+"]"
      dlog("---> "+idm, DB_FCT_ENTER)
      this.main_field_as_div.replaceWith(this.html_textarea_texte)
      if(this.is_paragraph) UI.Textarea.adapt(this.textarea_texte)
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
  
  /**
    * Passe le titre/texte en édition
    * 
    * NOTES
    * -----
    *   * C'est une méthode composée avec un propriété complexe. Elle
    *     s'appelle sans arguments ni parenthèses.
    *
    * PRODUIT
    * -------
    *   * Sélectionne la fiche
    *   * Remplace le div contenant le titre (ou le texte) par un champ
    *     de saisie.
    *   * Place les observers sur le champ de saisie.
    *   * Sélectionne le texte
    *
    * @method enable_main_field
    */
  "enable_main_field":{
    get:function(){
      var idm = "Fiche::enable_main_field ["+this.type_id+"]"
      dlog("---> "+idm, DB_FCT_ENTER)
      this.select
      this.set_main_field_as_input
      UI.Input.bind( this.main_field ).select()
      this.edited = true
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
      
      this.edited = false
      
      this.main_field.bind('click', $.proxy(FICHES.on_click_on_main_field, FICHES, this))
      dlog("<- "+idm, DB_FCT_ENTER)
    }
  },
  
  
  /* Retourne l'objet DOM du clone de la fiche */
  "obj_clone":{
    get:function(){return $('fiche#'+this.dom_id_clone)}
  },
  
  /**
    * Clone/Déclone la fiche courante
    *
    * NOTES
    * -----
    *   * Propriété complexe (appelé sans parenthèses)
    *   * "Cloner la fiche" consiste à :
    *       * Placer un clone de la fiche dans le parent, à la place de la fiche
    *       * Sortir le DOM Objet du parent pour le mettre sur la table
    *   * "Décloner" la fiche consiste à :
    *       * Remettre la fiche dans le parent
    *       * Détruire le clone
    *
    * @method clone
    *
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