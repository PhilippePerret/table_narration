/*
 *  Object UI
 *  ---------
 *  Gestion de l'interface utilisateur
 *
 *  
 */
if('undefined' == typeof UI) UI = {}
$.extend(UI, {
  
  GRID_X    : 80,       // Snap horizontal
  GRID_Y    : 40,       // Snap vertical
  
  prepared  :false,     // Mis à true quand l'UI est prête
  preparing :false,     // True pendant la préparation de l'interface
  
  /*
   *  Retourne la position +pos+ sur la grille ou val est [x, y]
   *  @return {left: <position horizontal>, top:<position verticale>}
   *  
   *  @param  pos       Couple [x, y]
   *  @param  snaping   Ne snap la position que si true
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
  ondrop_on_table:function(evt, ui)
  {
    if(undefined == this.timer_ondrop)
    {
      return this.timer_ondrop = setTimeout($.proxy(UI.rappelle_ondrop_on_table, UI, evt, ui), 4*100)
    }
    delete this.timer_ondrop
    var idm = "UI.ondrop_on_table"
    dlog("---> "+idm, DB_FCT_ENTER )
    if(this.drop_on_fiche)
    {
      delete this.drop_on_fiche
      return
    }
    var ctool = ui.helper
    dlog("---> UI.ondrop_on_table (ctool "+ctool.attr('data-type')+")", DB_FCT_ENTER)
    
    // Déterminer la position approximative du drop sur la table
    var pos_table = $('section#table').position()
    var x = evt.clientX - pos_table.left  // | Pas tout à fait exact mais
    var y = evt.clientY - pos_table.top   // | ça n'importe pas trop
    
    // On crée la fiche
    var ifiche = FICHES.full_create({
      type  : ctool.attr('data-type'),
      left  : x,
      top   : y
    })
    ifiche.positionne
    ifiche.open
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
