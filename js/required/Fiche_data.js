/*
 *  Méthodes Fiche concernant les data de la fiche
 *  
 */
Object.defineProperties(Fiche.prototype,{
  /*
   *  Retourne les données à enregistrer
   *  
   */
  "data":{
    configurable:true,
    get:function(){
      data = {
        id:this.id, type:this.type, titre:this.titre, deleted:this.deleted,
        opened:this.opened, ranged:this.ranged,
        top:this.top, left:this.left
      }
      if(this.parent)  data.parent = {id:this.parent.id, type:this.parent.type}
      if(this.enfants)
      {
        data.enfants = []
        for(var i in this.enfants){ 
          data.enfants.push(this.enfants[i].minidata)
        }
      }
      if(this.is_book) data.real_titre  = this.real_titre
      if(this.is_chapter || this.is_paragraph) data.opened   = false
      if(this.is_paragraph)
      {
        data.texte  = this.texte
        if(this._style) data.style = this._style.join('.')
      } 
      return data
    }
  },
  
  /*
   *  Retourne le {Hash} des données minimum de la fiche (id et type)
   *  
   */
  "minidata":{
    get:function(){return {id:this.id, type:this.type}}
  },

  /* Retourne ou définit le titre */ 
  "titre":{
    get:function(){return this._titre || null },
    set:function(titre){ this._titre = titre}
  },
  
  "updated_at":{
    get:function(){ return this._updated_at },
    set:function(time){this._updated_at = time}
  },
  
  "resume":{
    get:function(){ return this._resume },
    set:function(resume)
    {
      if(resume.trim() == "") resume = null
      this._resume = resume
    }
  },
  
  /*
   *  Définit ou retourne les enfants de la fiche
   *  
   */
  "enfants":{
    get:function(){return this._enfants },
    set:function(children){ this._enfants = children },
  },

  /*
   *  Définit ou retourne le parent de la fiche
   *  
   */
  "parent":{
    get:function(){ return this._parent },
    set:function(pere)
    {
      try
      {
        if(!pere || 'object' != typeof pere) throw 'parent should be an object';
        if(pere.class != "Fiche")   throw 'parent should be a fiche';
        thislevel = FICHES.datatype[this.type].level ;
        perelevel = FICHES.datatype[pere.type].level ;
        if( thislevel >= perelevel ) throw 'parent bad type';
      }
      catch(err)
      { 
        throw LOCALE.fiche.error[err]
      }
      
      this._parent = pere
    }
  },
  
  /*
   *  Définition et retour de la position horizontale (left) de
   *  la fiche sur la table
   */
  "left":{
    get:function(){ return this._left || null },
    set:function(left){
      this._left = parseInt(left, 10)
      if( !this.ranged ) this.positionne
    }
  },
  
  /*
   *  Définition et retour de la position haute (top) de la fiche 
   *  sur la table.
   *  
   */
  "top":{
    get:function(){ return this._top || null },
    set:function(top){
      this._top = parseInt(top, 10)
      if( !this.ranged ) this.positionne
    }
  },
  
  /*
   *  Plus haut ancêtre
   *  
   */
  "ancetre":{
    get:function(){
      var a = this
      while( a.type != 'book')
      {
        a = a.parent
      }
      return a
    }
  },
  /*
   *  Retourne une valeur pour le champ principal (titre ou texte)
   *  
   */
  "main_field_value":{
    get:function(){
      if(this.is_paragraph) return this.texte || "TEXTE_PARAGRAPHE"
      else                  return this.titre || FICHES.datatype[this.type].defvalue
    }
  }
  
  
  
})

Fiche.prototype.dispatch = function(data){
  dlog("---> Fiche::dispatch("+JSON.stringify(data)+")", DB_FCT_ENTER)
  var prop, val ;
  for(prop in data)
  {
    if(false == data.hasOwnProperty(prop)) continue;
    val = data[prop] ;
    // Transformation de la valeur
    switch(val)
    {
    case "false": val = false ; break;
    case "true" : val = true; break;
    case "null" : val = null; break;
    }
    
    // Transformation en fonction de la propriété
    switch(prop)
    {
    case 'opened':
    case 'ranged':
      prop = '_' + prop
      break
    case 'id': 
      val = parseInt(val, 10); 
      break;
    case 'type':
    case 'class':
      // Juste pour ne pas passer par default: qui mettrait
      // loaded à true
      break
    case 'titre':
    case 'real_titre':
    case 'texte':
      val = val.stripSlashes()
      if(prop != 'titre') this.loaded = true
      break;
    case 'parent':
      val = FICHES.fiche( val );
      this.loaded = true
      break;
    case 'enfants':
      if(val!=null && val.length > 0){
        val = FICHES.fiche( val )
      }
      this.loaded = true
      break;
    case 'style':
      this.style  = val.split('.')
      break
    default:
      this.loaded = true
    }
    // On met la donnée dans la propriété
    this[prop] = val
  }
  dlog("<- Fiche::dispatch", DB_FCT_ENTER)
}
