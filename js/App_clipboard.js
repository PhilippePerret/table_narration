/**
  * @module App_clipboard
  * @submodule app
  *
  * Objet qui gère le clipboard de l'application, dans lequel on peut mettre
  * des fiches, des références, etc.
  */

/**
  * @class App.Clipboard
  * @static
  */
if(undefined == App) App = {}
App.Clipboard = {
  /**
    * Contenu du clipboard
    * @property {Object} content
    */
  content:null,
  
  /**
    * Ajoute un élément au clipboard
    *
    * @method add
    * @param  {Object|String} clip Elément à clipboarder
    * @param  {Object|Null}   params  Les paramètres éventuels
    *   @param  {String}  params.type   Le type de clipboard à mémoriser
    *                                   P.e. 'ref' pour une référence.
    *
    */
  add:function(clip, params)
  {
    if(undefined == params) params = {}
    if(this.content == null) this.content = {}
    if(clip.class == "Fiche")
    { 
      clip.cuted = true
      this.content.fiche = clip
    }
    else
    {
      if(undefined == params.type) params.type = (typeof clip)
      this.content[params.type] = clip
    } 
  },
  
  /**
    * Récupère le contenu du clipboard de type +type+
    * Notes
    *   * Ça n'est pas cette méthode qui détruit le clipboard.
    *     Il faut appeler la méthode App.Clipboard.flush(<type>) pour le faire.
    *
    * @method get
    * @param  {String} type   Le type de contenu possible. Par exemple, si aucun
    *                         champ n'est en édition, c'est pour coller une fiche,
    *                         sinon, ça peut être une référence.
    * @return {Object|String|Null}  Le contenu correspondant ou null
    */
  get:function(type)
  {
    if(this.content == null) return null
    return this.content[type]
  },
  
  /**
    * Colle dans le champ d'édition le contenu du clipboard
    * Notes
    * -----
    *   * La méthode peut récupérer dans l'ordre
    *     * La référence  (type 'ref')
    *     * Le string     (type 'string')
    *     * La fiche      (type 'fiche')
    *     * Un object quelconque (type 'object') mais dans ce cas, l'objet
    *       doit obligatoirement répondre à la méthode (sans parenthèses) `to_balise`.
    *   * La méthode colle le contenu éventuel du clipboard dans le
    *     champ d'édition courant.
    *   * 
    * @method paste
    * @return {Boolean} TRUE si quelque chose a été coller, false otherwise
    */
  paste:function()
  {
    var type
    if      (undefined != this.content.ref)     type = 'ref'
    else if (undefined != this.content.string)  type = 'string'
    else if (undefined != this.content.fiche)   type = 'fiche'
    else if (undefined != this.content.object)  type = 'object'
    else return false
    var foo = this.content[type]
    dlog("foo avant traitement (type="+type+"):");dlog(foo)
    if('object' == typeof foo) foo = foo.to_balise
    dlog("foo après traitement:");dlog(foo)
    if(undefined == foo)
    {
      F.error(LOCALE.app.error['no valid clipboard'])
      return false
    }
    UI.Input.set_selection_to( foo )
    CHelp.adapt_with_fiche_active // pour actualiser les raccourcis actifs
    this.flush(type)
    return true
  },
  
  flush:function(type)
  {
    if(this.content == null) return
    delete this.content[type]
  }
}