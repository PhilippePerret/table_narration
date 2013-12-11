/*
 *  Object FILMS.Edition
 *  --------------------
 *  Pour l'édition des films
 *  
 */

FILMS.Edition = {
  /*
   *  Etats
   *  
   */
  form_prepared:false,
  
  /*
   *  Instance du film {Film} en édition (if any)
   *  
   */
  current:null, 
  
  /*
   *  = MAIN = Demande d'édition du formulaire
   *
   *  @param  fid   Identifiant {String} du film à éditer
   *                Si non fourni, c'est une création.
   */
  edit:function(fid)
  {
    if(!this.form_prepared) this.prepare_formulaire ;
    FILMS.Dom.show_formulaire
    if(undefined == fid)
    {
      this.init_form
    }
    else
    {
      film = FILMS.get( fid )
      film.edit // @note: sait gérer le fait que le film ne soit pas encore chargé
    }
  },
  
  /*
   *  Pour terminer l'édition
   *  
   */
  end:function()
  {
    FILMS.Dom.hide_formulaire
  },
  
  /*
   *  Met les valeurs du film +film+ {Film} dans les champs d'édition
   *  
   */
  set_value:function(film)
  {
    
  },
  
  /*
   *  Récupère les valeurs éditées
   *  
   */
  get_values:function()
  {
    
  }
  
}

Object.defineProperties(FILMS.Edition,{
  
  /*
   *  Return le {jQuerySet} du formulaire d'édition du film.
   *  
   */
  "form":{
    get:function(){return $('div#panneau_film_edition div#film_form')}
  },
  
  /*
   *  Initialisation du formulaire
   *  
   */
  "init_form":{
    get:function(){
      
    }
  },
  /*
   *  Préparation du formulaire
   *  
   *  NOTES
   *  -----
   *    = Il est préparé masqué
   *    = On place sur tous les champs de saisie textuels le gestionnaire
   *      de focus et blur de UI.Input
   */
  "prepare_formulaire":{
    get:function(){
      $('div#panneau_film_edition').append( this.html_form )
      UI.Input.bind( this.form )
      this.form_prepared = true
    }
  },
  
  /*
   *  Retourne le code HTML du formulaire
   *  
   */
  "html_form":{
    get:function(){
      return  '<div id="div_form_film">' +
                this.html_formulaire + 
                this.html_div_buttons + 
              '</div>'
    }
  },
  
  /*
   *  Code HTML du formulaire proprement dit
   *  
   */
  "html_formulaire":{
    get:function(){
      var c = '<div id="film_form">'
      L([
        '<div id="film_titres">',
        {id:'film_titre', label:"Titre"}, {id:'film_titre_fr', label:"Titre fr."},
        '</div>',
        '<div id="film_data">',
        {id:'film_durée', label:"Durée (mns)", data_type:'horloge'}, 
        {id:'film_annee', label:'Année', data_type:'number', data_format:'(18|19|20)[0-9]{2}'},
        '</div>',
        '<fieldset id="film_producteurs_div"><legend><b>Producteurs</b> (prénom, nom ↵)</legend>',
        {type:'textarea', id:'film_auteurs', data_type:'people'},
        '</fieldset>',
        '<fieldset id="film_auteurs_div"><legend><b>Auteurs</b> (prénom, nom[, roman/scénario/story] ↵)</legend>',
        {type:'textarea', id:'film_auteurs', data_type:'people', data_format:'auteur'},
        '</fieldset>',
        '<fieldset id="film_realisateurs_div"><legend><b>Réalisateurs</b> (prénom, nom ↵)</legend>',
        {type:'textarea', id:'film_realisateur', data_type:'people'},
        '</fieldset>',
        '<fieldset id="film_acteurs_div"><legend><b>Acteurs</b> (prénom, nom, prénom/surnom perso, nom perso, fonction ↵)</legend>',
        {type:'textarea', id:'film_acteurs', data_type:'people', data_format:'acteur'},
        '</fieldset>'
        ]).each(function(dfield){c += FILMS.Edition.html_field(dfield)})
      c += '</div>'
      return c
    }
  },
  
  /*
   *  Construit un champ d'après les données dfield
   *  
   */
  "html_field":{
    value:function(dfield){
      if('string'==typeof dfield) return dfield
      var field = ""
      var type = dfield.type || 'text'
      switch(type)
      {
      case 'text':
        if(dfield.label) field += '<label class="libelle" for="'+dfield.id+'">'+dfield.label+'</label>'
        return field + this.html_balise_in_field(dfield)
      case 'textarea':
        if(dfield.label) field += '<label class="libelle" for="'+dfield.id+'">'+dfield.label+'</label>'
        var value = dfield.value; delete dfield.value
        return field + this.html_balise_in_field(dfield) + (value ? value : "") + '</textarea>'
      }
    }
  },
  
  /*
   *  Retourne le code HTML des attributs du champ d'après ses données +dfield+
   *  
   */
  "html_balise_in_field":{
    value:function(dfield)
    {
      if(undefined == dfield.type) dfield.type = 'text'
      return "<" + (dfield.type == 'text' ? 'input' : dfield.type) +
      (dfield.type=='text'? ' type="text"' :  '') +
      (dfield.id          ? ' id="'+dfield.id+'"' :  '') +
      (dfield.class       ? ' class="'+dfield.class+'"' : '') +
      (dfield.data_type   ? ' data-type="'+dfield.data_type+'"' : '') +
      (dfield.data_format ? ' data-format="'+dfield.data_format+'"' : '') +
      (dfield.value       ? ' value="'+dfield.value+'"' : '') +
      (dfield.style       ? ' style="'+dfield.style+'"' : '') +
      (dfield.type=='text' ? ' />' : '>')
    }
  },
    
  /*
   *  Code HTML des boutons du formulaire
   *  
   */
  "html_div_buttons":{
    get:function(){
      dlog("-> html_div_buttons")
      return  '<div class="buttons">' +
                '<input type="button" value="Renoncer" onclick="$.proxy(FILMS.Edition.end, FILMS.Edition)()" class="fleft" />' +
                '<input type="button" value="Enregistrer" onclick="$.proxy(FILMS.Edition.save, FILMS.Edition)()" />' +
              '</div>'
    }
  }
  
})