/**
  * @module KeyboardEvents
  * @class window
  */

/**
  * Méthode de débuggage pour afficher les données simples de l'évènement
  *
  * @method dispay_code_event
  * @param  {Event} Evènement déclenché
  * @return TRUE
  */
window.dispay_code_event = function(evt)
{
  console.dir({charCode:evt.charCode, keyCode:evt.keyCode, which:evt.which})
  return true
}
/**
  * Gestion des touches pressées quand aucune fiche n'est sélectionnée
  * 
  * Notes
  * -----
  *   * C'est la méthode par défaut
  *
  * @method keypress_when_no_selection_no_edition
  * @param  {KeypressEvent} Evènement touche-pressée déclenché.
  * @return {Boolean} FALSE si l'évènement doit être stoppé, TRUE dans le cas contraire.
  */
window.keypress_when_no_selection_no_edition = function(evt)
{
  // var idm = "keypress_when_no_selection_no_edition"
  // dlog("---> "+idm, DB_FCT_ENTER)
  
  switch (evt.keyCode) {
  /* 
   * Les 4 flèches permettent de sélectionner un des livres
   * 
   * UP   ou LEFT   => le dernier
   * DOWN ou RIGHT  => le premier
   */
  case K_LEFT_ARROW:
  case K_UP_ARROW:
    var nb_books = Collection.books.length
    if(nb_books) Collection.books[nb_books - 1].select
    return stop_event(evt)
  case K_RIGHT_ARROW:
  case K_DOWN_ARROW:
    if(Collection.books.length) Collection.books[0].select
    return stop_event(evt)    
    
  // La touche effacement arrière ne doit rien faire quand rien n'est
  // sélectionné
  case K_ERASE:
    return stop_event(evt)
    break;
  default:
    
  }
  // dlog("<- "+idm, DB_FCT_ENTER)
  /*
   *  Si aucune touche n'a été traitée, on regarde du côté des méthodes par défaut
   *  
   */
  return window.keypress_default(evt)
}
/**
  * Gestion des touches pressées quand une fiche est sélectionnée,
  * mais que l'on ne se trouve pas dans un champ d'édition.
  *
  * @method keypress_when_fiche_selected_out_textfield
  * @param  {KeypressEvent} evt Évènement touche-pressée déclenchée
  * @return {Boolean} True si l'évènement doit se poursuivre, False dans le cas contraire.
  */
window.keypress_when_fiche_selected_out_textfield = function(evt)
{
  var idm = "keypress_when_fiche_selected_out_textfield"
  dlog("---> "+idm, DB_FCT_ENTER | DB_CURRENT)
  
  /*  = WARNING =
   *  S'il n'y a pas de fiche courante, il faut rectifier le gestionnaire
   *  des évènement keypress courant.
   *  Je signale une erreur, car ça ne devrait pas arriver si l'implémentation
   *  est solide et pertinente.
   */
  if(!FICHES.current)
  {
    console.warn("Le gestionnaire de keypress `keypress_when_fiche_selected_out_textfield' a été appelé alors qu'aucune fiche n'est sélectionné…")
    window.onkeypress = keypress_when_no_selection_no_edition
    return keypress_when_no_selection_no_edition(evt)
  }
  /*  = WARNING =
   *  S'il y a un champ en édition, on ne doit pas passer par ici
   *  
   */
  if(UI.Input.target)
  {
    F.error("Mauvais gestionnaire d'évènement (on se trouve dans un champ d'édition)"+
    "\nPour le moment, je ne fais rien (appeler le gestionnaire UI.Input génèrerait "+
    "une erreur)")
    return stop_event(evt)
    // return UI.Input.onkeypress(evt)
  }
  
  var cplx_meth = null
  switch(evt.keyCode)
  {
  /* TAB => retourner la fiche */
  case K_TAB:     cplx_meth = 'retourne'; break
  
  /* ENTER => édite main field */
  case K_RETURN:  cplx_meth = 'enable_main_field'; break
  
  /*
   *  ->    Sélectionner le premier enfant (if any)
   *  <-    Sélectionner le parent (if any)
   *  up    Sibling précédent (if any)
   *  down  Sibling suivant (if any)
   */
  case K_LEFT_ARROW:  cplx_meth = 'select_parent';       break
  case K_RIGHT_ARROW: cplx_meth = 'select_first_child';  break
  case K_UP_ARROW:    cplx_meth = evt.metaKey ? 'move_up'    : 'select_previous'; break
  case K_DOWN_ARROW:  cplx_meth = evt.metaKey ? 'move_down'  : 'select_next';     break
    
  /* ERASE => supprimer la fiche */
  case K_ERASE: cplx_meth = 'want_delete'; break
  default:
    // console.log("which:"+evt.which+" / keyCode:"+evt.keyCode+" / charCode:"+evt.charCode)
    // return true // Non, on doit poursuivre
  }
  if(cplx_meth) 
  {
    FICHES.current[cplx_meth]
    return stop_event(evt)
  }
  
  cplx_meth = null
  switch(evt.charCode)
  {
  case K_SPACE: cplx_meth = 'toggle'   ; break
  case Key_c:   cplx_meth = 'copy'     ; break
  case Key_o:   cplx_meth = 'open'     ; break
  case Key_f:   cplx_meth = 'close'    ; break
  case Key_d:   cplx_meth = 'deselect' ; break
  case Key_l:
    if(FICHES.current.is_book && evt.metaKey) // => Lecture du livre
    {
      Book.read(FICHES.current, {page:1})
    }
    break
  case Key_p:
    if(evt.metaKey)
    {
      var cur = FICHES.current, options = {}
      Flash.clean()
      if(cur.is_book)
      {
        if(evt.ctrlKey) options.only_tdm = true
        cur.publish(options)
      }
      // Dans tous les cas, on bloque l'event
      return stop_event(evt)
    } 
    break
  case Key_r:
    if(!evt.metaKey){cplx_meth = 'copy_reference'}
    break
  case Key_v:   cplx_meth = 'paste'   ; break
  case Key_x:   cplx_meth = 'cut'     ; break
  }
  if(cplx_meth)
  {
    FICHES.current[cplx_meth]
    return stop_event(evt)
  }
  
  /*
   *  Si aucune touche n'a été traitée, on regarde du côté des méthodes par défaut
   *  
   */
  return window.keypress_default(evt)
  
  // dlog("<- "+idm, DB_FCT_ENTER)
}

/**
  * Méthode de gestion des évènements Keypress lorsqu'ils n'ont pas été traités
  * par une méthode propre. C'est en quelque sorte les traitements par défaut.
  * Par exemple, quel que soit le contexte, le raccourci CMD+S sauvera toujours la
  * collection.
  *
  * @method keypress_default
  * @param  {KeypressEvent} evt Evènement Keypress déclenché
  * @return {Boolean} False si l'évènement a été traité (a déclenché une action),
  *                   True dans le cas contraire.
  */
window.keypress_default = function(evt)
{
  if(!(evt.ctrlKey||evt.metaKey||evt.altKey))return true
  
  switch(evt.charCode)
  {
  case Key_s:
    if(evt.metaKey)
    {
      Collection.save()
      return stop_event(evt)
    }
    break
  case Key_p:
    // Ne jamais imprimer
    return stop_event(evt)
  }
  return true
}


/* Application de la méthode par défaut */
window.onkeypress = keypress_when_no_selection_no_edition