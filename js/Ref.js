/**
  * @module ref.js
  * 
  */

/**
  * Class pour une référence. Une référence est une instance qui permet de gérer
  * à la volée les références à d'autres fiches qui sont faites dans des textes
  * (ou plus rarement des titres). Une référence possède une fiche-cible ({Fiche})
  * qui correspond à l'instance {Fiche} visée par la référence (comprendre : 
  * “l'instance {Ref} fait référence à la cible {Fiche}).
  *
  * L'instance {Ref} peut posséder également une “porteuse”, qui est la fiche dans
  * laquelle cette référence est insérée. Elle est définie principalement lorsque
  * le texte de la porteuse doit être formaté pour affichage "humain".
  *
  * L'instance {Ref} est capable de gérer toutes les situations, celle où la cible
  * n'est pas encore une fiche chargée, où la fichier porteuse de la référence
  * n'appartient pas au même livre que la fiche-cible de référence, etc.
  *
  * Notes
  * -----
  *   * Bien que l'instance {Ref} ne soit pas une {Fiche}, ses propriétés `id` et
  *     `type` sont les mêmes que sa fiche-cible. Mais pour la clarté, l'instance {Ref}
  *     possède les propriétés `cible_id` et `cible_type` qui sont des alias.
  *
  * @class Ref
  * @constructor
  * @param  {String} rid  Identifiant de la référence correspondant à `<type>-<id>`
  *                       de la cible.
  */
window.Ref = function(rid)
{
  var did = rid.split('-')
  /**
    * Type de la cible de la référence
    * @property {String} type
    * @final
    */
  this.type = this.cible_type = did[0]
  /**
    * Identifiant de la cible de la référence
    * @property {Number|String} id
    * @final
    */
  this.id   = this.cible_id   = did[1]
  
  /**
    * La fiche porteuse de la référence, c'est-à-dire qui la possède dans
    * son texte. La plupart du temps, c'est un {Paragraph} de page.
    * Notes
    * -----
    *   * Noter que cette propriété est dynamique elle change en fonction de
    *     la référence à écrire.
    *
    * @property {Fiche} porteuse
    */
  this.porteuse = null
  
  
  REFS.list[rid] = this
}
$.extend(Ref.prototype,{
  /**
    * Formate la balise pour affichage
    *
    * Notes
    * -----
    *   * Le formatage de la balise dépend de :
    *       * Si la cible est chargée ou non
    *       * Si la cible appartient au même livre ou non
    *       * Si le chargement de la cible peut se faire ou non
    *
    * @method formate
    * @param  {Fiche}   porteuse        La fiche qui doit recevoir la référence formatée
    * @param  {Array}   default_title   Le titre par défaut contenu dans la balise.
    * @param  {Boolean} skip_loading  
    *                   Pour le moment, ce paramètre n'est pas pris en compte : on ne
    *                   tente jamais de charger la fiche d'une référence inexistante
    *                   pour éviter les problèmes (vu que le formatage est un flux sur)
    *                   un ensemble de paragraphes.
    * @return {String} La balise formatée pour affichage.
    */
  formate:function(porteuse, default_title, skip_loading)
  {
    this.porteuse       = porteuse
    this.default_title  = default_title
    this['titres_for_'+(this.cible?'':'non_')+'loaded_cible']()
    return this.to_html
  },
  
  
  /**
    * Formatage du titre pour une cible chargée
    * La méthode définit les valeurs `titre_same_book` et `titre_hors_book` de
    * la référence
    *
    * @method titres_for_loaded_cible
    *
    */
  titres_for_loaded_cible:function()
  {
    this.titre_same_book = this.human_type + " “"+this.titre_cible+"”"
    this.titre_hors_book = this.titre_same_book + this.mark_book
  },
  
  /**
    * Définit les titres pour une cible non chargée (simple)
    * Notes
    * -----
    *   * La cible n'étant pas chargée, on ne peut rien savoir d'elle, on met
    *     donc le même texte simple dans les deux propriétés `titre_same_book`
    *     et `titre_hors_book`.
    *
    * @method titres_for_non_loaded_cible
    */
  titres_for_non_loaded_cible:function()
  {
    var titre = "[# " + this.human_type + " “" + this.default_title + "” #]"
    this.titre_same_book = titre
    this.titre_hors_book = titre
  },
  
})

