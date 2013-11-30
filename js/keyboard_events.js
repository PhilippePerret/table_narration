
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
  // console.log("-> keypress_when_no_selection_no_edition")
  return true
}
/*
 *  Gestion des touches pressées quand une fiche est sélectionnée,
 *  mais que l'on ne se trouve pas dans un champ d'édition.
 *  
 */
window.keypress_when_fiche_selected_out_textfield = function(evt)
{
  // console.log("-> keypress_when_fiche_selected_out_textfield")
  switch(evt.keyCode)
  {
  /*
   *  La touche TAB doit permettre de retourner la fiche
   *  
   */
  case K_TAB:
    FICHES.current.retourne
    return stop_event(evt)
  default:
    // console.log(" fin de keypress fiche")
    return true
  }
}
/*
 *  Gestion des touches clavier quand on se trouve dans un champ
 *  d'édition de la fiche.
 *  
 */
window.keypress_when_fiche_selected_in_textfield = function(evt){
  // console.log("-> keypress_when_fiche_selected_in_textfield")
  switch(evt.keyCode)
  {
  /*
   *  La touche tabulation dans un champ d'édition quelconque doit
   *  simplement faire sortir du champ
   *  Mais pour le moment je n'y arrive pas, donc je bloque simplement
   *  la touche.
   *  
   */
  case K_TAB:
    // console.log("TAB dans champ de texte")
    // console.dir(evt)
    // var ifiche = FICHES.list[evt.target.id.split('-')[1]]
    // if(ifiche)
    // {
    //   ifiche.obj.focus()
    // }
    return stop_event(evt)
  default:
    // console.log("which:"+evt.which+" / keyCode:"+evt.keyCode+" / charCode:"+evt.charCode)
  }
  
  // Pour la suite, un modifier doit obligatoirement être pressé
  if(!(evt.ctrlKey || evt.altKey || evt.metaKey)) return true
  
  if(evt.metaKey)
  {
    switch(evt.which)
    {
    case Key_f: //=> Insérer un film
      console.log("Touche CMD + F pressée dans un champ de texte")
      return stop_event(evt)
    case Key_m: //=> Insérer un mot du scénodico
      console.log("-> Insertion d'un mot du scénodico")
      return stop_event(evt)
    case Key_r: //=> Insérer une référence vers une fiche
      console.log("-> Insertion d'une référence vers une fiche")
      return stop_event(evt)
    default:
      // console.log("which:"+evt.which+" / keyCode:"+evt.keyCode+" / charCode:"+evt.charCode)
      return true
    }
  }
}

/* Méthode par défaut */
window.onkeypress = keypress_when_no_selection_no_edition