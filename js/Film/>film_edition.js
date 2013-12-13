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
      this.current = FILMS.get( fid )
      this.current.edit 
        // @note: sait gérer le fait que le film ne soit pas encore chargé
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
      var id_new_film = this.id_from_titre( values.titre )
      this.current = new Film( id_new_film )
    }
    else this.current = get_film( values.id )
    this.current.dispatch( values )
    if(is_new_film) this.current.id = id_new_film // a été écrasé par dispatch
    // === ENREGISTREMENT DU FILM ===
    this.current.save( 
      $.proxy(this[is_new_film ? 'update_film_list_with_new' : 'end'], this) 
    )
  },
  
  /*
   *  Demande de destruction du film d'identifiant +fid+
   *  
   */
  want_remove:function(fid)
  {
    Edit.show({
      id:'destroy_film',
      title: LOCALE.film.ask['want delete film'] + " “"+get_film(fid).titre+"” ?",
      buttons:{
        cancel:{name:"Renoncer"},
        ok:{name:"Détruire le film", onclick:$.proxy(FILMS.Edition.remove, FILMS.Edition, fid)}
      }
    })
  },
  /*
   *  Destruction du film d'identifiant +fid+
   *  
   */
  remove:function(fid)
  {
    Ajax.send({script:'film/destroy', film_id:fid}, $.proxy(this.suite_remove, this))
  },
  suite_remove:function(rajax)
  {
    if(rajax.ok)
    {
      var film = get_film( rajax.film_id )
      FILMS.Dom.remove_item(film.id)
      if(FILMS.DATA_PER_LETTER[film.let])
      {
        var indice = FILMS.DATA_PER_LETTER[film.let].indexOf(film.id)
        console.log("indice: "+indice)
        FILMS.DATA_PER_LETTER[film.let].splice(indice, 1)
      }
      delete FILMS.DATA[film.id]
      with(FILMS.Dom)
      {
        remove_listing_letter(film.let)
        on_click_onglet(film.let) 
      }
    }
    else F.error(rajax.message)
  },
  
  /*
   *  Appelé après `save' ci-dessus en cas de nouveau film
   *  On doit actualiser la liste des films (pour ne pas avoir à la recharger)
   *  et rafraichir l'affichage de la liste si nécessaire (si elle est affichée ou
   *  construite, entendu que la lettre affichée n'est pas forcément la lettre du
   *  film)
   *  
   *  @requis   this.current    Instance {Film} du nouveau film
   */
  update_film_list_with_new:function()
  {
    var film = this.current
    film.is_new = true // encore utile ?
    // = Ajout à FILMS.DATA =
    FILMS.DATA[film.id] = film.data_mini
    // = Ajout à FILMS.DATA_PER_LETTER =
    // @note: si DATA_PER_LETTER a déjà été établie, c'est ici
    // qu'il faut ajouter le film. Sinon, il sera automatiquement
    // ajouté à la définition de DATA_PER_LETTER.
    if(FILMS.check_if_list_per_letter_ok)
    {
      FILMS.DATA_PER_LETTER[film.let].push( film.id )
      FILMS.DATA_PER_LETTER[film.let].sort
    } 
    // = Forcer l'actualisation du listing =
    FILMS.Dom.remove_listing_letter( film.let )
    // = Finir et afficher le listing =
    this.end()
  },
  
  /*
   *  Pour terminer l'édition/création du film
   *
   *  NOTES
   *  -----
   *    = Cette méthode est appelée directement par le bouton "Renoncer", sans
   *      passer par `save' ci-dessus
   *  
   *    = On peut venir aussi de `update_film_list_with_new' ci-dessus lorsque
   *      c'est une création de film.
   */
  end:function()
  {
    FILMS.Dom.hide_formulaire
    if(this.current.is_new) FILMS.Dom.on_click_onglet( this.current.let )
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
        if( val == null ) val = ""
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
      case 'duree':
        val = val ? Time.m2h(val) : ""
        break
      default:
        if(val == null) val = ""
      }
      $(my.tag_for(prop)+'#filmEdit-'+prop).val( val )
    })
  },
  /*
   *  Transforme une liste de people en {String} (pour édition)
   *  
   */
  stringify_people_as:function(list, people_type /* 'acteur' ou */)
  {
    dlog(list)
    if(list == null || list.length == 0) return ""
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
      case 'duree':
        val = val != "" ? Time.h2m( val ) : null
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
   *  @param  str           Le contenant entier du textarea de la propriété
   *  @param  people_type   Le type de personne concerné ('acteur', 'producteur', etc.)
   *
   */
  dataify_people:function(str, people_type)
  {
    if(str.trim() == "") return null
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
   *  Recherche le film sur imdb
   *  --------------------------
   *  
   *  NOTES
   *  -----
   *    = Mis en vraie méthode car appelé depuis le formulaire sans argument
   *      en proxy.
   */
  search_in_imdb:function(titre)
  {
    if(undefined == titre) titre = $('input#filmEdit-titre').val().trim()
    else titre = titre.trim()
    if(titre == "") titre = $('input#filmEdit-titre_fr').val().trim()
    if(titre == "") F.error( LOCALE.film.error['no titre to find'] )
    else
    {
      var path = 'http://www.imdb.com/find?q='+titre.split(' ').join('+')+'&s=all'
      window.open(path, "SearchInImdb")
    }
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
      $('div#panneau_film_edition').html('')
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
        {id:'titre', placeholder:"Titre original"}, 
        image("picto/imdb/projectors.png", {
          id:"img_imdb", 
          title:"Cliquer pour rechercher le titre sur IMDb",
          onclick:"$.proxy(FILMS.Edition.search_in_imdb, FILMS.Edition)()"}
        ),
        {id:'titre_fr', placeholder:"Titre français (s'il existe)"},
        '</div>',
        '<div id="div_film_resume">',
        {type:'textarea', id:'resume', class:'haut', placeholder:"Résumé du film"},
        '</div>',
        '<div id="film_data">',
        {id:'duree', label:"Durée", placeholder:"h:mm:ss", data_type:'horloge'}, 
        {id:'annee', label:'Année', placeholder: "AAAA", data_type:'number', data_format:'(18|19|20)[0-9]{2}'},
        {id:'pays', label:"Pays", data_type:'pays', data_format:'[a-zA-Z]{2}'}, 
        '</div>',
        '<fieldset id="film_producteur_div"><legend><b>Producteur</b></legend>',
        {type:'textarea', id:'producteur', data_type:'people', placeholder:"Prénom, nom [↵]"},
        '</fieldset>',
        '<fieldset id="film_auteurs_div"><legend><b>Auteurs</b></legend>',
        {type:'textarea', id:'auteurs', data_type:'people', data_format:'auteur', placeholder:"prénom, nom[, roman/scénario/story] [↵]"},
        '</fieldset>',
        '<fieldset id="film_realisateurs_div"><legend><b>Réalisateur</b></legend>',
        {type:'textarea', id:'realisateur', data_type:'people', placeholder:"prénom, nom [↵]"},
        '</fieldset>',
        '<fieldset id="film_acteurs_div"><legend><b>Acteurs</b></legend>',
        {type:'textarea', id:'acteurs', data_type:'people', data_format:'acteur', placeholder:"prénom, nom, prénom/surnom perso, nom perso, fonction [↵]", class:'haut'},
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
      (dfield.id          ? ' id="'           +dfield.id          +'"' : '') +
      (dfield.class       ? ' class="'        +dfield.class       +'"' : '') +
      (dfield.data_type   ? ' data-type="'    +dfield.data_type   +'"' : '') +
      (dfield.data_format ? ' data-format="'  +dfield.data_format +'"' : '') +
      (dfield.value       ? ' value="'        +dfield.value       +'"' : '') +
      (dfield.style       ? ' style="'        +dfield.style       +'"' : '') +
      (dfield.title       ? ' title="'        +dfield.title       +'"' : '') +
      (dfield.alt         ? ' alt="'          +dfield.alt         +'"' : '') +
      (dfield.placeholder ? ' placeholder="'  +dfield.placeholder +'"' : '') +
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