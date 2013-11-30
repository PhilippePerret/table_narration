/*
 *  SAND BOX
 *
 *  Mettez du code à tester ici et cliquer sur la case à cocher `Sand box' (ou `Bac à sable')
 *
 *  Ce bac à sable permet d'essayer du code sans avoir à recharger l'application. Il est
 *  actualiser à chaque fois.
 *
 */

$.extend(FICHES, {
  
  /*
   *  Ajoute une fiche instanciée
   *  
   *  NOTE
   *  ----
   *
   *  @param  ifiche    Instance Fiche de la fiche instanciée
   *
   */
  add:function(ifiche)
  {
    // La fiche ne doit pas encore exister
    if(undefined != this.list[ifiche.id]) return
    this.list[ifiche.id] = ifiche
    this.length ++
  },
  
  /*
   *  Supprime une fiche instanciée
   *  
   */
  remove:function(ifiche)
  {
    // La fiche doit exister
    if(undefined == this.list[ifiche.id]) return
    delete this.list[ifiche.id]
    this.length --
  },
  
  /*
   *  Ajout d'une fiche à la sélection
   *  
   *  NOTES
   *  -----
   *    * Dans tous les cas, la dernière fiche est mise en fiche courante
   *
   *  @param  ifiche    Instance de la fiche à ajouter à la sélection
   */
  add_selected:function(ifiche)
  {
    this.current = ifiche
  },
  /*
   *  Suppression d'une fiche de la sélection
   *  
   *  @param  ifiche    Instance de la fiche à retirer de la sélection
   */
  remove_selected:function(ifiche)
  {
    
  }
})

Object.defineProperties(FICHES,{
  "init_all":{
    configurable:true,
    get:function(){
      this.length   = 0
      this.list     = {}
      this.current  = null
      this.last_id  = -1
      $('section#table').html('')
    }
  },
  
})

