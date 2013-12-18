/*
 *  Méthodes pratiques pour les fiches
 *  
 */

/*
 *  Création rapide d'un livre, d'un chapitre, d'une page ou d'un paragraphe
 * 
 *  NOTES
 *  -----
 *    Si le paramètre `parent` est défini dans +data+, la fiche est ajoutée à 
 *    cette fiche (qui doit être créée avant ou non)
 *
 *  @return   La fiche créée d'instance correspondante
 *
 */
function create_book( data ) {
  if(undefined == data) data = {}
  data.type = 'book'
  var ifiche = APP.FICHES.full_create( data )
  if(undefined != data.parent) put_in_parent(data.parent, ifiche)
  return ifiche
}
function create_chapter(data) {
  if(undefined == data) data = {}
  data.type = 'chap'
  var ifiche = APP.FICHES.full_create(data)
  if(undefined != data.parent) put_in_parent(data.parent, ifiche)
  return ifiche
}
function create_page(data) {
  if(undefined == data) data = {}
  data.type = 'page'
  var ifiche = APP.FICHES.full_create(data)
  if(undefined != data.parent) put_in_parent(data.parent, ifiche)
  return ifiche
}

/**
  * Donne un type de fiche ('book', 'chap', 'page', 'para'), une fiche
  * sur la table et retourne l'objet {to_x, to_y} des to_x/to_y qu'il
  * faut appliquer à l'objet outil du type donné, dans un press_and_drag,
  * pour qu'il se retrouve au-dessus de la fiche donnée.
  * 
  * @method to_xy_on_fiche
  * @param  tool   {String} Le type de l'outil
  * @param  fiche   Soit une instance Fiche, soit l'objet DOM de cette
  *                 fiche soit le selector jQuery de cette fiche
  * @return {Object} définissant to_x et to_y
  *
  */
function to_xy_on_fiche(tool, fiche)
{
  if('string' == typeof fiche) obj = get_obj_in_app(obj)
  else if(fiche.class == 'Fiche') obj = fiche.obj
  else obj = $(fiche)
  var dest = offset_tool(obj.position().left, obj.position().top, tool)
  return {to_x:dest.left, to_y:dest.top}
}
// Reçoit les coordonnées left et top de la position à atteindre sur la
// table (par exemple la position d'une fiche) et retourne le {top, left}
// objet à appliquer à l'outil fiche pour se retrouver à cette position.
// Utilisé par exemple pour glisser une fiche sur une autre :
// topleft = offset_tool(fi.obj.position().left, fi.obj.position().top)
// tool_fiche.press_and_drag(to_x:topleft.left, to_y:topleft.top)
// Attention : il faut que la table soit bien alignée en haut, je crois (pas de scroll)
function offset_tool(left, top, tool)
{
  console.log("left:"+left+" top:"+top+" tool:"+tool)
  var ltool = get_obj_in_app("div#card_tool-"+tool).position().left
  return {left:parseInt(left) - ltool + 2, top:parseInt(top) + 44 + 10}
}

/*
 *  Place la fiche +ifiche ({Instance Fiche>Book, etc.}) dans le parent d'identifiant +id_parent+
 *  
 *  NOTES
 *  -----
 *  @ L'enfant est rangé dans le parent
 *
 *  @param  id_parent   Identifiant du parent (créé si nécessaire)
 *  @param  ifiche      Instance Fiche ({Book}, {Page}, etc.) de la fiche enfant.
 *
 */
function put_in_parent(id_parent, ifiche) {
  // Récupérer ou créer la fiche
  var type_parent = APP.FICHES.datatype[ifiche.type].parent_type
  var iparent = APP.FICHES.fiche_from( {id:id_parent, type:type_parent} )
  iparent.add_child( ifiche )
}