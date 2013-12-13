DICO.Edition = {}

// Méthodes et propriété partagées
$.extend(DICO.Edition, OBJETS_Edition)

// Propriétés complexes partagées
Object.defineProperties(DICO.Edition, OBJETS_Edition_defined_properties)

// Propriétés et méthodes propres
$.extend(DICO.Edition,{
  OBJS              : DICO,
  SELF              : DICO.Edition,
  as_string         : "DICO.Edition",
  parent_as_string  : "DICO",
  ItemClass         : Mot,
  main_prop         : 'mot', 
  class_min         : "dico",
  folder_ajax       : "scenodico",

  /*
   *  Liste des propriétés du film qui pourront être
   *  éditées.
   *
   *  NOTES
   *  -----
   *    = Le champ les recevant porte toujours l'id `filmEdit-<property>'
   *  
   */
  ITEM_PROPERTIES:['id', 'mot', 'definition'],
 

  set_values:function(film)
  {
    // On remonte toujours au-dessus
    $('div#'+this.prefix+'form').scrollTo(0) ;
    var my = this
    L(my.ITEM_PROPERTIES).each(function(prop){
      val = film[prop]
      switch(prop)
      {
      case 'mot':
        if( val == null ) val = ""
        break
      default:
        if(val == null) val = ""
      }
      $(my.tag_for(prop)+'#filmEdit-'+prop).val( val )
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
      val = $(my.tag_for(prop)+'#filmEdit-'+prop).val()
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
  
})