/*
 *  Object FILMS.Edition
 *  --------------------
 *  Pour l'édition des films
 *  
 */
if(undefined == FILMS.Edition) FILMS.Edition = {}

// Méthodes et propriété partagées
// Cf. à la fin de >OBJETS_Edition

// Propriétés complexes partagées
// Cf. à la fin de >OBJETS_Edition

// Propriétés et méthodes propres
$.extend(FILMS.Edition, {
  
  OBJS              : FILMS,
  SELF              : FILMS.Edition,
  as_string         : "FILMS.Edition",
  parent_as_string  : "FILMS",
  ItemClass         : Film,
  main_prop         : 'titre', 
  class_min         : "film",
  folder_ajax       : "film",
  
  /*
   *  Liste des propriétés du film qui pourront être
   *  éditées.
   *
   *  NOTES
   *  -----
   *    = Le champ les recevant porte toujours l'id `filmEdit-<property>'
   *  
   */
  ITEM_PROPERTIES:['id', 'titre', 'titre_fr', 'resume', 'producteur', 'auteurs',
    'realisateur', 'acteurs', 'annee', 'duree', 'pays'],

})


$.extend(FILMS.Edition, {

  /*
   *  Met les valeurs du film +film+ {Film} dans les champs d'édition
   *  
   */
  set_values:function(film)
  {
    // On remonte toujours au-dessus
    $('div#'+this.prefix+'form').scrollTo(0) ;
    var my = this
    L(my.ITEM_PROPERTIES).each(function(prop){
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
    $('div#'+this.prefix+'form').scrollTo(0) ;
    var values = {}
    var my = this
    L(my.ITEM_PROPERTIES).each(function(prop){
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
  
})

Object.defineProperties(FILMS.Edition,{
  
  /*
   *  Initialisation du formulaire
   *  
   */
  "init_form":{
    get:function(){
      
    }
  },
  
  /*
   *  Code HTML du formulaire proprement dit
   *  
   */
  "html_formulaire":{
    get:function(){
      var c = '<div id="'+this.prefix+'form" class="items_form">'
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
        '<div id="div_item_resume">',
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
  }

})