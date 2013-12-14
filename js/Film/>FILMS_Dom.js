FILMS.Dom = {}

// On l'étend avec les méthodes et propriété partagées
$.extend(FILMS.Dom, OBJETS.Dom)

// Les méthodes et propriétés propres
$.extend(FILMS.Dom, {
  
  OBJS              : FILMS,
  NAME              : "FILMS.Dom",  // Pour les messages de débug
  parent_as_string  : "FILMS",
  prefix    : "films_",     // prefix pour les DOM Elements
  
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
   *  Liste des lettres dont la liste a déjà été établie
   *  En clé : la lettre, en valeur : true
   */
  letters_built:{},

  
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

  // Keypress activé quand on est sur la section 'options'
  // 
  keypress_on_options:function(evt)
  {
    dlog("-> "+this.NAME+".keypress_on_options", DB_FCT_ENTER)
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
   *  Retourne le code HTML pour le div d'un film de données
   *  +fdata+ dans le listing.
   *  
   */
  html_div_item:function(fdata)
  {
    return '<div id="'+this.id_div_item(fdata.id)+'" class="div_item">' +
              '<div class="fright">' +
                '<input type="button" class="small" value="edit" onclick="$.proxy(FILMS.edit, FILMS, \''+fdata.id+'\')()" />'+
              '</div>' +
              // '<div class="titre" onclick="$.proxy(FILMS.on_choose_item, FILMS, \''+fdata.id+'\')()">' +
              '<div class="titre" onclick="$.proxy(FILMS.Dom.on_select_item, FILMS.Dom, \''+fdata.id+'\', event)()">' +
              fdata.titre +
              (fdata.titre_fr ? " ("+fdata.titre_fr+")" : '') +
              (fdata.annee ? " - <span class=\"tiny\">"+fdata.annee+'</span>' : '') +
              '</div>' +
            '</div>'
  }
  
})


// Propriétés complexes partagées
Object.defineProperties(FILMS.Dom, OBJETS_Dom_defined_properties)

// Propriétés complexes propres
Object.defineProperties(FILMS.Dom, {
  
  /* ---------------------------------------------------------------------
   *  RÉGLAGES
   --------------------------------------------------------------------- */
  
  /*
   *  Règle l'affiche de l'aperçu du titre en fonction des options
   *  
   */
  "set_apercu_balise":{
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
      $('span#'+this.prefix+'aspect_balise').html(aspect)
    }
  }
  
})