Object.defineProperties(Ref.prototype, {
  
  /* ---------------------------------------------------------------------
   *  MÉTHODES D'ÉCRITURE
   */
  
  /**
    * Retourne la balise [ref:...] à écrire dans le code du texte/titre
    * @property {String} to_balise
    * @final
    * @example
    *   jq.append(ref.to_balise)
    *   // Where `jq` is a DOMElement
    *   // And `ref` is a Ref Instance
    */
  "to_balise":{
    get:function(){
      if(undefined == this._to_balise)
      {
        this._to_balise = "[ref:"+this.type+"-"+this.id+"|"+this.titre_cible+"]"
      }
      return this._to_balise
    }
  },
  
  /**
    * Retourne la balise HTML pour la référence
    * Notes
    * -----
    *   * C'est une propriété complexe, l'appeler sans parenthèses
    *   * Le titre (le contenu) de la balise doit avoir été construit avant
    *     d'appeler cette méthode
    * @method balise_html
    * @return {String} La balise à écrire dans le texte.
    */
  "to_html":{
    get:function(){
      return '<ref' +
                ' class="'+this.class + '"'+
                ' onclick="FICHES.show('+this.id+', \''+this.type+'\')"'+
                '>' +
                this.titre_for_porteuse +
                '</ref>'
    }    
  },
  
  /**
    * Appelée pour updater l'affichage de toutes les références lorsque la
    * fiche-cible est chargée.
    * Notes
    * -----
    *   * Propriété complexe => appeler sans parenthèses
    *
    * @method update
    */
  "update":{
    get:function(){
      this.titres_for_loaded_cible()
    }
  },
  /* ---------------------------------------------------------------------
   *  MÉTHODES DE DONNÉES
   */
  
  /**
    * Instance Fiche de la cible de la référence
    * Notes
    * -----
    *   * WARNING: Cette propriété est mise à NULL même si l'instance Fiche
    *     existe, mais qu'elle n'est pas encore chargée.
    *
    * @property {Fiche} cible
    *
    */
  "cible":{
    get:function(){
      if(undefined == this._cible && FICHES.list[this.cible_id]){ 
        this._cible = get_fiche(this.cible_id)
        if(!this._cible.loaded) this._cible = null
      }
      return this._cible
    }
  },
  
  /**
    * Titre pour la fiche-porteuse (pour la composition de son texte affiché)
    * Notes
    * -----
    *   * Ce titre varie en fonction du fait que cible et porteuse se trouvent
    *     ou non dans le même livre.
    *
    * @property {String} titre_for_porteuse
    *
    */
  "titre_for_porteuse":{
    get:function(){
      return this['titre_'+(this.same_book?'same':'hors')+'_book']
    }
  },
  
  /**
    * Retourne le titre pour la cible
    * Notes
    * -----
    *   * Ce titre dépend du type de la fiche. Pour un book, on prend son titre
    *     réel (`real_titre`), pour un paragraphe, on prend ses 50 premiers signes,
    *     et on prend le titre normal pour les chapitres et les pages.
    *   * Cette propriété ne doit être utilisée que pour une fiche-cible chargée.
    *
    * @property {String} titre_cible
    * @static
    */
  "titre_cible":{
    get:function(){
      if(undefined == this._titre_cible)
      {
        this._titre_cible = function(ref){
          var fi = ref.cible
          switch(ref.type)
          {
          case 'book' : return fi.real_titre || fi.titre
          case 'para' : return fi.texte.substring(0,50)
          default     : return fi.titre
          }
        }(this)
      }
      return this._titre_cible
    }
  },

  /**
    * Marque pour le livre à ajouter dans le titre hors book (quand la cible et
    * la fiche porteuse n'appartienne pas au même livre ou que l'une des deux fiches
    * n'est pas dans un livre)
    * @property {String} mark_book
    * @final
    */
  "mark_book":{
    get:function(){
      if(undefined == this._mark_book)
      {
        if(this.book) this._mark_book = " (livre “"+(this.book.real_titre||this.book.titre)+"”)"
        else this._mark_book = ""
      }
      return this._mark_book
    }
  },
  
  /**
    * Renvoie true si la cible de la référence appartient au même livre que la
    * fiche porteuse (this.porteuse).
    *
    * Notes
    * -----
    *   * C'est une propriété complexe qui est recalculée à chaque nouvelle porteuse.
    *   * @rappel: this.porteuse est une instanceof {Fiche}
    *   * Si la cible de la référence courante n'est pas encore chargée, on ne peut
    *     pas déterminer son livre. La propriété est alors mise à false.
    *
    * @property {Boolean} same_book
    *
    */
  "same_book":{
    get:function(){
      if(undefined == this.porteuse)
      {
        var err = "La porteuse de la référence devrait être définie… Je ne peux rien faire." 
        F.error(err)
        throw err
      }
      if(!this.cible || !this.cible.loaded) return false
      else return this.cible.book_id == this.porteuse.book_id
    }
  },
  

  /**
    * Retourne la class pour la balise `ref` en tenant compte du fait que la
    * référence appartient ou non au même livre que la fiche porteuse contenant
    * la référence.
    * Notes
    * -----
    *   * C'est une propriété complexe car la valeur est redéfini à chaque nouvelle
    *     insertion dans le texte demandée.
    * @property {String} class
    */
  "class":{
    get:function(){
      return this['class_'+(this.same_book?'same':'hors')+'_book']
    }
  },
  /**
    * Retourne la class pour la balise ref dans le cas d'une référence qui
    * appartient au même livre que la porteuse.
    * Notes
    * -----
    *   * C'est une propriété complexe qui redéfinit la valeur à chaque nouvelle
    *     fiche porteuse (paragraphe)
    * @property {String} class_same_book
    */
  "class_same_book":{
    get:function(){
      return this.type+"-"+this.id+"-in"
    }
  },

  /**
    * Retourne la class pour la balise ref dans le cas d'une référence qui
    * N'appartient PAS au même livre que la porteuse.
    * Notes
    * -----
    *   * C'est une propriété complexe qui redéfinit la valeur à chaque nouvelle
    *     fiche porteuse (paragraphe)
    * @property {String} class_hors_book
    */
  "class_hors_book":{
    get:function(){
      return this.type+"-"+this.id+"-out"
    }
  },

  /**
    * Titre construit pour la référence, tel qu'il apparaitra dans le texte.
    * Il dépend de l'état de chargement de la cible de la référence et de l'appartenance
    * ou non au même book que la porteuse.
    * Notes
    * -----
    *   * C'est une propriété complexe car sa (re)-définition peut faire varier
    *     toutes les balises références de la même référence.
    *
    * @property {String} titre
    */
  "titre_same_book":{
    get:function(){
      return this._titre_same_book // doit avoir été défini avant
    },
    set:function(titre){
      this._titre_same_book = titre
      // On doit modifier toutes les références qu'on trouve
      $('ref.'+this.class_same_book).html( titre )
    }
  },
  /**
    * Propriété similaire à la précédente, mais pour une référence n'appartenant
    * pas au livre de la porteuse.
    * @property {String} titre_hors_book
    */
  "titre_hors_book":{
    get:function(){
      return this._titre_hors_book // doit avoir été défini avant
    },
    set:function(titre){
      this._titre_hors_book = titre
      // On doit modifier toutes les références qu'on trouve
      $('ref.'+this.class_hors_book).html( titre )
    }
  },


  /**
    * Type humain de la référence (par exemple "livre" pour le type 'book')
    * Notes
    * -----
    *   * La valeur est sans capitale, pour pouvoir s'insérer dans le flux du texte
    *     ou entre parenthèses.
    * @property {String} human_type
    * @final
    */
  "human_type":{
    get:function(){
      if(undefined == this._human_type) this._human_type = FICHES.datatype[this.type].hname;
      return this._human_type
    }
  },
  
  /**
    * Retourne l'instance {Fiche} de la référence courante
    *
    * Notes
    * -----
    *   * Pour obtenir cette information, il faut obligatoirement que
    *     la cible de la référence soit chargée.
    *
    * @property {Fiche} book
    *
    */
  "book":{
    get:function(){ 
      if(undefined == this._book) this._book = this.cible.book 
      return this._book
    }
  },
  
  /**
    * Retourne l'identifiant du livre de la référence
    *
    * Notes
    * -----
    *   * Pour obtenir cette information, il faut obligatoirement que
    *     la cible de la référence soit chargée. Donc à n'utiliser que dans les
    *     méthodes/propriétés qui traitent du cas où la cible est loaded.
    *
    * @property book_id
    * @type {String|Number}
    */
  "book_id":{
    get:function(){
      return this.book.id
    }
  }
  
})