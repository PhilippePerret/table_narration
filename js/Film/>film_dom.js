FILMS.Dom = {
  SHORTCUTS_COMMUNS:
  image('clavier/K_Escape.png') + " pour renoncer, " +
  image('clavier/K_Tab.png') + " pour focusser sur la section suivante, "
  ,
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
    'onglets':{id:'onglets', prev:'options', next:'listing', obj:null, help:
      "Presser la touche de la lettre pour changer d'onglet."
    },
    'listing':{id:'listing', prev:'onglets', next:'options', obj:null, help:
      image('clavier/K_FlecheH.png') + " et " + image('clavier/K_FlecheB.png') +
      " pour sélectionner les films. " +
      image('clavier/K_Command.png') + " + LETTRE pour changer d'onglet." +
      image('clavier/K_E.png') + " pour éditer le film sélectionner. "
    },
    'options':{id:'options', prev:'listing', next:'onglets', obj:null, help:null}
  },
  
  /*
   *  Données pour l'aperçu du titre suivant les options
   *  
   *  NOTES
   *  -----
   *    = Si un titre est sélectionné, ce sont ses données qui sont
   *      utilisées.
   */
  DATA_ASPECT: {titre:"Original Title", titre_fr:"Titre français", annee:"2013"},
  
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
  panneau_films_ready: false,
  
  /*
   *  Les Options {Hash} envoyées à la méthode choose_a_film
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
    if(false == this.panneau_films_ready) this.prepare_panneau
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
   */
  hide_panneau:function()
  {
    this.panneau.hide()
    UI.Input.retreive_current(this.current_textfield, {focus:true})
    window.onkeypress = this.old_window_onkeypress
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
    dlog("-> FILMS.Dom.set_focus_on('"+idfocus+"')", DB_FCT_ENTER)
    if(this.current_focus) this.current_focus.obj.removeClass('focused')
    this.current_focus = this.DFOCUS[idfocus]
    this.current_focus.obj.addClass('focused')
    this.current_focus.obj[0].focus()
    F.clean()
    if(this.DFOCUS[idfocus].help)
    {
      help(this.SHORTCUTS_COMMUNS + ' ' + this.DFOCUS[idfocus].help)
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
    dlog("-> FILMS.Dom.keypress_on_onglets", DB_FCT_ENTER)
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
    dlog("-> FILMS.Dom.keypress_on_listing", DB_FCT_ENTER)
    if( this.keypress_common(evt) ) return false
    var complex_method = null
    switch(evt.keyCode)
    {
    case K_UP_ARROW:    complex_method = 'select_prev_item'   ; break
    case K_DOWN_ARROW:  complex_method = 'select_next_item'   ; break
    case K_ERASE:       complex_method = 'remove_selected'    ; break
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
  keypress_on_options:function(evt)
  {
    dlog("-> FILMS.Dom.keypress_on_options", DB_FCT_ENTER)
    if( this.keypress_common(evt) ) return false
    switch(evt.keyCode)
    {
    }
    switch(evt.charCode)
    {
    case Key_a: this.toggle_option('annee')    ; break
    case Key_f: this.toggle_option('titrefr')  ; break
    case Key_l: this.toggle_option('nolink')   ; break
    case Key_o: this.toggle_option('titreor')  ; break
    case Key_s: this.toggle_option('auteurs')  ; break
    }
    return stop_event(evt)
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
        FILMS.Edition.edit()
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
    $('panneau#films div#onglet_letter-'+letter).addClass('pressed')
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
    this.set_apercu_titre
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
    $('panneau#films div#onglet_letter-'+letter).removeClass('pressed')
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
   *  C'est un DIV contenant tous les films de cette letter
   *  
   */
  html_listing:function(letter){
    var fdata, c = "", letter_list, i = 0, film_count ;
    FILMS.check_if_list_per_letter_ok
    letter_list = FILMS.DATA_PER_LETTER[letter]
    films_count = letter_list.length
    for(; i<films_count; ++i) 
    {
      c += this.html_div_film(FILMS.DATA[letter_list[i]])
    }
    return '<div id="'+this.listing_id(letter)+'" class="listing_films">' + c + '</div>'
  },
  
  /* Retourne l'identifiant DOM du div principal d'un item de la liste (un film) */
  id_div_item:function(item_id){ return "div_film-"+item_id },

  /* 
   * Retourne le {jQuery Set} du div principal d'un item de la liste 
   *
   */
  div_item:function(item_id)
  {
    return $('div#' + this.id_div_item(item_id))
  },
  
  /*
   *  Retourne le code HTML pour le div d'un film de données
   *  +fdata+ dans le listing.
   *  
   */
  html_div_film:function(fdata)
  {
    return '<div id="'+this.id_div_item(fdata.id)+'" class="div_film">' +
              '<div class="fright">' +
                '<input type="button" class="small" value="edit" onclick="$.proxy(FILMS.edit, FILMS, \''+fdata.id+'\')()" />'+
              '</div>' +
              '<div class="titre" onclick="$.proxy(FILMS.on_choose_film, FILMS, \''+fdata.id+'\')()">' +
              fdata.titre +
              (fdata.titre_fr ? " ("+fdata.titre_fr+")" : '') +
              (fdata.annee ? " - <span class=\"tiny\">"+fdata.annee+'</span>' : '') +
              '</div>' +
            '</div>'
  },
  
  /* Retourne l'identifiant du listing (DIV) pour la lettre +letter+ */
  listing_id:function(letter){
    return "panneau_film_listing-"+letter
  }
  
}

Object.defineProperties(FILMS.Dom, {
  /* ---------------------------------------------------------------------
   *
   *  ÉLÉMENTS DOM
   *
   */
  
  /* Le panneau complet */
  "panneau":{
    get:function(){ return $('panneau#films')}
  },
  
  /* Le DIV de la barre d'onglets */
  "div_onglets":{
    get:function(){ return $('panneau#films > div#panneau_film_onglets')}
  },
  /* Le DIV contenant tous les listings par lettre */
  "div_listing":{
    get:function(){ return $('panneau#films > div#panneau_film_listings')}
  },
  /* Le DIV des options de balise */
  "div_options":{
    get:function(){ return $('panneau#films > div#panneau_film_options')}
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
        this.set_apercu_titre
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
        this.div_current_item.find('> .titre').click()
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
      FILMS.Edition.edit(this.current_item)
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
  
  /* ---------------------------------------------------------------------
   *  RÉGLAGES
   --------------------------------------------------------------------- */
  
  /*
   *  Règle l'affiche de l'aperçu du titre en fonction des options
   *  
   */
  "set_apercu_titre":{
    get:function()
    {
      var dasp = this.current_item ? get_film(this.current_item) : this.DATA_ASPECT
      var aspect = "", inpar  = [] ;
      var opts = this.options_balise
      aspect += opts.titrefr ? (dasp.titre_fr || dasp.titre) : dasp.titre
      if(opts.titrefr && opts.titreor) inpar.push(dasp.titre)
      if(opts.annee) inpar.push(dasp.annee)
      if(opts.auteurs) inpar.push("<i>Auteurs</i>")
      if(inpar.length) aspect += " ("+inpar.join(', ')+")"
      $('span#film_aspect_titre').html(aspect)
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
      this.set_apercu_titre
    }
  },
  "set_option":{
    value:function(opt, value){
      if(undefined != value) this.options_balise[opt] = value
      $('div#panneau_film_options input[type="checkbox"]#film_option-'+opt)[0].checked = this.options_balise[opt]
    }
  },
  "toggle_option":{
    value:function(opt){
      this.set_option(opt, !this.options_balise[opt])
      this.set_apercu_titre
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
        $('div#panneau_film_'+suf).hide()
      })
      $('div#panneau_film_edition').show()
    }
  },
  "hide_formulaire":{
    get:function(){
      $('div#panneau_film_edition').hide()
      L(['tools', 'onglets', 'listings', 'buttons', 'options']).each(function(suf){
        $('div#panneau_film_'+suf).show()
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
      $('body').append( this.html_panneau_films )
      // Définition du focus
      var idfocus, obj ;
      for(idfocus in this.DFOCUS)
      {
        obj = this.DFOCUS[idfocus].obj = this['div_'+idfocus]
        obj.bind('keypress', $.proxy(this['keypress_on_'+idfocus], this))
        // obj.bind('click', $.proxy(this.set_focus_on, this, idfocus))
      }
      // Observers
      this.panneau.draggable({containment:'parent'})
      // On coche les options par défaut
      this.set_options
      this.panneau_films_ready = true
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
  "html_panneau_films":{
    get:function(){
      return  '<panneau id="films">' +
                this.html_div_outils  +
                this.div_edition +
                this.html_div_onglets +
                '<div id="panneau_film_listings" class="focusable" tabindex="1"></div>' +
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
      for(opt in FILMS.OPTIONS)
      {
        this.options_balise[opt] = FILMS.OPTIONS[opt].valdef
        id   = "film_option-"+opt
        cbs += '<input type="checkbox" id="'+id+'" ' +
                'onchange="$.proxy(FILMS.Dom.onchange_option, FILMS.Dom, this)()" />' +
                '<label for="'+id+'">'+ FILMS.OPTIONS[opt].hname +'</label>' ;
      }
      var aspect_titre = '<span id="film_aspect_titre">Titre original</span>'
      return '<div id="panneau_film_options" class="focusable" tabindex="2">' + aspect_titre + cbs + '</div>'
    }  
  },
  
  /*
   *  Construit le div des onglets lettre
   *  
   */
  "html_div_onglets":{
    get:function(){
      var c = '<div id="panneau_film_onglets" class="focusable" tabindex="0">'
      c += this.div_onglet( 0, '0-9' )
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
      return '<div id="onglet_letter-'+ascii+
      '" class="onglet_letter" onclick="$.proxy(FILMS.Dom.on_click_onglet, FILMS.Dom, '+
      ascii+')()">'+letter+'</div>'
    }
  },
  
  /*
   *  Construit le div des outils du panneau
   *  
   */
  "html_div_outils":{
    get:function(){
      return '<div id="panneau_film_tools">' + '</div>'
    }
  },
  /*
   *  Construit le div du formulaire de film
   *  
   */
  "div_edition":{
    get:function(){
      return '<div id="panneau_film_edition">' + '</div>'
    }
  },
  /*
   *  Code HTML du div des boutons (bas)
   *  
   */
  "div_boutons":{
    get:function(){
      return '<div id="panneau_film_buttons" class="buttons">' +
      '<input type="button" value="+" onclick="$.proxy(FILMS.Edition.edit, FILMS.Edition)()" class="fleft" />' +
      '<input type="button" value="Renoncer" onclick="$.proxy(FILMS.Dom.hide_panneau, FILMS.Dom)()" />' +
      '</div>'
    }
  }
  
})