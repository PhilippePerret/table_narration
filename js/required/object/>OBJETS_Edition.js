OBJETS_Edition = {
 
  /*
   *  Etats
   *  
   */
  form_prepared:false,
  
  /*
   *  Instance du item {Film} en édition (if any)
   *  
   */
  current:null, 
  
  /*
   *  = MAIN = Demande d'édition du formulaire
   *
   *  @param  id   Identifiant {String} du item à éditer
   *                Si non fourni, c'est une création.
   */
  edit:function(id)
  {
    if(!this.form_prepared) this.prepare_formulaire ;
    this.OBJS.Dom.show_formulaire
    if(undefined == id)
    {
      this.init_form
    }
    else
    {
      this.current = this.OBJS.get( id )
      this.current.edit 
        // @note: sait gérer le fait que le item ne soit pas encore chargé
    }
  },
  
  /*
   *  Pour enregistrer les modifications (ou créer un nouveau item)
   *  
   */
  save:function()
  {
    var values = this.get_values()
    var is_new_item = values.id == null
    if(is_new_item)
    {
      var id_new_item = this.id_from_mainprop( values[this.main_prop] )
      this.current = new this.ItemClass( id_new_item )
    }
    else this.current = this.OBJS.get( values.id )
    this.current.dispatch( values )
    if(is_new_item) this.current.id = id_new_item // a été écrasé par dispatch
    // === ENREGISTREMENT DU FILM ===
    this.current.save( 
      $.proxy(this[is_new_item ? 'update_item_list_with_new_item' : 'end'], this) 
    )
  },
  
  /*
   *  Demande de destruction du item d'identifiant +id+
   *  
   */
  want_remove:function(id)
  {
    Edit.show({
      id:'destroy_item',
      title: LOCALE[this.class_min].ask['want delete film'] + " “"+this.OBJS.get(id).titre+"” ?",
      buttons:{
        cancel:{name:"Renoncer"},
        ok:{name:LOCALE[this.class_min].label['destroy'], onclick:$.proxy(SELF.remove, SELF, id)}
      }
    })
  },
  /*
   *  Destruction du item d'identifiant +id+
   *  
   */
  remove:function(id)
  {
    Ajax.send({script:this.folder_ajax+'/destroy', item_id:id}, $.proxy(this.suite_remove, this))
  },
  suite_remove:function(rajax)
  {
    if(rajax.ok)
    {
      var item = this.OBJS.get( rajax.item_id )
      this.OBJS.Dom.remove_item(item.id)
      if(this.OBJS.DATA_PER_LETTER[item.let])
      {
        var indice = this.OBJS.DATA_PER_LETTER[item.let].indexOf(item.id)
        console.log("indice: "+indice)
        this.OBJS.DATA_PER_LETTER[item.let].splice(indice, 1)
      }
      delete this.OBJS.DATA[item.id]
      with(this.OBJS.Dom)
      {
        remove_listing_letter(item.let)
        on_click_onglet(item.let) 
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
  update_item_list_with_new_item:function()
  {
    var uitem = this.current
    uitem.is_new = true // encore utile ?
    // = Ajout à this.OBJS.DATA =
    this.OBJS.DATA[uitem.id] = uitem.data_mini
    // = Ajout à this.OBJS.DATA_PER_LETTER =
    // @note: si DATA_PER_LETTER a déjà été établie, c'est ici
    // qu'il faut ajouter le uitem. Sinon, il sera automatiquement
    // ajouté à la définition de DATA_PER_LETTER.
    if(this.OBJS.check_if_list_per_letter_ok)
    {
      this.OBJS.DATA_PER_LETTER[uitem.let].push( uitem.id )
      this.OBJS.DATA_PER_LETTER[uitem.let].sort
    } 
    // = Forcer l'actualisation du listing =
    this.OBJS.Dom.remove_listing_letter( uitem.let )
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
   *    = On peut venir aussi de `update_item_list_with_new_item' ci-dessus lorsque
   *      c'est une création de film.
   */
  end:function()
  {
    this.OBJS.Dom.hide_formulaire
    if(this.current.is_new) this.OBJS.Dom.on_click_onglet( this.current.let )
  },
 
  /*
   *  Retourne un identifiant de film à partir du +value+ fourni
   *  
   *  TODO: Voir si ce sera pareil pour les mots… En tout cas, il faut
   *        également commencer par le mot  lui-même pour les classements 
   *        et les tris par lettre.
   *
   */
  id_from_mainprop:function(value)
  {
    var t = Texte.to_ascii( value )
    t = t.titleize().replace(/[^a-zA-Z0-9]/g,'')
    return t
  },
 
}


/*
 *  Propriétés complexes à ajouter aux sous-objets <OBJETS PLURIEL>.Edition
 *  
 */
OBJETS_Edition_defined_properties = {
  
  /*
   *  Raccourci pour obtenir l'identifiant du panneau
   *  
   */
  "id_panneau":{
    get:function(){
      if(undefined == this._id_panneau)
      {
        this._id_panneau = this.OBJS.Dom.id_panneau
      }
      return this._id_panneau
    }
  },
  /*
   *  Raccourci pour obtenir le préfix utilisé par <OBJET PLURIEL>.Dom
   *  
   */
  "prefix":{
    get:function(){
      if(undefined == this._prefix) this._prefix = this.OBJS.Dom.prefix
      return this._prefix
    }
  },
  
  /*
   *  Return le {jQuerySet} du formulaire d'édition du film.
   *  
   */
  "form":{
    get:function(){return $('div#'+this.id_panneau+'_edition div#'+this.prefix+'form')}
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
      $('div#'+this.id_panneau+'_edition').html('')
      $('div#'+this.id_panneau+'_edition').append( this.html_form )
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
      return  '<div id="'+this.prefix+'div_form" class="div_form_item">' +
                this.html_formulaire + 
                this.html_div_buttons + 
              '</div>'
    }
  }  

}

if(undefined == FILMS.Edition) FILMS.Edition = {}
$.extend(FILMS.Edition, OBJETS_Edition)
Object.defineProperties(FILMS.Edition, OBJETS_Edition_defined_properties)
