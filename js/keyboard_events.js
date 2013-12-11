
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
  
  switch(evt.keyCode)
  {
  /* La touche TAB doit permettre de retourner la fiche */
  case K_TAB:
    FICHES.current.retourne
    return stop_event(evt)
  /* La touche ERASE doit permettre de supprimer la fiche */
  case K_ERASE:
    FICHES.current.want_delete
    return stop_event(evt)
  default:
    // console.log("which:"+evt.which+" / keyCode:"+evt.keyCode+" / charCode:"+evt.charCode)
    // return true // Non, on doit poursuivre
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
/*
 *  Gestion des touches clavier quand on se trouve dans un champ
 *  d'édition de la fiche.
 *  
 */
window.keypress_when_fiche_selected_in_textfield = function(evt){

  // var idm = "keypress_when_fiche_selected_in_textfield"
  // dlog("---> "+idm, DB_FCT_ENTER)

  switch(evt.keyCode)
  {
  /*
   *  La touche RETURN enregistre le nouveau texte (input-text) ou
   *  passe normalement à la ligne (paragraphe - TODO: voir s'il n'est pas préférable
   *  de créer tout de suite un nouveau paragraphe)
   *  
   */
  case K_RETURN:
    // console.log("---> touche retour sur champ d'édition")
    var ifiche = FICHES.current
    var ifield = FICHES.current_text_field
    var field_prop = ifield.attr('id').split('-')[2]
    // console.log("field_prop = "+field_prop)
    
    if(evt.metaKey && ifiche.is_paragraph && field_prop == 'texte')
    {
      // TODO: Créer un paragraphe à la suite de ifield
    }
    else
    {
      // Enregistrer le changement de texte, if any
      // @note: Inutile d'appeler "onchange_titre" puisqu'il sera appelé
      // par le blur() ci-dessous. De même que pour les autres champs,
      // certainement.
      // ifiche['onchange_'+field_prop]()
      ifield.blur()
    }
    return stop_event(evt)
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
    // case Key_b: // => mettre en GRAS
    //   FICHES.set_selection_to("<strong>_$_</strong>")
    //   return stop_event(evt)
    // case Key_d: // => mettre en BARRÉ (del) ou INSÉRÉ
    //   var del = evt.shiftKey ? 'ins' : 'del'
    //   FICHES.set_selection_to("<"+del+">_$_</"+del+">")
    //   return stop_event(evt)
    // case Key_i: // => mettre en ITALIC
    //   FICHES.set_selection_to("<i>_$_</i>")
    //   return stop_event(evt)
    // case Key_f: //=> Insérer un film
    //   FILMS.choose_a_film($.proxy(FILMS.insert_in_input, FILMS))
    //   return stop_event(evt)
    // case Key_m: //=> Insérer un mot du scénodico
    //   console.log("---> Insertion d'un mot du scénodico")
    //   return stop_event(evt)
    // case Key_r: //=> Insérer une référence vers une fiche
    //   console.log("---> Insertion d'une référence vers une fiche")
    //   return stop_event(evt)
    // case Key_u: // => mettre en SOULIGNÉ
    //   FICHES.set_selection_to("<u>_$_</u>")
    //   return stop_event(evt)
    default:
      // console.log("which:"+evt.which+" / keyCode:"+evt.keyCode+" / charCode:"+evt.charCode)
      return true
    }
  }
  // dlog("<- "+idm, DB_FCT_ENTER)
}

/* Méthode par défaut */
window.onkeypress = keypress_when_no_selection_no_edition