/*
 *  Objet CardTools -- Classe CardTool
 *  ----------------------------------
 *  Pour la gestion des outils-fiche permettant de créer et gérer les fiches
 *  
 */
window.CardTools = {
  /*
   *  jQuery Selector pour toucher tous les outils-fiche
   *  
   */
  jids: 'section#header > div#header_card_tools > div.card_tool',
  /*
   *  Les outils
   *  ----------
   *  Clé     : Identifiant de l'outil (p.e. 'book' ou 'para')
   *  Valeur  : Instance CardTool
   *  
   */
  tools:{},

}
Object.defineProperties(CardTools,{
  "prepare":{
    get:function()
    {
      $(this.jids).each(function(i, obj){
        // On crée l'instance de l'objet (et on la prépare)
        var itool = new CardTool({dom_id:$(this).attr('id')})
        CardTools.tools[itool.id] = itool
      })      
    }
  }
  
  
})
/* ---------------------------------------------------------------------
 *
 *  Classe CardTool
 *  
 */
window.CardTool = function(data)
{
  this.dom_id = data.dom_id
  this.id     = data.dom_id.split('-')[1] // p.e. 'book' ou 'para'
  this.obj    = $('div#'+data.dom_id) 
  this.place_observers
}
/*
 *  Reçoit le mousedown sur l'outil
 *  
 */
CardTool.prototype.on_mousedown = function(evt)
{
  console.log("Mouse DOWN de outil #"+this.id)

  // this.set_draggable
}
/*
 *  Reçoit l'évènement dragstop
 *  
 */
CardTool.prototype.on_stopdrag = function(evt)
{
  console.log("Stop-drag de l'outil #"+this.id)
}
/*
 *  Reçoit le mouseup sur l'outil (inusité pour le moment)
 *  
 */
CardTool.prototype.on_mouseup = function(evt)
{
  console.log("Mouse UP de outil #"+this.id)
  // this.unset_draggable

}
/*
 *  Reçoit le double click sur l'outil
 *  
 */
CardTool.prototype.on_dblclick = function(evt)
{
  console.log("Double-click sur outil #"+this.id)
  return stop_event(evt)
}
Object.defineProperties(CardTool.prototype,{
  /*
   *  On place les observers d'évènement à l'instanciation
   *  de l'outil.
   *  
   */
  "place_observers":{
    get:function(){
      this.rend_draggable
      this.obj.bind('mousedown',  $.proxy(this.on_mousedown, this))
      this.obj.bind('dblclick',   $.proxy(this.on_dblclick, this))
    }
  },
  /*
   *  Draggabilité de l'outil
   *  
   */
  "rend_draggable":{
    get:function(){
      this.obj.draggable({
        cursor    : 'move',
        zIndex    : 1000,
        helper    : "clone",
        stop      : $.proxy(this.on_stopdrag, this)
      })
    }
  },
  "set_draggable":{
    get:function(){
      this.obj.draggable({disabled:false})
    }
  },
  "unset_draggable":{
    get:function(){
      this.obj.draggable({disabled:true})
    }
  }
})