FILMS.Dom = {
  
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
  lettre_courante: null,
  
  /*
   *  Liste des lettres dont la liste a déjà été établie
   *  En clé : la lettre, en valeur : true
   */
  lettres_built:{},
  
  /*
   *  Ouvre le panneau des films
   *  
   */
  show_panneau:function()
  {
    if(false == this.panneau_films_ready) this.prepare_panneau
    else this.panneau.show()
  },
  
  /*
   *  Ferme le panneau des films
   *  
   */
  hide_panneau:function()
  {
    this.panneau.hide()
  },
  
  /*
   *  Méthode appelée quand on clique sur un onglet du panneau des films
   *
   *  NOTES
   *  -----
   *    ::  Si la liste des films de la lettre voulue n'est pas encore établie
   *        on la construit.
   *  
   */
  on_click_onglet:function(lettre)
  {
    if(this.lettre_courante)        this.hide_listing(this.lettre_courante)
    $('panneau#films div#onglet_lettre-'+lettre).addClass('pressed')
    if(!this.lettres_built[lettre]) this.build_listing( lettre )
    else this.show_listing(lettre)
  },
  /*
   *  Affiche le listing de films de la lettre +lettre+
   *  
   */
  show_listing:function(lettre)
  {
    this.lettre_courante = lettre
    $(this.jid_listing_courant).show()
  },
  /*
   *  Masque le listing de films de la lettre +lettre+
   *  
   */
  hide_listing:function(lettre)
  {
    $(this.jid_listing_courant).hide()
    $('panneau#films div#onglet_lettre-'+lettre).removeClass('pressed')
    this.lettre_courante = null
  },
  
  /*
   *  Construit le listing de la lettre +lettre+ (qui sera mise en courante)
   *  
   */
  build_listing:function(lettre)
  {
    this.div_listings.append(this.html_listing(lettre))
    this.lettres_built[lettre] = true
    this.lettre_courante = lettre
  },
  
  /*
   *  Retourne le code HTML du listing de la lettre +lettre+
   *  C'est un DIV contenant tous les films de cette lettre
   *  
   */
  html_listing:function(lettre){
    var c = '<div id="'+this.listing_id(lettre)+'" class="listing_films">'
    var fdata ;
    for(fid in FILMS.DATA)
    {
      fdata = FILMS.DATA[fid]
      if(fdata.let > lettre) break
      if(fdata.let == lettre) c += this.html_div_film(fdata)
    }
    c += '</div>'
    return c
  },
  
  /*
   *  Retourne le code HTML pour le div d'un film de données
   *  +fdata+ dans le listing.
   *  
   */
  html_div_film:function(fdata)
  {
    return '<div id="div_film-'+fdata.id+'" class="div_film">' +
              '<div class="titre" onclick="$.proxy(FILMS.on_choose_film, FILMS, \''+fdata.id+'\')()">' +
              fdata.titre +
              (fdata.titre_fr ? " ("+fdata.titre_fr+")" : '') +
              (fdata.annee ? " "+fdata.annee : '') +
              '</div>' +
            '</div>'
  },
  
  /* Retourne l'identifiant du listing (DIV) pour la lettre +lettre+ */
  listing_id:function(lettre){
    return "panneau_film_listing-"+lettre
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
  
  /* Le DIV contenant tous les listings par lettre */
  "div_listings":{
    get:function(){ return $('panneau#films > div#panneau_film_listings')}
  },
  
  /* Retourne le jID du listing de la lettre courante */
  "jid_listing_courant":{
    get:function(){ return "div#"+this.listing_id(this.lettre_courante)}
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
      this.panneau.draggable({containment:'parent'})
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
                this.div_outils  +
                this.div_edition +
                this.div_onglets +
                '<div id="panneau_film_listings"></div>' +
                this.div_boutons +
              '</panneau>'
    }
  },
  /*
   *  Construit le div des onglets lettre
   *  
   */
  "div_onglets":{
    get:function(){
      var c = '<div id="panneau_film_onglets">'
      c += this.div_onglet( 0, '0-9' )
      for(var i = 65; i<=87; ++i){
        c += this.div_onglet( i, String.fromCharCode(i) )
      }
      c += '</div>'
      return c
    }
  },
  /* Retourne le code HTML pour un onglet de code +ascii+ et de titre +lettre+ */
  "div_onglet":{
    value:function(ascii, lettre){
      return '<div id="onglet_lettre-'+ascii+
      '" class="onglet_lettre" onclick="$.proxy(FILMS.Dom.on_click_onglet, FILMS.Dom, '+
      ascii+')()">'+lettre+'</div>'
    }
  },
  
  /*
   *  Construit le div des outils du panneau des films
   *  
   */
  "div_outils":{
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
      '<input type="button" value="Renoncer" onclick="$.proxy(FILMS.Dom.hide_panneau, FILMS.Dom)()" />'
              '</div>'
    }
  }
  
})