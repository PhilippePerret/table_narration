/**
 *  @module ObjetClass
 */

/**
 *  Class qui sera héritée par les « Items » de l'application, qui peuvent être
 *  des {Film}s, des {Mot}s, etc.
 *
 *  @class  ObjetClass
 *  @constructor
 *
 *  @param  id  {String} Identifiant de l'item.
 *
 */
window.ObjetClass = function(id){
  this.id             = id
  this.loaded         = false  
}

/*
 *  Méthodes à argument
 *  
 */
$.extend(ObjetClass.prototype,{
  
  /*
   *  Dispatch les +data+ envoyées dans l'instance
   *  
   */
  dispatch:function(data)
  {
    for(var prop in data){ 
      var value = data[prop]
      if('string' == typeof value) value = value.stripSlashes()
      this[prop] = value
    }
  },
  
  /**
    * Place l'apercu de l'item dans l'objet DOM +domObj+
    * en le créant si nécessaire.
    *
    * NOTES
    * -----
    *   * L'aperçu est également décalé à droite ou à gauche suivant la
    *     position de son contenant dans le texte pour être parfaitement visible.
    *   * On affiche pas l'aperçu si le mot se trouve dans un aperçu.
    *
    * @method apercu_in
    *
    * @param  domObj  {DOMElement} Element du DOM dans lequel placer l'aperçu.
    *                 C'est normalement un lien/balise dans le texte.
    */
  apercu_in:function(domObj)
  {
    if($(domObj).parents().hasClass('apercu'))
    {
      dlog("Je n'affiche pas l'aperçu dans un aperçu")
      return
    }
    if(this.apercu.length == 0) this.create_apercu(domObj)
    else $(domObj).append(this.apercu)
    var agauche = $(domObj).position().left < ($(domObj).parent().width() / 2)
    this.apercu.css({
      'right': agauche ? null : '0',
      'left' : agauche ? '0' : null
    })
  },
  
  /*
   *  Construit l'aperçu de l'affichage lorsqu'on passe la 
   *  souris sur le mot.
   *
   *  NOTES
   *    = La méthode gère le fait que l'item ne soit pas encore chargé
   *  
   *  @param  inObj   {DomElement} dans lequel placer l'aperçu à sa création
   */
  create_apercu:function(inObj)
  {
    if(false == this.loaded) return this.load($.proxy(this.create_apercu, this, inObj))
    $(inObj).append(this.html_apercu)
    this.update_apercu
    this.apercu.bind('click', $.proxy(this.OBJS.Edition.edit, this.OBJS.Edition, this.id))
  }
  
})

/*
 *  Propriétés (complexes)
 *  
 */
Object.defineProperties(ObjetClass.prototype, {
  /* ---------------------------------------------------------------------
   *
   *  DATA (communes aux différents types d'objet — film, mot, etc.)
   *  
   --------------------------------------------------------------------- */
  "let":{
    get:function(){ 
      if(undefined == this._let)
      {
        this._let = this.id.charCodeAt(0)
        if(this._let.is_between(48,57)) this._let = 0
      }
      return this._let 
    },
    set:function(let){ this._let = let}
  },
  
  /* ---------------------------------------------------------------------
   *
   *  DOM
   *  
   --------------------------------------------------------------------- */
  
  /*
   *  Retourne l'identifiant du div apercu
   *  
   */
  "id_apercu":{get:function(){return this.class_min+'_apercu-'+this.id}},
  /*
   *  Retourne le {jQuerySet} de l'apercu de l'item
   *  
   */
  "apercu":{
    get:function(){
      return $('div#'+this.id_apercu)
    }
  },
  
  /* ---------------------------------------------------------------------
   *
   *  ETAT
   *  
   --------------------------------------------------------------------- */
  "modified":{
    enumerable:true,
    get:function(){ return this._modified || false },
    set:function(val)
    {
      this._modified = val
    }
  },
  
  /* ---------------------------------------------------------------------
   *
   *  PSEUDO-MÉTHODES
   *  
   --------------------------------------------------------------------- */
  
  /*
   *  Chargement des données complètes de l'item
   *  
   *  @param  poursuivre  La méthode poursuivre
   */
  "load":{
    value:function(poursuivre, rajax)
    {
      dlog("-> load")
      if(undefined == rajax)
      { // => Requête ajax
        dlog("script : "+this.folder_ajax+'/load')
        Ajax.send(
          {script:this.folder_ajax+'/load', item_id:this.id},
          $.proxy(this.load, this, poursuivre)
        )
      }
      else
      { // => Retour chargement
        if(rajax.ok)
        {
          this.dispatch( rajax.ditem )
          this.loaded = true
          if('function'==typeof poursuivre) poursuivre()
        }
        else
        { 
          this.unabled_to_load = true
          F.error(rajax.message)
        }
      }
    }
  },
  
  /*
   *  Enregistrement des données complètes de l'instance
   *  
   *  @param  poursuivre  La méthode poursuivre
   */
  "save":{
    enumerable:true,
    value:function(poursuivre, rajax){
      if(undefined == rajax)
      { // => Requête ajax
        Ajax.send(
          {script:this.folder_ajax+'/save', data:this.data_for_save},
          $.proxy(this.save, this, poursuivre)
        )
      }
      else
      { // => Retour sauvegarde
        if(rajax.ok)
        {
          F.show(LOCALE[this.class_min].message['is saved'])
          this.modified = false
          if('function'==typeof poursuivre) poursuivre()
        }
        else F.error(rajax.message)
      }
    }
  },
  
  /*
   *  Mise en édition de l'instance
   *  -----------------------------
   *
   *  NOTES
   *  -----
   *
   */
  "edit":{
    enumerable:true,
    get:function(){
      if(this.unabled_to_load == true) return // abandon
      if(false == this.loaded) return this.load($.proxy(this.OBJS.edit, this.OBJS, this.id))
      this.OBJS.Edition.set_values( this )
    }
  },

  /*
   *  Data à envoyer par la requête d'enregistrement de l'item
   *  
   */
  "data_for_save":{
    get:function()
    {
      var d = {}
      var my = this
      L(this.OBJS.Edition.ITEM_PROPERTIES).each(function(prop){
        d[prop] = my[prop]
        if(d[prop] == "") d[prop] == null
      })
      return d
    }
  }

})