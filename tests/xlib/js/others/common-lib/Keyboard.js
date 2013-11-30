/*
 *  Simulation d'évènements clavier
 *  
 */
window.FakedKeyEvent = function(data)
{
	this.class 	= 'FakedKeyEvent'
	this.data 	= data
}
Object.defineProperties(FakedKeyEvent.prototype, {
	// Active l'évènement Keyboard
	"fire":{
		get:function(){this.init.dispatch},
    enumerable:true
	},
	"init":{
		get:function(){
      // -- debug --
      // var data_init = [          
      //     this.type,
      //           this.bubble, this.cancelable,
      //           window, this.detail,
      //           this.xScreen, this.yScreen, this.xClient, this.yClient, /* coordinates */
      //           this.ctrl, this.alt, this.shift, this.meta, /* modifier keys */
      //           this.button, this.related /* related target (when mouseout, mouseover, etc.) */
      //     ]
      // -- /debug --
      this.event.initKeyEvent(
        this.type, this.bubble, 
        this.cancelable, this.view, 
        this.ctrl, this.alt, this.shift, this.meta,
        this.keyCode, this.charCode
                              )
      // this.event.initKeyEvent(
      //     this.type,
      //     this.bubble, this.cancelable,
      //     window, this.detail,
      //     this.xScreen, this.yScreen, this.xClient, this.yClient, /* coordinates */
      //     this.ctrl, this.alt, this.shift, this.meta, /* modifier keys */
      //     this.button, this.related /* related target (when mouseout, mouseover, etc.) */
      // )
			return this
		}
	},
	"dispatch":{
		get:function(){
      // this.domObj.dispatchEvent(this._event)
			this.window.dispatchEvent(this._event)
			return this
		}
	},
	"type":{
		get:function(){return this.data.type}
	},
	"event":{
		get:function(){
			if(undefined == this._event) this._event = Keyboard.create_event()
			return this._event
		}
	},
  "window":{get:function(){return this.data.window}},
  "keyCode":{get:function(){ return this.data.key_code }},
  "charCode":{get:function(){ return this.data.char_code }},
  "view":{get:function(){return null}},
  "ctrl":{get:function(){return this.data.ctrl || false}},
  "alt":{get:function(){return this.data.alt || false}},
  "shift":{get:function(){return this.data.shift || false}},
  "meta":{get:function(){return this.data.meta || false}},
  "button":{get:function(){return this.data.button || Mouse.LEFT_BUTTON}},
  "related":{get:function(){return this.data.related || null}},
  "cancelable":{get:function(){return this.data.cancelable || false}},
  "detail":{get:function(){return this.data.detail || 1}},
  "bubble":{get:function(){
    if(undefined == this.data.bubble) return true
    else return this.data.bubble
  }}
})


window.Keyboard = {
	event:null,			// L'évènement Key courant
  
  /*
   *  Méthodes Utilisateurs
   *  
   */
  /* Pour simuler la pression d'une touche (keypress) 
  
    @param  data    Si ce n'est pas le charCode seul, contient les données, notamment :
                    window        La fenêtre dans laquelle il faut trigger l'évènement
                                  Par défaut, si APP est définie, c'est APP
                    type          Le type d'évènement (keypress, keydown, keyup)
                    key_code      Le keyCode de la touche
                    char_code     Le charCode de la touche
                    ctrl          TRUE si la touche CTRL est pressée
                    alt, shift, meta    Idem pour les autres modifiers
  */
  press:function(data)
  {
    data = this.prepare_data( data )
    this.fireFakedEvent($.extend(data, {type:'keypress'}))
  },
  /* Gènère un keydown */
  down:function(data)
  {
    data = this.prepare_data( data )
    this.fireFakedEvent($.extend(data, {type:'keydown'}))
  },
  /* Gènère un keyup */
  up:function(data)
  {
    data = this.prepare_data( data )
    this.fireFakedEvent($.extend(data, {type:'keyup'}))
  },
  
  prepare_data:function(data)
  {
    if('object'!=typeof data) data = {char_code:data}
    if(undefined == data.window)
    {
      if("undefined" != typeof APP) data.window = APP
      else data.window = window
    }
    return data
  },
  
  /*
   *  Méthodes interne
   *  
   */
	fireFakedEvent:function(data_add){
		this.fakedEvent(data_add).fire
	},
  fakedEvent:function(data_add){
		var data = {
			type:(data_add.type || 'keypress'), domObj:null, x:0, y:0,
			ctrl:false, alt:false, shift:false, meta:false
		}
		if(undefined != data_add) $.extend(data, data_add)
		return new FakedKeyEvent(data)
  },
  
  // Création de l'évènement document
  create_event:function(){
	  var ev = document.createEvent("KeyboardEvent");
		if(document.createEvent) 	return document.createEvent('KeyboardEvent')
		else 											return document.createEventObject()
	},
  
  
}