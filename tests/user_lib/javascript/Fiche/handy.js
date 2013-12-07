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