/*
 *  Object FILMS.Edition
 *  --------------------
 *  Pour l'édition des films
 *  
 */

FILMS.Edition = {
  
  /*
   *  Liste des propriétés du film qui pourront être
   *  éditées.
   *
   *  NOTES
   *  -----
   *    = Le champ les recevant porte toujours l'id `filmEdit-<property>'
   *  
   */
  FILM_PROPERTIES:['id', 'titre', 'titre_fr', 'resume', 'producteur', 'auteurs',
    'realisateur', 'acteurs', 'annee', 'duree', 'pays'],
  
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
   *  Pour enregistrer les modifications (ou créer un nouveau film)
   *  
   */
  save:function()
  {
    var values = this.get_values()
    var is_new_film = values.id == null
    if(is_new_film)
    {
      film = new Film( this.id_from_titre( values.titre ) )
    }
    else film = get_film( values.id )
    film.dispatch( values )
    film.save($.proxy(this.end, this)) // <-- SAUVEGARDE
  },
  
  /*
   *  Retourne un identifiant de film à partir du +titre+ fourni
   *  
   */
  id_from_titre:function(titre)
  {
    var t = Texte.to_ascii( titre )
    t = t.titleize().replace(/[^a-zA-Z0-9]/g,'')
    return t
  },
  
  /*
   *  Pour terminer l'édition
   *
   *  NOTES
   *  -----
   *    = Cette méthode est appelée directement par le bouton "Renoncer", sans
   *      passer par `save' ci-dessus
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
  set_values:function(film)
  {
    // On remonte toujours au-dessus
    $('div#film_form').scrollTo(0) ;
    var my = this
    L(my.FILM_PROPERTIES).each(function(prop){
      val = film[prop]
      switch(prop)
      {
      case 'resume':
        /* Compatibilité avec ancienne version */
        val = val.replace(/\^rc\^/g, "\n")
        break
      case 'producteur':
        val = my.stringify_people_as(val, 'producteur')
        break
      case 'auteurs':
        val = my.stringify_people_as(val, 'auteur')
        break
      case 'realisateur':
        val = my.stringify_people_as(val, 'realisateur')
        break
      case 'acteurs':
        val = my.stringify_people_as(val, 'acteur')
        break
      }
      $(my.tag_for(prop)+'#filmEdit-'+prop).val( val )
    })
  },
  stringify_people_as:function(list, people_type /* 'acteur' ou */)
  {
    var my = this
    return L(list).collect(function(data){
      return my.stringify_person_as(data, people_type)
    }).join("\n")
  },
  stringify_person_as:function(data, person_type /* 'acteur' ou */)
  {
    var d = [data.prenom || "null", data.nom || "null"]
    switch(person_type)
    {
    case 'acteur':
      d = $.merge(d, [data.prenom_perso || "null", data.nom_perso || "null", data.fct_perso || "null"])
      break
    case 'auteur':
      d.push(data.objet || "null")
      break
    }
    return d.join(', ')
  },
  
  /*
   *  Récupère les valeurs éditées
   *  
   */
  get_values:function()
  {
    // On remonte toujours au-dessus
    $('div#film_form').scrollTo(0) ;
    var values = {}
    var my = this
    L(my.FILM_PROPERTIES).each(function(prop){
      val = $(my.tag_for(prop)+'#filmEdit-'+prop).val()
      switch(prop)
      {
      case 'producteur':
        val = my.dataify_people(val, 'producteur')
        break
      case 'auteurs':
        val = my.dataify_people(val, 'auteur')
        break
      case 'realisateur':
        val = my.dataify_people(val, 'realisateur')
        break
      case 'acteurs':
        val = my.dataify_people(val, 'acteur')
        break
      default:
        if(val == "") val = null
      }
      values[prop] = val
    })
    return values
  },
  /*
   *  Retourne le type de tag (input/textarea) pour la propriété +prop+
   *  
   */
  tag_for:function(prop)
  {
    switch(prop)
    {
    case 'resume':
    case 'producteur':
    case 'auteurs':
    case 'realisateur':
    case 'acteurs':
      return 'textarea'
    default:
      return 'input'
    }
  },
  /*
   *  Transforme les données string des people en donnée pour l'enregistrement
   *  
   *  @param  str     Le contenant entier du textarea de la propriété
   *  @param  people_type   Le type de personne concerné ('acteur', 'producteur', etc.)
   *
   */
  dataify_people:function(str, people_type)
  {
    var my = this
    return L(str.trim().split("\n")).collect(function(line){
      return my.dataify_person(line.trim(), people_type)
    })
  },
  /*
   *  Prend une ligne {String} et la transforme en {Object} pour
   *  l'enregistrement.
   *  
   */
  dataify_person:function(line, person_type)
  {
    var d = {}
    var dline = line.split(',')
    dline = L(dline).collect(function(mot){ 
      mot = mot.trim()
      return (mot == "" || mot == "null") ? null : mot ;
    })
    d.prenom = dline.shift()
    d.nom    = dline.shift()
    switch(person_type)
    {
    case 'auteur':
      d.objet = dline.shift()
      break
    case 'acteur':
      d.prenom_perso = dline.shift()
      d.nom_perso    = dline.shift()
      d.fct_perso    = dline.shift()
      break
    }
    return d
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
        {id:'id', type:'hidden'},
        {id:'titre', label:"Titre"}, {id:'titre_fr', label:"Titre fr."},
        '</div>',
        '<div id="div_film_resume">',
        {type:'textarea', id:'resume', class:'haut'},
        '</div>',
        '<div id="film_data">',
        {id:'duree', label:"Durée (mns)", data_type:'horloge'}, 
        {id:'annee', label:'Année', data_type:'number', data_format:'(18|19|20)[0-9]{2}'},
        {id:'pays', label:"Pays", data_type:'pays', data_format:'[a-zA-Z]{2}'}, 
        '</div>',
        '<fieldset id="film_producteur_div"><legend><b>Producteur</b> (prénom, nom [↵])</legend>',
        {type:'textarea', id:'producteur', data_type:'people'},
        '</fieldset>',
        '<fieldset id="film_auteurs_div"><legend><b>Auteurs</b> (prénom, nom[, roman/scénario/story] [↵])</legend>',
        {type:'textarea', id:'auteurs', data_type:'people', data_format:'auteur'},
        '</fieldset>',
        '<fieldset id="film_realisateurs_div"><legend><b>Réalisateur</b> (prénom, nom [↵])</legend>',
        {type:'textarea', id:'realisateur', data_type:'people'},
        '</fieldset>',
        '<fieldset id="film_acteurs_div"><legend><b>Acteurs</b> (prénom, nom, prénom/surnom perso, nom perso, fonction [↵])</legend>',
        {type:'textarea', id:'acteurs', data_type:'people', data_format:'acteur', class:'haut'},
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
      var type  = dfield.type || 'text'
      if(dfield.id) dfield.id = 'filmEdit-'+dfield.id
      switch(type)
      {
      case 'text':
        if(dfield.label) field += '<label class="libelle" for="'+dfield.id+'">'+dfield.label+'</label>'
        return field + this.html_balise_in_field(dfield)
      case 'textarea':
        if(dfield.label) field += '<label class="libelle" for="'+dfield.id+'">'+dfield.label+'</label>'
        var value = dfield.value; delete dfield.value
        return field + this.html_balise_in_field(dfield) + (value ? value : "") + '</textarea>'
      case 'hidden':
        return '<input type="hidden" id="'+dfield.id+'" value="" />'
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
      dlog("-> FILMS.Edition.html_div_buttons", DB_FCT_ENTER)
      return  '<div class="buttons">' +
                '<input type="button" value="Renoncer" onclick="$.proxy(FILMS.Edition.end, FILMS.Edition)()" class="fleft" />' +
                '<input type="button" value="Enregistrer" onclick="$.proxy(FILMS.Edition.save, FILMS.Edition)()" />' +
              '</div>'
    }
  }
  
})