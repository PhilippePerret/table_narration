/*
 *  Méthodes Fiche pour le verso de la fiche
 *  
 */
Object.defineProperties(Fiche.prototype,{

  /*
   *  Retourne le code HTML du VERSO de la fiche
   *  -------------------------------------------
   */
  "html_verso":{
    get:function(){
      return  '<verso id="'+this.dom_id+'-verso" class="'+this.type+'" style="display:none;">'+
                '<div id="'+this.titre_verso_id+'" class="titre_verso"></div>' +
                this.html_fieldset_parametres +
              '</verso>'
    }
  },
  
  /*
   *  Règle le verso
   *  --------------
   *  Cette méthode est appelée quand on retourne la fiche, entendu qu'on ne
   *  définit pas vraiment son verso à l'affichage. Et puis certaines valeurs,
   *  comme le titre, ne sont pas affichées.
   *  Donc c'est seulement quand on la met au verso qu'on règle les choses
   *  suivant les fiches.
   *
   */
  "regle_verso":{
    get:function(){
      this.set_titre_verso
      if(undefined != this.after_regle_verso) this.after_regle_verso
    }
  },

  /*
   *  Au verso, le fielset contenant les paramètres
   *  
   */
  "fieldset_parametres":{get:function(){return $(this.fieldset_parametres_jid)}},
  "fieldset_parametres_jid":{get:function(){return "fieldset#"+this.fieldset_parametres_id}},
  "fieldset_parametres_id":{get:function(){return this.dom_id+'-fieldset_parametres'}},
  "html_fieldset_parametres":{
    get:function(){
      return '<fieldset id="'+this.fieldset_parametres_id+'">' +
        '<legend>Paramètres</legend>'+
        '</fieldset>'
    }
  },
  
  "titre_verso_id":{get:function(){return this.dom_id+"-titre_verso"}},
  "titre_verso_jid":{get:function(){return 'div#'+this.titre_verso_id}},
  "set_titre_verso":{
    get:function(){
      $(this.titre_verso_jid).html(
        "Verso " + FICHES.datatype[this.type].hname + " #" + this.id + " : " + 
        (this.is_paragraph ? (this.texte || "").substring(0, 50) : this.titre)
      )
    }
  }
  
  
})