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
                this.html_fieldset_options +
                '<div style="clear:both;"></div>' +
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
      return '<fieldset id="'+this.fieldset_parametres_id+'" class="parametres">' +
        '<legend>Paramètres</legend>'+
        (this.is_paragraph ? '<div class="div_menu_styles"></div>' : '') +
        '</fieldset>'
    }
  },
  /**
    * Code HTML du fieldset des options à l'arrière de toute fiche
    *
    * Notes
    * -----
    *   * Des options propres à chaque type de fiche peuvent être ajoutées en
    *     définissant la propriété complexe `options_supplementaires` qui doit
    *     renvoyer la liste des options.
    *
    * @property html_fieldset_options
    * @type     {String}
    *
    */
  "html_fieldset_options":{
    get:function(){
      if(undefined != this.options_supplementaires) options = $.merge(options, this.options_supplementaires)
      var c = "", id, prefix = "fiche_option-"+this.id+"-" ;
      L(FICHES.OPTIONS_FICHE).each(function(option){
        id = prefix + option.id
        c += '<div class="fiche_option">'+
          '<input type="checkbox" id="'+id+'" class="fiche_option_'+option.id+'" '+
          'onchange="get_fiche('+this.id+').onchange_option(\''+option.id+'\')" />'+
          '<label for="'+id+'">'+option.label+'</label>'
        '</div>'
      })
      return '<fieldset class="fiche_options">'+'<legend>Options</legend>'+c+'</fieldset>'
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