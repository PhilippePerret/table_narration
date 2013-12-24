/**
 *  @module UI
 */

/**
  *  Gestion de l'interface utilisateur
  *
  *  @class UI
  *  @static
  * 
  */
if('undefined' == typeof UI) UI = {}
$.extend(UI, {
  
  /**
    * data-type pour un champ qui ne peut rester vide
    *
    * @property   {String} FIELD_NOT_EMPTY
    * @static
    * @final
    */
  FIELD_NOT_EMPTY: 'not_empty',

  /**
    * data-type pour un champ de type 'horloge'. La valeur de ce champ
    * sera automatiquement transformée en horloge valide, ou une erreur sera
    * produite si la valeur donnée est incompatible avec une horloge.
    *
    * @property   {String} FIELD_HORLOGE
    * @static
    * @final
    */
  FIELD_HORLOGE: 'horloge',

  /**
   *  data-type pour un champ de type nombre.
   *
   *  @property   {String} FIELD_NUMBER
   *  @static
   *  @final
   */
  FIELD_NUMBER:'number',

  /**
   *  data-type pour un champ de type pays (sur deux lettres minuscules).
   *
   *  @property   {String} FIELD_PAYS
   *  @static
   *  @final
   */
  FIELD_PAYS:'pays',
  
  /**
   *  data-type pour un champ de type « people », c'est-à-dire une liste de personnes.
   *  
   *  NOTES
   *  -----
   *    * Le `data-format' du champ doit définir s'il s'agit d'un auteur, d'un
   *      réalisateur, d'un acteur, etc.
   *
   *  @property   {String} FIELD_PEOPLE
   *  @static
   *  @final
   */
  FIELD_PEOPLE:'people',
  
  /**
    * LARGEUR d'un carreau de la grille snap
    * Notes : Correspond à la largeur d'un livre fermé
    * @property {Number} GRID_X
    * @static
    * @final
    */
  GRID_X    : 250,
  /**
    * HAUTEUR d'un carreau de la grille snap
    * Notes : Correspond à la hauteur d'un livre fermé
    * @property {Number} GRID_Y
    * @static
    * @final
    */
  GRID_Y    : 40,
  
  prepared  :false,     // Mis à true quand l'UI est prête
  preparing :false,     // True pendant la préparation de l'interface
  
  
  /**
    * Substitut à la méthode `confirm` affreuse de Firefox
    *
    * Notes
    * -----
    *   * Si aucune méthode de renoncement n'est défini (3e paramètres) et que
    *     l'utilisateur renonce, ça interrompt simplement le processus courant.
    *
    * @method confirm
    * @async
    * @param  {String}    message       Le message de confirmation.
    * @param  {Function}  suivreOk      La méthode qui sera appelée pour suivre si OK
    * @param  {Function}  suivreCancel  (if any) la méthode poursuivre si renoncement.
    * @param  {Object}    options       Optionnellement on peut définir d'autres valeurs :
    *                                   cancel_name : Nom à donner au bouton Cancel
    *                                   ok_name     : Nom à donner au bouton OK (confirmation)
    *                                   id          : Identifiant à donner à la boite
    */
  confirm:function(message, suivreOk, suivreCancel, options)
  {
    if(undefined == options) options = {}
    Edit.show({
      id      : options.id || 'confirm_'+Time.now(),
      title   : message,
      buttons : {
        cancel :{name:(options.cancel_name || "Renoncer"), onclick:suivreCancel},
        ok     :{name:(options.ok_name || "OK"), onclick:suivreOk}
      }
    })
  },
  
  /**
    * Aligne les livres sur la grille
    *
    * Notes
    *   * Pour le moment, la méthode n'est appelée que lorsque la case "Livres rangés"
    *     est cochée (le moment où on le fait) dans les préférences.
    *   * C'est la position vertical qui l'emporte. Ensuite, si deux livres sont à
    *     la même hauteur, c'est la position vertical qui détermine la précédence.
    *   * Cela classe aussi les livres dans Collection.books, pour qu'ils soient
    *     sélectionnés dans le bon ordre par les flèches
    *
    * @method align_books
    * @param  {String} dir  Orientation de l'alignement, h:horizontal, v:vertical
    *
    */
  align_books:function(dir)
  {
    if (App.preferences.gridbook == false) return
    
    Collection.sort_book_from_table

    // On les positionne sur la table
    // Rappel : le simple fait de changer left/top appelle le positionnement
    // de la fiche
    var current_x = 0
    var current_y = 0
    var inc_x = App.preferences['dirgridbook'] == 'h' ? this.GRID_X : 0
    var inc_y = App.preferences['dirgridbook'] == 'v' ? this.GRID_Y : 0
    L(Collection.books).each(function(book){
      book.modified = current_x != book.left || current_y != book.top
      book.left = current_x
      book.top  = current_y
      current_x += inc_x
      current_y += inc_y
    })
  },
  
  /**
    * Peuple le menu des collections permettant de les choisir
    *
    * Notes
    * -----
    *   * La méthode sélectionne aussi la collection courante, donc elle doit
    *     être appelée après la définition de Collection.name
    *   * Puisque la méthode ne vide pas le select, elle peut être appelée
    *     pour ajouter une collection à la volée, si cette fonctionnalité existe
    *     à l'avenir.
    *
    * @method peuple_menu_collections
    * @param  {Array} collections   Liste des noms de collections.
    *
    */
  peuple_menu_collections:function(collections)
  {
    var menu = $('select#collections')
    L(collections).each(function(name){
      menu.append('<option name="'+name+'">'+name+'</option>')
    })
    menu.val(Collection.name)
  },
  /**
    * Retourne la position +pos+ sur la grille ou val est [x, y]
    * 
    * @method position_on_grid
    *
    * @param  {Array}   pos       Couple [x, y]
    * @param  {Boolean} snaping   Ne snap la position que si true
    * @return {Object} {left, top}
    *
    */
  position_on_grid:function(pos, snaping){
    if(!snaping) return {left:pos[0], top:pos[1]} ;
    return {
      left: this.position_xy_on_grid(pos[0], this.GRID_X),
      top : this.position_xy_on_grid(pos[1], this.GRID_Y)
    }
  },
  position_xy_on_grid:function(pos, snap)
  {
    prev = pos - pos % snap
    next = snap + prev
    if( Math.abs(pos - prev) > Math.abs(pos - next)) return next
    else return prev
  },
  
  /*
   *  Méthode appelée quand on droppe un outil fiche (card-tool)
   *  sur la table
   *
   *  Cela provoque la création d'une nouvelle fiche SUR LA TABLE.
   *
   *  NOTES
   *  -----
   *    # Si l'outil est déplacé sur une autre fiche qui peut être parent,
   *      cette méthode est court-circuitée en mettant drop_on_fiche à true
   *      cf. Fiche.prototype.on_drop
   *
   *    # Noter qu'il s'agit d'un déplacement sur un coin vide de la table, pas
   *      sur une autre fiche.
   *
   *    # Cette méthode étant appelée avant le drop sur un élément
   *      on la retarde à peine.
   *
   *  PARAMS
   *  ------ 
   *  @param  evt   L'évènement Drop généré (permet de connaitre la position)
   *  @param  ui    Objet ui (ui.helper => card-tool jQuery) 
   *
   */
  rappelle_ondrop_on_table:function(evt, ui){
    this.ondrop_on_table(evt, ui)
  },
  /**
    * Méthode appelée lorsque l'on glisse un outil sur la table (principalement
    * pour créer une nouvelle fiche).
    * 
    * Notes
    * -----
    *   * Les deux utilisations principales sont :
    *     * La création d'une nouvelle fiche (à l'aide d'un outil-fiche)
    *     * La sortie d'une fiche d'un de ses parents.
    *
    * @method ondrop_on_table
    * @param  {Event}   evt   Drop event
    * @param  {Object}  ui    Set jQuery transmis par droppable.
    */
  ondrop_on_table:function(evt, ui)
  {
    var idm = "UI.ondrop_on_table"
    dlog("---> "+idm, DB_FCT_ENTER )
    var ctool = ui.helper
    
    // Déterminer la position approximative du drop sur la table
    var pos_table = $('section#table').position()
    var x = evt.clientX //- pos_table.left  // | Pas tout à fait exact mais
    var y = evt.clientY //- pos_table.top   // | ça n'importe pas trop
    
    // On crée la fiche
    var ifiche = FICHES.full_create({
      type  : ctool.attr('data-type'),
      left  : x,
      top   : y
    })
    ifiche.positionne
    if(ifiche.is_not_paragraph) ifiche.open
    ifiche.modified = true
    dlog("<- UI.ondrop_on_table", DB_FCT_ENTER)
  }
  
})

Object.defineProperties(UI,{
 
  /*
   *  Préparation de l'interface
   *  --------------------------
   *  Et principalement le placement des observers
   *
   */
  "prepare":{
    get:function(){
      this.preparing = true
      // La table doit accepter les drops des "card tool" (tous les types)
      $('section#table').droppable({
        accept  : '.card_tool',
        drop    : $.proxy(this.ondrop_on_table, this)
      })
    
      // Prépation des "card-tools"
      CardTools.prepare
 
 
      this.preparing  = false
      this.prepared   = true
    }
  }
})
