/*
 *  Object UI
 *  ---------
 *  Gestion de l'interface utilisateur
 *
 *  
 */
window.UI = {
  prepared  :false,     // Mis à true quand l'UI est prête
  preparing :false,     // True pendant la préparation de l'interface
  
  /*
   *  Méthode appelée quand on droppe un outil fiche (card-tool)
   *  sur la table
   *
   *  Cela provoque la création d'une nouvelle fiche.
   *
   *  NOTES
   *  -----
   *  * Noter qu'il s'agit d'un déplacement sur un coin vide de la table, pas
   *    sur une autre fiche.
   *
   *
   *  PARAMS
   *  ------ 
   *  @param  evt   L'évènement Drop généré (permet de connaitre la position)
   *  @param  ui    Objet ui (ui.helper => card-tool jQuery) 
   *
   */
  ondrop_on_table:function(evt, ui)
  {
    // -- DÉBUG --
    // console.log("evt:");console.dir(evt)
    // console.log("ui.helper:");console.dir(ui.helper)
    // -- /DÉBUG --
    
    var card_tool = ui.helper
    // Déterminer la position approximative du drop sur la table
    var pos_table = $('section#table').position()
    var x = evt.clientX - pos_table.left  // pas tout à fait exact mais
    var y = evt.clientY - pos_table.top   // n'importe pas trop
    
    // On crée la fiche
    FICHES.full_create({
      type  : card_tool.attr('data-type'),
      left  : x,
      top   : y
    })
  }
  
}

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
    
      // Les "card-tool" doivent être rendus draggable
      $('section#header > div#header_card_tools > div.card_tool').draggable({
        cursor  : 'move',
        zIndex  : 1000,
        revert  : true
      })
 
 
      this.preparing  = false
      this.prepared   = true
    }
  }
})
