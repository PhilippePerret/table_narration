/**
  * @module window
  */

/**
  * @class window
  * @static
  */

/* 
  * CONSTANTES
  * ----------
  */

/**
  * Indicateur du mode test.
  *
  * Notes
  * -----
  *   * En réalité, c'est une pseudo constante puisqu'elle est défini au chargement
  *     de la collection, si la collection courante (Collection.name) est "test"
  *
  * @property MODE_TEST
  * @static
  */
window.MODE_TEST = false


/**
  * Indique que l'application est prête (collection chargée et interface prêt)
  *
  * @property {Boolean} ready
  * @default  false
  */
ready:false,

/*
 *  Méthodes pratiques
 *  ------------------
 *
 *    stop_save
 *    restart_save
 *
 *    {Film}    get_film(<id film>)
 *    {Mot}     get_mot(<id mot>)
 *    (void)    help(<message pour footer help>)
 *    {String}  image(<path in ../lib/img/>)
 *  
 */

Object.defineProperties(window,{
  /**
    * Interrompt la sauvegarde provisoirement si elle est en automatique
    *
    * Notes
    * -----
    *   * La relancer avec `restart_save`
    *
    * @method stop_save
    */
  "stop_save":{
    get:function(){
      if(Collection.AUTOMATIC_SAVING)
      {
        Collection.disable_save
      }
    }
  },
  /**
    * Relance la sauvegarde automatique interrompue par `stop_save`
    *
    * Notes
    * -----
    *   * Seulement si la sauvegarde automatique étant en cours
    *
    * @method restart_save
    */
  "restart_save":{
    get:function(){
      if(Collection.AUTOMATIC_SAVING)
      {
        Collection.enable_save
      }
    }
  }
  
})
/**
  * Retourne l'instance {Mot} du mot d'identifiant +mid+
  * en la créant si nécessaire
  *
  * NOTES
  * -----
  *   * C'est un raccourci de la méthode DICO.get
  *
  * @method get_mot
  * @param  {String} mid  Identifiant du mot
  * @return {Mot} Instance du mot voulu, ou null si mot introuvable
  */
window.get_mot = function(mid)
{
  return DICO.get(mid)
}
/**
  * Retourne l'instance {Film} du film d'identifiant +fid+
  * en la créant si nécessaire.
  *
  * NOTES
  * -----
  *   * Cette méthode est un raccourci de `FILMS.get(id)'
  * 
  * @method get_film
  * @param  {String} fid  Identifiant du film
  * @return {Film} L'instance du film ou null s'il n'existe pas.
  *
  */
window.get_film = function(fid)
{
  return FILMS.get(fid)
}

/**
  * Retourne l'instance {Ref} de la référence d'identifiant +rid+
  * en la créant si nécessaire.
  *
  * NOTES
  * -----
  *   * Cette méthode est un raccourci de `REFS.get(rid)'
  * 
  * @method get_ref
  * @param  {String}  rid Identifiant de la référence.
  * @return {Ref}     L'instance Ref de la référence.
  */
window.get_ref = function(rid)
{
  return REFS.get(rid)
}

/*
 *  Affiche un message d'aide (par exemple les raccourcis clavier)
 *  dans la barre inférieure.
 */
window.help = function(message)
{
  $('div#div_help').html( message )
}

/**
  * Retourne le code HTML pour afficher l'image de path +path+
  *
  * Notes
  * -----
  *   * Pour le moment, l'image doit se trouver dans le dossier lib/img
  * 
  * @method image
  * @param  {String} path
  * @param  [attrs=null] {Object} Attributs à ajouter à la balise
  * @return {String} Code HTML de la balise image à insérer.
  * @example
  *     imgHtml = image('clavier/K_Tab.png', {id:"touche_tab", class:'rleft'})
  *     # Produira le code :
  *     <img src="../lib/img/clavier/K_Tab.png" id="touche_tab" class="rleft" />
  *
  */
window.image = function(path, attrs)
{
  var real_path = '../lib/img/' + path
  var tag = '<img src="'+real_path+'"'
  if(undefined != attrs)
  {
    arr_attrs = []
    for(var attr in attrs)
    {
      if(false == attrs.hasOwnProperty(attr)) continue;
      arr_attrs.push(attr + '="' + attrs[attr] + '"')
    }
    if(arr_attrs.length) tag += ' ' + arr_attrs.join(' ')
  }
  tag += ' />'
  return tag
}