
window.dispay_code_event = function(evt)
{
  console.dir({charCode:evt.charCode, keyCode:evt.keyCode, which:evt.which})
  return true
}
/*
 *  Gestion des touches pressées quand aucune fiche n'est sélectionnée
 *  
 *  NOTES
 *  -----
 *  * C'est la méthode par défaut
 *
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
  return true
}
/*
 *  Gestion des touches pressées quand une fiche est sélectionnée,
 *  mais que l'on ne se trouve pas dans un champ d'édition.
 *  
 */
window.keypress_when_fiche_selected_out_textfield = function(evt)
{
  // var idm = "keypress_when_fiche_selected_out_textfield"
  // dlog("---> "+idm, DB_FCT_ENTER)
  
  if(FICHES.current)
  {
    var complex_method = null
    switch(evt.keyCode)
    {
    /* TAB => retourner la fiche */
    case K_TAB:     complex_method = 'retourne'; break
    
    /* ENTER => édite main field */
    case K_RETURN:  complex_method = 'enable_main_field'; break
    
    /*
     *  ->    Sélectionner le premier enfant (if any)
     *  <-    Sélectionner le parent (if any)
     *  up    Sibling précédent (if any)
     *  down  Sibling suivant (if any)
     */
    case K_LEFT_ARROW:  complex_method = 'select_parent';       break
    case K_RIGHT_ARROW: complex_method = 'select_first_child';  break
    case K_UP_ARROW:    complex_method = 'select_previous';     break
    case K_DOWN_ARROW:  complex_method = 'select_next';         break
      
    /* ERASE => supprimer la fiche */
    case K_ERASE: complex_method = 'want_delete'; break
    default:
      // console.log("which:"+evt.which+" / keyCode:"+evt.keyCode+" / charCode:"+evt.charCode)
      // return true // Non, on doit poursuivre
    }
    if(complex_method) 
    {
      FICHES.current[complex_method]
      return stop_event(evt)
    }
  }
  
  switch(evt.charCode)
  {
  /* La touche SPACE toggle l'ouverture/fermeture de la fiche */
  case K_SPACE:
    FICHES.current.toggle
    return stop_event(evt)
  case Key_o:
    FICHES.current.open
    return stop_event(evt)
  case Key_f:
    FICHES.current.close
    return stop_event(evt)
  case Key_d:
    FICHES.current.deselect
    return stop_event(evt)
  default:
    console.log("which:"+evt.which+" / keyCode:"+evt.keyCode+" / charCode:"+evt.charCode)
    // return stop_event(evt)
  }
  // dlog("<- "+idm, DB_FCT_ENTER)
}

/* Méthode par défaut */
window.onkeypress = keypress_when_no_selection_no_edition