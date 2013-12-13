window.ObjectClass = function(){}

/*
 *  Méthodes à argument
 *  
 */
$.extend(ObjectClass.prototype,{
  
  /*
   *  Dispatch les +data+ envoyées dans l'instance
   *  
   */
  dispatch:function(data)
  {
    for(var prop in data) this[prop] = data[prop]
  }
})

/*
 *  Propriétés (complexes)
 *  
 */
ObjectClass_defined_properties = {
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
   *  ETAT
   *  
   --------------------------------------------------------------------- */
  "modified":{
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
      if(undefined == rajax)
      { // => Requête ajax
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

}