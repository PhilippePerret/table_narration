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

  
  /*
   *  ---------------------------------------------------------------------
   *    Changement d'état
   *  
   */
  
  /* Sélection et désélection de la fiche 
   *
   * NOTES
   * -----
   *  # Stoppe l'évènement pour qu'il ne se propage pas aux fiches
   *    ancêtres si elles existent.
   *
   * @param evt   Évènement click qui a permis de sélectionner/déselectionner la fiche
   *              En fonction de la pression ou non de la touche majuscule le comportement
   *              et différent.
   */
  "toggle_select":{
    value:function(evt){
      var idm = "Fiche::toggle_select ["+this.type_id+"] (this.selected:"+this.selected+")"
      dlog("---> "+idm, DB_FCT_ENTER | DB_CURRENT )
      var with_maj = (evt.shiftKey == true)
      if(this.selected && with_maj){ this.deselect }
      else this[this.selected ? 'deselect' : 'select']
      dlog("<- "+idm+ " (en stoppant l'évènement)", DB_FCT_ENTER )
      return stop_event(evt)
    }
  },
  "select":{
    get:function(){
      FICHES.add_selected( this )
      this.selected = true
      if(this.built) this.obj.addClass('selected')
      this.repercute_zindex_on_ancestors(5 + parseInt(this.obj.css('z-index'),10))
    }
  },
  "deselect":{
    get:function(){
      FICHES.remove_selected( this )
      this.selected = false
      if(this.built) this.obj.removeClass('selected')
      this.repercute_zindex_on_ancestors('')
    }
  },
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
      dlog("Application du z-index "+zindex+" sur les parents")
      if(this.is_book) return
      var p = this.obj.parent()
      do { 
        p = p.parent()
        if(p.length) p.css('z-index', zindex)
      } while(p.length && p.attr('class').indexOf('fiche book') == -1)
    }
  }
})