/*
 *  Méthodes Fiche concernant l'état de la fiche
 *  
 */
Object.defineProperties(Fiche.prototype,{
  "is_book"           :{get:function(){ return this._type == 'book'}},
  "is_not_book"       :{get:function(){ return this._type != 'book'}},
  "is_chapter"        :{get:function(){ return this._type == 'chap'}},
  "is_not_chapter"    :{get:function(){ return this._type != 'chap'}},
  "is_page"           :{get:function(){ return this._type == 'page'}},
  "is_not_page"       :{get:function(){ return this._type != 'page'}},
  "is_paragraph"      :{get:function(){ return this._type == 'para'}},
  "is_not_paragraph"  :{get:function(){ return this._type != "para"}},

  /**
    * Pour savoir si la fiche a des enfants
    * @property {Boolean} has_children
    * @return TRUE si la fiche possède des {Fiche}s enfants.
    */
  "has_children":{
    get:function(){
      return ('object' == typeof this.enfants) && this.enfants.length > 0
    }
  },
  
  /**
    * Pour savoir si la fiche est orpheline (sans parent)
    * @property {Boolean} is_orpheline
    * @return   TRUE si la fiche n'a pas de parent.
    */
  "is_orpheline":{
    get:function(){return undefined == this.parent || this.parent == null}
  },
  
  /**
    * Pour savoir si la fiche à un parent
    * @property {Boolean} has_parent
    * @return TRUE si la fiche n'est pas orpheline.
    */
  "has_parent":{
    get:function(){return false == this.is_orpheline }
  },
  /*
   *  ---------------------------------------------------------------------
   *    Changement d'état
   *  
   */
  
  /*
   *  Répercute le z-index de la fiche courant sur les parents
   *  Dans le cas contraire, les parents apparaitraient en dessous
   *  d'une autre fiche (ouverte par exemple) et l'élément serait
   *  lui-même masqué alors que son z-index est plus grand.
   * 
   *  @note: Les enfants de la fiche courante sont traités en CSS
   *  
   */
  "repercute_zindex_on_ancestors":
  {
    value:function(zindex){
      dlog("Application du z-index "+zindex+" sur les parents", DB_DETAILLED)
      if( this.ranged == false) return
      var p = this.obj.parent()
      try
      {
        do { 
          p = p.parent()
          if(p.length) p.css('z-index', zindex)
        } while(p.length && p[0].tagName != 'BODY' && p.attr('id') != "table" && p.attr('class').indexOf('fiche book') == -1)
      }catch(err){
        console.error(
          "Erreur dans Fiche::repercute_zindex_on_ancestors ["+this.type_id+"]"+
          "\nErr : "+err+
          "\nCf la valeur de `p' ci-dessous"
        )
        console.dir(p)
      }
    }
  }
})