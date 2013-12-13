OBJETS.Dom = {
  SHORTCUTS_COMMUNS:
    image('clavier/K_Entree.png') + " Balise, " +
    image('clavier/K_Escape.png') + " Fermer, " +
    image('clavier/K_Tab.png') + " Section suivante." ,
    
  /*
   *  Données pour focus
   *  
   *  PROPERTIES
   *  ----------
   *    next    Identifiant dans DFOCUS du prochain focus si TAB est utilisé
   *    obj     {jQuery Set} de l'élément DOM sur lequel placer le focus
   *
   */
  DFOCUS: {
    'onglets':{id:'onglets', prev:'options', next:'listing', obj:null, 
    help:
      "Presser la touche de la lettre pour changer d'onglet."
    },
    'listing':{id:'listing', prev:'onglets', next:'options', obj:null, 
    help:
      image('clavier/K_Command.png') + image('clavier/CLICK.png') + 
      "/" + image('clavier/CLICK.png') + image('clavier/K_Entree.png') + " Balise, " +
      image('clavier/K_FlecheH.png') + image('clavier/K_FlecheB.png') + " Suivant/précédent, " +
      image('clavier/K_Command.png') + " + LETTRE => Listing, " +
      image('clavier/K_E.png') + " Éditer, " + 
      image('clavier/K_Effacer.png') + " Détruire, "
    },
    'options':{id:'options', prev:'listing', next:'onglets', obj:null, help:null}
  },

  
  /*
   *  Focus courant {Hash}
   *  --------------------
   *  
   *  Le {Hash} dans this.DFOCUS qui détermine sur quoi focus actuellement
   *  le panneau. Peut-être la ligne d'onglets, le listing ou les options.
   *
   *  NOTES
   *  -----
   *    = À l'ouverture du panneau, le focus est toujours placé sur la
   *      barre d'onglets.
   *    = Le focus courant détermine le sens des raccourcis clavier
   *
   */
  current_focus:null,
  
  /*
   *  Indique que la fenêtre est construite
   *  
   */
  main_panneau_ready: false,
  
  /*
   *  Les Options {Hash} envoyées à la méthode choose_an_item
   *  
   */
  options:null,
  
  /*
   *  Options d'affichage courantes
   *
   *  NOTES
   *  -----
   *    = Ces options déterminent la balise qui sera produite.
   *
   *    = Ce {Hash} est rempli à la construction des CB pour choisir le type
   *      du lien à produire, à partir de la donnée FILMS.OPTIONS.
   *      Chaque clé est une option et sa valeur est true quand l'option est
   *      retenue, false dans le cas contraire.
   *
   *    = Pour modifier ou ajouter des options, il suffit de modifier la valeur
   *      de FILMS.OPTIONS (dans Films.js)
   *  
   */
  options_balise:{},
  
  
  /*
   *  Lettre courante (affichée)
   *  
   *  NOTES
   *  -----
   *    ::  Partout où je parle de « lettre » ci-dessous, il s'agit en vérité
   *        de la valeur ASCII de la lettre, sauf pour les chiffres qui sont
   *        tous représentés par 0.
   *    ::  Dans la table FILMS.DATA, c'est la propriété `let' qui contient cette
   *        valeur.
   */
  current_letter: null,
  
  /*
   *  Liste des lettres dont la liste a déjà été établie
   *  En clé : la lettre, en valeur : true
   */
  letters_built:{},
  
  /*
   *  Ouvre le panneau des films
   *  
   */
  show_panneau:function()
  {
    // Pas de sauvegarde pendant l'édition des films
    Collection.disable_save
    
    if(false == this.main_panneau_ready) this.prepare_panneau
    else this.panneau.show()
        
    // Il faut mémoriser le champ de saisie et sa sélection courante pour
    // pouvoir y revenir, car le panneau blur
    // @note: `current_textfield' est un timestamp qui permettrait
    // de "retreiver" le champ de saisie courant
    this.current_textfield = UI.Input.memorize_current({blur:true})

    // Pour le moment :
    this.old_window_onkeypress = window.onkeypress
    window.onkeypress = null
    
    this.set_focus_on('onglets')
  },
  
  /*
   *  Ferme le panneau des films
   *  
   *  NOTES
   *  -----
   *    = Relance la boucle de sauvegarde si on est en enregistrement
   *      automatique.
   */
  hide_panneau:function()
  {
    this.panneau.hide()
    UI.Input.retreive_current(this.current_textfield, {focus:true})
    window.onkeypress = this.old_window_onkeypress
    Collection.enable_save
    help('')
  },
  
  /*
   *  Reçoit le div principal de l'item +obj+ (DIV principal) et
   *  retourne l'identifiant de l'item
   *
   *  NOTES
   *  -----
   *    = Pour fonctionner, la convention est que l'identifiant de 
   *      l'élément se trouve toujours en seconde position dans l'identifiant
   *      du DOM Element, quand on le split avec de "-"
   *      I.e. : <balise>-<IDENTIFIANT>[-<autres valeurs>]
   *
   *  @param  obj   Un {jQuery Set} ou un {DOM Element}  
   */
  idOf:function(obj)
  {
    return $(obj)[0].id.split('-')[1]
  },
  
  /*
   *  Met le focus sur un élément du panneau (onglets, listing ou options)
   *  
   *  @param  idfocus   Clé {String} dans this.DFOCUS
   */
  set_focus_on:function(idfocus)
  {
    dlog("-> "+this.NAME+".set_focus_on('"+idfocus+"')", DB_FCT_ENTER)
    if(this.current_focus) this.current_focus.obj.removeClass('focused')
    this.current_focus = this.DFOCUS[idfocus]
    // dlog("idfocus:"+idfocus)
    // dlog("this.DFOCUS[idfocus]:")
    // dlog(this.DFOCUS[idfocus])
    this.current_focus.obj.addClass('focused')
    this.current_focus.obj[0].focus()
    F.clean()
    if(this.DFOCUS[idfocus].help)
    {
      help(this.DFOCUS[idfocus].help +', '+this.SHORTCUTS_COMMUNS)
    } 
  },
  
  // /*
  //  *  Active le gestion keypress pour le focus +idfocus+ {String}
  //  *  
  //  */
  // active_keypress_on:function(idfocus)
  // {
  //   
  // },

  keypress_on_onglets:function(evt)
  {
    dlog("-> "+this.NAME+".keypress_on_onglets", DB_FCT_ENTER)
    if( this.keypress_common(evt) ) return stop_event(evt)
    switch(evt.keyCode)
    {
    }
    var ccode = evt.charCode
    if(ccode.is_between(97, 122))
    {
      this.on_click_onglet(ccode - 32)
    }
    return stop_event(evt)
  },
  keypress_on_listing:function(evt)
  {
    dlog("-> "+this.NAME+".keypress_on_listing", DB_FCT_ENTER)
    if( this.keypress_common(evt) ) return stop_event(evt)
    var complex_method = null
    switch(evt.keyCode)
    {
    case K_UP_ARROW:    complex_method = 'select_prev_item'   ; break
    case K_DOWN_ARROW:  complex_method = 'select_next_item'   ; break
    case K_ERASE:       complex_method = 'remove_selected'    ; break
    // Note : La touche RETURN est traité dans keypress_common
    }
    if(complex_method)
    {
      this[complex_method]
      return stop_event(evt)
    }
    /*
     *  Dans le listing, le raccourci CMD + Lettre permet de 
     *  changer d'onglet.
     *  
     */
    var ccode = evt.charCode
    if(evt.metaKey)
    {
      if(ccode.is_between(97, 122))
      {
        this.on_click_onglet(ccode - 32)
      }
      return stop_event(evt)
    }
    else
    {
      switch(ccode)
      {
      case Key_e: this.edit_selected; break
      }
    }
    
  },

  /*
   *  Keypress commun à tous les focus
   *  
   */
  keypress_common:function(evt)
  {
    stop_event(evt)
    switch(evt.keyCode)
    {
    case K_RETURN:
      // Quel que soit le focus, la touche retour choisit l'item courant
      this.choose_current_item
      return true
    case K_TAB:
      this.set_focus_on( this.current_focus[evt.shiftKey ? 'prev' : 'next'] )
      return true
    case K_ESCAPE:
      this.hide_panneau()
      return true
    }
    switch(evt.charCode)
    {
    case Key_n: // => Nouveau film
      if(this.current_focus.id != 'listing' && evt.metaKey)
      {
        this.OBJS.Edition.edit()
        stop_event(evt)
        return true
      }
    }
    return false // la touche n'a pas été traitée ici
  },
  
  
  /*
   *  Méthode appelée quand on clique sur un onglet du panneau des films
   *
   *  NOTES
   *  -----
   *    ::  Si la liste des films de la lettre voulue n'est pas encore établie
   *        on la construit.
   *  
   *    ::  La méthode est appelée aussi après l'insertion d'un nouveau film
   *        pour forcer l'actualisation du panneau.
   *
   */
  on_click_onglet:function(letter)
  {
    if(this.current_letter) this.hide_listing(this.current_letter)
    $('div#'+this.prefix+'onglet_letter-'+letter).addClass('pressed')
    if(!this.letters_built[letter]) this.build_listing( letter )
    else this.show_listing(letter)
    this.set_focus_on('listing')
  },
  
  /*
   *  Quand on change une options d'affichage
   *  
   */
  onchange_option:function(obj)
  {
    var option = obj.id.split('-')[1]
    this.options_balise[option] = obj.checked
    this.set_apercu_balise
  },
  
  /*
   *  Affiche le listing de films de la lettre +letter+
   *  
   */
  show_listing:function(letter)
  {
    this.current_item = null
    this.current_letter  = letter
    $(this.jid_current_listing).show()
  },
  /*
   *  Masque le listing de films de la lettre +letter+
   *  
   */
  hide_listing:function(letter)
  {
    $(this.jid_current_listing).hide()
    $('div#'+this.prefix+'onglet_letter-'+letter).removeClass('pressed')
    this.current_letter  = null
    this.current_item     = null
  },
  
  /*
   *  Construit le listing de la lettre +letter+ (qui sera mise en courante)
   *  
   */
  build_listing:function(letter)
  {
    this.div_listing.append(this.html_listing(letter))
    this.letters_built[letter] = true
    this.current_letter = letter
  },
  
  /*
   *  Détruit le listing d'une lettre (pour rafraîchissement)
   *  
   */
  remove_listing_letter:function(letter)
  {
    if(!this.letters_built[letter]) return // rien à faire
    if(this.current_letter == letter) this.current_letter = null
    delete this.letters_built[letter]
    $('div#'+this.listing_id(letter)).remove()
    this.current_item = null
  },
  
  /*
   *  Méthode appelée quand on clique sur un film
   *
   *  NOTES
   *  -----
   *    = Si la touche CMD est pressée, on écrit directement la balise
   *      dans le texte édité.  
   */
  on_select_item:function(fid, evt)
  {
    this.current_item = fid
    if(evt.metaKey) this.OBJS.on_choose_item(fid)
    else
    {
      this.set_focus_on('listing')
    }
  },
  
  /*
   *  Détruit le DOMElement du film d'identifiant +fid+
   *  s'il est construit
   *
   */
  remove_item:function(fid)
  {
    $('div#'+this.id_div_item(fid)).remove()
  },
 

  /*
   *  Retourne le code HTML du listing de la lettre +letter+
   *  C'est un DIV contenant tous les items de cette lettre
   *  
   */
  html_listing:function(letter){
    var fdata, c = "", letter_list, i = 0, items_count ;
    this.OBJS.check_if_list_per_letter_ok
    letter_list = this.OBJS.DATA_PER_LETTER[letter]
    items_count = letter_list.length
    for(; i<items_count; ++i) 
    {
      /*
       *  AJOUT DU DIV DU FILM
       *  
       */
      c += this.html_div_item(this.OBJS.DATA[letter_list[i]])
    }
    return '<div id="'+this.listing_id(letter)+'" class="listing_films">' + c + '</div>'
  },
  
  /* Retourne l'identifiant DOM du div principal d'un item de la liste (un film) */
  id_div_item:function(item_id){ return this.prefix+"div_item-"+item_id },

  /* 
   * Retourne le {jQuery Set} du div principal d'un item de la liste 
   *
   */
  div_item:function(item_id)
  {
    return $('div#' + this.id_div_item(item_id))
  },

  /* Retourne l'identifiant du listing (DIV) pour la lettre +letter+ */
  listing_id:function(letter){
    return "panneau_"+this.prefix+"listing-"+letter
  }
  
}

