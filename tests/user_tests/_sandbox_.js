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

})


/* === PROPRIÉTÉ DE FICHE === */
Object.defineProperties(Fiche.prototype, {
  
  /*
   *  ---------------------------------------------------------------------
   *    DOM Methods
   *
   */
  
  
  /*
   *  Retourne la fiche
   *  
   */
  "retourne":{
    configurable:true,
    get:function()
    {
      this.recto[this.retourned ? 'show' : 'hide']()
      this.verso[this.retourned ? 'hide' : 'show']()
      this.retourned = !this.retourned
    }
  },
  
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