/* === PROPRIÉTÉ DE FICHE === */
Object.defineProperties(Fiche.prototype, {
  
  /*
   *  Définit si nécessaire l'objet jQuery de la fiche et le retourne
   *  
   */
  "obj":{
    configurable:true,
    get:function(){
      if(undefined == this._obj){
        var obj = $(this.jid)
        obj.length && (this._obj = obj)
      } 
      return this._obj
    }
  },
  
  /* Retourne le DOM élément de la fiche */
  "dom_obj":{
    configurable:true,
    get:function(){
      if(undefined == this._dom_obj) this._dom_obj = this.obj[0]
      return this._dom_obj
    }
  },
    
  /*
   *  Positionne la fiche sur le table en fonction de :
   *    - son état ranged ou non
   *    - ses top / left
   */
  "positionne":{
    configurable:true,
    get:function(){
      if( this.ranged || this.top == null || !this.obj ) return
      this.obj.css({'top':this.top+"px", 'left':this.left+"px"})
    }
  },
  
  /*
   *  Création d'une nouvelle fiche
   *  
   *  “Créer la fiche” consiste à :
   *    - mettre la fiche en attente de sauvegarde
   *    - créer son objet sur la table
   */
  "create":{
    configurable:true,
    get:function(){
      this.modified = true
      this.build
      this.open
      this.set_values
      return true
    }
  },
  
  /*
   *  Construction de la fiche sur la table
   *  
   */
  "build":{
    configurable:true,
    get:function(){
      // On ajoute le code ou on le remplace
      if(this.obj) this.obj.replaceWith( this.html )
      else         $('section#table').append( this.html )
      // Elle est toujours construite fermée
      this.close
      // On positionne la fiche
      this.positionne
      // On doit la rendre draggable
      this.obj.draggable({containment:'parent'})
      return true
    }
  },
  
  /*
   *  Ouvre la fiche
   *  
   */
  "open":{
    configurable:true,
    get:function(){
      this.obj.addClass('opened')
      this.opened = true
    }
  },
  /*
   *  Ferme la fiche
   *  
   */
  "close":{
    configurable:true,
    get:function(){
      this.obj.removeClass('opened')
      this.opened = false
    }  
  },
  
  /*
   *  Met les valeurs de la fiche dans la fiche DOM
   *  
   */
  "set_values":{
    configurable:true,
    get:function(){
      this.input_titre.val(this.titre || "")
      if(this.is_book) this.input_real_titre.val(this.real_titre || "")
      if(this.is_paragraph) this.input_texte.val(this.texte || "")
      return true
    }
  },
  
  /*
   *  ---------------------------------------------------------------------
   *    Changement d'état
   *  
   */
  /* Sélection et désélection de la fiche 
   *
   * @param evt   Évènement click qui a permis de sélectionner/déselectionner la fiche
   *              En fonction de la pression ou non de la touche majuscule le comportement
   *              et différent.
   */
  "toggle_select":{
    configurable:true,
    value:function(evt){
      var with_maj = evt.shiftKey == true
    }
  },
  "select":{
    configurable:true,
    get:function(){
      
    }
  },
  "deselect":{
    configurable:true,
    get:function(){
      
    }
  },
  
  /*
   *  ---------------------------------------------------------------------
   *    DOM Methods
   *
   */
  
  
  /*
   *  Retourne le code HTML pour la fiche
   *  
   */
  "html":{
    configurable:true,
    get:function(){
      return  '<fiche id="' + this.dom_id + '" class="fiche '+this.type+'">' +
              '<div class="poignee"></div>' +
              this.html_recto + this.html_verso +
              '</fiche>' ;
    }
  },
  
  /*
   *  Retourne le code HTML du RECTO de la fiche
   *  
   */
  "html_recto":{
    configurable:true,
    get:function(){
      return  '<recto id="'+this.dom_id+'-recto" class="'+this.type+'">'+
              this.html_input_titre + // + champ 'real_titre' pour Book
              this.html_div_items   + // textarea.texte pour un paragraphe
              '</recto>'
    }
  },
  
  /* Retourne le code HTML pour le titre de la fiche (sauf paragraphe) */
  "html_input_titre":{
    configurable:true,
    get:function(){
      if(this.is_paragraph) return ""
      var c = '<input type="text" value="" id="'+this.dom_id+'-titre" class="titre" />'
      if(this.is_book) c += '<input type="text" value="" id="'+this.dom_id+'-real_titre" class="real_titre" />'
      return c
    }
  },
  
  /* Retourne le code HTML pour le div des items de la fiche (sauf paragraphe) */
  "html_div_items":{
    configurable:true,
    get:function(){
      if(this.is_paragraph) 
        return '<textarea id="'+this.dom_id+'-texte" class="texte"></textarea>'
      else
        return '<div id="'+this.dom_id+'-items" class="items"></div>'
    }
  },
  
  /*
   *  Retourne le code HTML du VERSO de la fiche
   *  
   */
  "html_verso":{
    configurable:true,
    get:function(){
      return  '<verso id="'+this.dom_id+'-verso" class="'+this.type+'" style="display:none;">'+
              '</verso>'
    }
  },
  
  /*
   *  Sauvegarde de la fiche
   *  
   */
  "save":{
    configurable:true,
    get:function(){
      return true
    }
  },
  
  /*
   *  Destruction totale d'une fiche
   *  
   */
  "remove":{
    configurable:true,
    get:function(){
      // TODO: Implémenter le traitement complexe (appartenances, etc.)
      this.obj.remove()
      this.delete ;
    }
  },
  
  /*
   *  Suppression d'une fiche
   *  
   */
  "delete":{
    configurable:true,
    get:function(){
      this.deleted  = true
      FICHES.remove( this )
      this.modified = true
    }
  }
  
})



// KEEP THIS CODE LINE !
TEST_SANDBOX_READY = true