/*
 *  Propriétés complexes à ajouter aux sous-objets <OBJETS PLURIEL>.Dom
 *  
 */
OBJETS_Dom_defined_properties = {
  /* ---------------------------------------------------------------------
   *
   *  ÉLÉMENTS DOM
   *
   */
  /* Le panneau complet */
  "id_panneau":{get:function(){ return this.prefix+"panneau" }},
  "jid_panneau":{get:function(){ return "panneau#"+this.id_panneau}},
  "panneau":{
    get:function(){ return $(this.jid_panneau)}
  },
  
  /* Le DIV de la barre d'onglets */
  "div_onglets":{
    get:function(){ return $(this.jid_panneau + ' > div#'+this.id_panneau+'_onglets')}
  },
  /* Le DIV contenant tous les listings par lettre */
  "div_listing":{
    get:function(){ return $(this.jid_panneau + ' > div#'+this.id_panneau+'_listings')}
  },
  /* Le DIV des options de balise */
  "div_options":{
    get:function(){ return $(this.jid_panneau + ' > div#'+this.id_panneau+'_options')}
  },
  /*
   *  Retourne le DIV du listing courant ({jQuery Set})
   *  
   */
  "div_current_listing":{
    get:function(){
      return $(this.jid_current_listing)
    }
  },
  /* Retourne le jID du listing de la lettre courante */
  "jid_current_listing":{
    get:function(){ return "div#"+this.listing_id(this.current_letter)}
  },
  
  /*
   *  Retourne le {jQuery Set} du DIV principal de l'élément sélectionné
   *  
   */
  "div_current_item":{
    get:function(){ return this.div_item(this.current_item) }
  },
 
  
  /* ---------------------------------------------------------------------
   *  MÉTHODES
   --------------------------------------------------------------------- */
  
  /*
   *  Les trois méthodes suivantes gèrent l'utilisation des raccourcis
   *  clavier sur le div listing.
   *  
   */
  /*
   *  Retourne ou définit l'IDENTIFIANT de l'item courant
   *
   *  Lors de la définition (this.current_item = ID), la méthode désactive
   *  l'item courant s'il existe et applique le style selected au nouvel
   *  item courant.
   *  
   */
  "current_item":{
    get:function(){return this._current_item || null},
    set:function(cur){
      if(this.current_item) this.div_item(this.current_item).removeClass('selected')
      if(cur) // car la méthode peut être appelée pour déselectionner le courant
      {
        this.div_item(cur).addClass('selected')
        this.scroll_to_current_item
        this.set_apercu_balise
      }
      this._current_item = cur
    }
  },
  /* Sélectionne l'item suivant dans le listing */
  "select_next_item":{
    get:function(){
      var obj ;
      obj = this.current_item ? this.div_current_item.next()
                              : this.div_current_listing.find('div:first-child')
      if(obj.length) this.current_item = this.idOf(obj)
    }
  },
  /* Sélectionne l'item précédent dans le listing */
  "select_prev_item":{
    get:function(){
      var obj ;
      obj = this.current_item ? this.div_current_item.prev()
                              : this.div_current_listing.find('div:first-child')
      if(obj.length) this.current_item = this.idOf(obj)
    }
  },
  /* Choisit l'item courant du listing (= click sur le titre) */
  "choose_current_item":{
    get:function(){
      if(this.current_item)
      {
        this.OBJS.on_choose_item(this.current_item)
      }
      else
      {
        F.show(LOCALE.film.message['must choose a film'])
      }
    }
  },
  
  /*
   *  Passer l'item sélectionné en édition
   *  
   */
  "edit_selected":{
    get:function(){
      if(!this.current_item) return F.show(LOCALE.film.message['no item selected']+' '+LOCALE.film.message['choose item to edit it'])
      this.OBJS.Edition.edit(this.current_item)
    }
  },
  
  /*
   *  Détruire l'item sélectionné
   *  
   */
  "remove_selected":{
    get:function(){
      if(!this.current_item) return F.show(LOCALE.film.message['no item selected']+' '+LOCALE.film.message['cant remove item'])
      FILMS.Edition.want_remove(this.current_item)
    }
  },
  
  /*
   *  Scroll jusqu'à l'item courant (sélectionné)
   *  
   */
  "scroll_to_current_item":{
    get:function(){
      if(this.current_item)
      {
        var obj = this.div_item(this.current_item)
        this.div_listing.scrollTop(obj.position().top - 50)
      }
    }
  },
  
  /*
   *  Règle les options d'affichage du titre
   *  (à la construction de la fenêtre)
   *
   *  NOTES
   *  -----
   *    = Règle aussi l'aperçu du titre
   *  
   */
  "set_options":{
    get:function(){
      for(var opt in this.options_balise){
        this.set_option(opt)
      }
      this.set_apercu_balise
    }
  },
  "set_option":{
    value:function(opt, value){
      if(undefined != value) this.options_balise[opt] = value
      $('div#'+this.id_panneau+'_options input[type="checkbox"]#'+this.prefix+'option-'+opt)[0].checked = this.options_balise[opt]
    }
  },
  "toggle_option":{
    value:function(opt){
      this.set_option(opt, !this.options_balise[opt])
      this.set_apercu_balise
    }
  },
  
  
  /* ---------------------------------------------------------------------
   *  ACTIONS SUR ÉLÉMENTS DOM
   * --------------------------------------------------------------------- */
  
  /*
   *  Affiche/Masque le formulaire
   * 
   * 
   */
  "show_formulaire":{
    get:function(){
      L(['tools', 'onglets', 'listings', 'buttons', 'options']).each(function(suf){
        $('div#'+this.id_panneau+'_'+suf).hide()
      })
      $('div#'+this.id_panneau+'_edition').show()
    }
  },
  "hide_formulaire":{
    get:function(){
      $('div#'+this.id_panneau+'_edition').hide()
      L(['tools', 'onglets', 'listings', 'buttons', 'options']).each(function(suf){
        $('div#'+this.id_panneau+'_'+suf).show()
      })
    }
  },
  
  /* ---------------------------------------------------------------------
   *
   *  CONSTRUCTEURS
   *
   */
  
  /*
   *  Préparation du panneau des films (rendu draggable)
   *  
   */
  "prepare_panneau":{
    get:function(){
      $('body').append( this.html_main_panneau )
      // Définition du focus
      var idfocus, obj ;
      for(idfocus in this.DFOCUS)
      {
        obj = this.DFOCUS[idfocus].obj = this['div_'+idfocus]
        dlog("obj mis à this[div_"+idfocus+"] :")
        dlog(this['div_'+idfocus])
        obj.bind('keypress', $.proxy(this['keypress_on_'+idfocus], this))
        // obj.bind('click', $.proxy(this.set_focus_on, this, idfocus))
      }
      // Observers
      this.panneau.draggable({containment:'parent'})
      // On coche les options par défaut
      this.set_options
      this.main_panneau_ready = true
    }
  },
  
 
  /*
   *  Fabrication de la liste des films
   *  
   *  NOTES
   *  -----
   *    ::  On ne fabrique que le "gabarit" avec les onglets
   *        C'est seulement le click sur un onglet qui déterminera l'affichage
   *        de la liste.
   */
  "html_main_panneau":{
    get:function(){
      return  '<panneau id="'+this.id_panneau+'" class="main_panneau_items">' +
                this.html_div_outils  +
                this.div_edition +
                this.html_div_onglets +
                '<div id="'+this.id_panneau+'_listings" class="focusable main_panneau_listings" tabindex="1"></div>' +
                this.html_div_options +
                this.div_boutons +
              '</panneau>'
    }
  },
  /*
   *  Construit et retourne le DIV des options
   *  
   */
  "html_div_options":{
    get:function(){
      var cbs = "", id, opt ;
      this.options_balise = {}
      for(opt in this.OBJS.OPTIONS)
      {
        this.options_balise[opt] = this.OBJS.OPTIONS[opt].valdef
        id   = this.prefix+"option-"+opt
        cbs += '<input type="checkbox" id="'+id+'" ' +
                'onchange="$.proxy('+this.as_string+'.onchange_option, '+this.as_string+', this)()" />' +
                '<label for="'+id+'">'+ this.OBJS.OPTIONS[opt].hname +'</label>' ;
      }
      var aspect_titre = '<span id="'+this.prefix+'aspect_balise" class="item_aspect_balise">Titre original</span>'
      return '<div id="'+this.id_panneau+'_options" class="focusable main_panneau_options" tabindex="2">' + aspect_titre + cbs + '</div>'
    }  
  },
  

  /*
   *  Construit le div des onglets lettre
   *  
   */
  "html_div_onglets":{
    get:function(){
      var c = '<div id="'+this.id_panneau+'_onglets" class="focusable main_panneau_onglets" tabindex="0">'
      // Seulement pour FILMS
      if(this.as_string ==  'FILMS.Dom') c += this.div_onglet( 0, '0-9' )
      for(var i = 65; i<=90; ++i){
        c += this.div_onglet( i, String.fromCharCode(i) )
      }
      c += '</div>'
      return c
    }
  },
  /* Retourne le code HTML pour un onglet de code +ascii+ et de titre +letter+ */
  "div_onglet":{
    value:function(ascii, letter){
      return '<div id="'+this.prefix+'onglet_letter-'+ascii+
      '" class="onglet_letter" onclick="$.proxy('+this.as_string+'.on_click_onglet, '+this.as_string+', '+
      ascii+')()">'+letter+'</div>'
    }
  },
  
  /*
   *  Construit le div des outils du panneau
   *  
   */
  "html_div_outils":{
    get:function(){
      return '<div id="'+this.id_panneau+'_tools">' + '</div>'
    }
  },
  /*
   *  Construit le div du formulaire de film
   *  
   */
  "div_edition":{
    get:function(){
      return '<div id="'+this.id_panneau+'_edition">' + '</div>'
    }
  },
  /*
   *  Code HTML du div des boutons (bas)
   *  
   */
  "div_boutons":{
    get:function(){
      return '<div id="'+this.id_panneau+'_buttons" class="buttons">' +
      '<input type="button" value="+" onclick="$.proxy('+this.parent_as_string+'.Edition.edit, FILMS.Edition)()" class="fleft" />' +
      '<input type="button" value="Renoncer" onclick="$.proxy('+this.as_string+'.hide_panneau, '+this.as_string+')()" />' +
      '</div>'
    }
  }
  
}
/* /OBJETS_Dom_defined_properties */
