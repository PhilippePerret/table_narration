
if(undefined == DICO.Edition) DICO.Edition = {}

// Méthodes et propriété partagées
// cf. à la fin de >OBJETS_Edition

// Propriétés complexes partagées
// cf. à la fin de >OBJETS_Edition

// Propriétés et méthodes propres
$.extend(DICO.Edition,{
  NAME              : "DICO.Edition",
  OBJS              : DICO,
  parent_as_string  : "DICO",
  ItemClass         : Mot,
  main_prop         : 'mot', 
  class_min         : "dico",
  folder_ajax       : "scenodico",

  /*
   *  Liste des propriétés du mot qui pourront être
   *  éditées.
   *
   *  NOTES
   *  -----
   *    = Le champ les recevant porte toujours l'id `dicoEdit-<property>'
   *  
   */
  ITEM_PROPERTIES:['id', 'mot', 'definition'],
 

  set_values:function(mot)
  {
    var idm = this.NAME+".set_values(mot #"+mot.id+")"
    dlog("-> "+idm, DB_FCT_ENTER | DB_CURRENT)
    // On remonte toujours au-dessus
    $('div#'+this.prefix+'form').scrollTo(0) ;
    var my = this
    L(my.ITEM_PROPERTIES).each(function(prop){
      val = mot[prop]
      dlog("Prop:"+prop+" = "+val)
      switch(prop)
      {
      case 'mot':
        if( val == null ) val = ""
        break
      default:
        if(val == null) val = ""
      }
      $(my.tag_for(prop)+'#dicoEdit-'+prop).val( val )
    })
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
      val = $(my.tag_for(prop)+'#dicoEdit-'+prop).val()
      switch(prop)
      {
      case 'mot':
        if(val == "") throw "Il faut fournir un mot !"
        break
      case 'definition':
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
    case 'definition':
      return 'textarea'
    default:
      return 'input'
    }
  },

})


// Propriétés complexes propres
Object.defineProperties(DICO.Edition,{
  /*
   *  Initialisation du formulaire
   *  
   */
  "init_form":{
    get:function(){
      
    }
  },
  
  
  "html_formulaire":{
    get:function(){
      var c = '<div id="'+this.prefix+'form" class="items_form">'
      var self = this
      L([
        '<div id="dico_div_item_definition" class="main_data">',
        {id:'id', type:'hidden'},
        {id:'mot', placeholder:"Nouveau mot scénodico", class:"main_prop"},
        '</div>',
        '<div id="mot_data">',
        {type:'textarea', id:'definition', class:'haut', placeholder:"Définition du mot"},
        '</div>',
        '<fieldset id="dico_section_categorie"><legend><b>Catégories</b></legend>',
        '</fieldset>',
        '<fieldset id="dico_section_relation"><legend><b>Relations</b></legend>',
        '</fieldset>'
        ]).each(function(dfield){c += self.html_field(dfield)})
      c += '</div>'
      return c
    }
  },

})