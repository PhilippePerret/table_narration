/**
 * @module    UI_HTML
 * @submodule Html
 *
 **/

/**
  *  Sous-Objet UI.Html
  *
  *  Construction des éléments HTML.
  *
  *  @class  UI.Html
  *  @static
  *
  **/
UI.Html = {

  /** Construction d'un menu select
    * @method select
    * @param  {Object} dfield   Données pour la construction du select
    *   @param  {String}  dfield.id       Identifiant du select
    *   @param  {String}  dfield.class    Class CSS éventuelle
    *   @param  {String}  dfield.onchange Le code à jouer quand on change la valeur
    *   @param  {Array}   dfield.options  Liste des options. Array d'objects {value, title}
    *   @param  {String}  dfield.label    Libellé eventuel à placer avant
    */
  select:function(dfield)
  {
    var c = ""
    if(dfield.label) c += '<label for="'+dfield.id+'">'+dfield.label+'</label>'
    c += this.tag($.extend(dfield, {tag:'select'}))
    c += L(dfield.options).collect(function(option){
      return '<option value="'+option.value+'">'+option.title+'</option>'
    }).join("")
    c += '</select>'
    return c
  },
  /**
    * Construction d'un checkbox
    * @method checkbox
    * @param  {Object} dfield   Données pour la construction du champ
    *   @param  {String}  dfield.id     Identifiant de la cb
    *   @param  {String}  dfield.label  Label
    *   @param  {String}  dfield.class  La class CSS éventuelle
    *   @param  {Boolean} dfield.indiv  Si true, met la cb et son label dans un div
    *   @param  {String}  dfield.onchange   Code à jouer en cas de changement
    * @return {String} Le code HTML construit
    */
  checkbox:function(dfield)
  {
    var c = this.tag($.extend(dfield, {tag:'input', type:'checkbox'}))
    c += '<label for="'+dfield.id+'">'+dfield.label+'</label>'
    if(dfield.indiv) c = '<div>'+c+'</div>'
    return c
  },
  
  /**
    * Retourne le code HTML pour une image de path +path+ et d'attributs
    * optionnels +attrs+.
    *
    * @method img
    * @param  {String} path   Chemin d'accès à l'image
    * @param  {Object|Undefined} attrs    Attributs à appliquer à la balise
    * @return {StringHTML} Le code HTML pour charger l'image
    */
  img:function(path, attrs)
  {
    if(!attrs) attrs = {}
    attrs.tag  = 'img'
    if(!attrs.data) attrs.data = {src:null}
    attrs.data.src = path
    return this.tag( attrs )
  },
  
  /** Méthode générale préparant une balise
    * @method tag
    * @param  {Object} dfield   Donnée pour le champ
    *   @param  {String}  dfield.tag      La balise
    *   @param  {String}  dfield.type     Le type (if any)
    *   @param  {String}  dfield.value    La valeur de la tag (value)
    *   @param  {String}  dfield.class    La class CSS (if any)
    *   @param  {String}  dfield.onchange Le code à jouer en cas de changement
    *   @param  {Object}  dfield.data     Objet pour les autres données. En clé le
    *                                     nom de l'attribut (p.e. "data-param") et en
    *                                     valeur la valeur à lui donner.
    * @return le code HTML de la balise
    */
  tag:function(dfield)
  {
    var t = '<'+dfield.tag
    if(dfield.id        ) t += ' id="'+dfield.id+'"'
    if(dfield.type      ) t += ' type="'+dfield.type+'"'
    if(dfield.class     ) t += ' class="'+dfield.class+'"'
    if(dfield.onchange  ) t += ' onchange="'+dfield.onchange+'"'
    if(dfield.value     ) t += ' value="'+dfield.value+'"'
    if(dfield.data)
    {
      t += L(dfield.data).collect(function(k,v){return ' '+k+'="'+v+'"'})
    }
    if(dfield.tag == 'input' || dfield.tag == 'img') t += ' />'
    else t += '>'
    return t
  }
}