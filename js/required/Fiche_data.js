$.extend(Fiche.prototype,{
  /*
   *  Place la fiche courante APRÈS la fiche +bfiche+ {Fiche}
   *  
   *  NOTES
   *  -----
   *    = Si la fiche n'appartient pas au parent, elle est ajoutée
   *
   */
  set_after:function(bfiche)
  {
    // Ajouter au parent si nécessaire
    if(this.parent != bfiche.parent)
    {
      if(this.parent) this.parent.remove_child( this )
      bfiche.parent.add_child( this, {after: bfiche} )
    } 
    else
    {
      // Quand la fiche est déjà dans le parent
      this.parent.move_child( this, bfiche.indice + 1)
    }
    this.modified = true 
  },
  
  /*
   *  Déplace un enfant
   * 
   *  @param  child       {Fiche} enfant à déplacer
   *  @param  new_indice  {Number} Nouvelle position (0-start)
   */
  move_child:function(child, new_indice)
  {
    var cur_indice = child.indice

    // Dans le DOM
    child.obj.insertBefore(this.enfants[new_indice].obj)
    
    // Comme on va d'abord retirer l'élément de son ancienne place puis
    // l'insérer à sa nouvelle place, si l'ancienne indice est avant, il
    // faut retirer une place au nouvel indice
    if(cur_indice < new_indice) new_indice = new_indice - 1
    this.enfants.splice(cur_indice, 1)
    this.enfants.splice(new_indice, 0, child)
    this.update_indice_enfants(from = Math.min(new_indice, cur_indice))
  },
  /*
   *  Place la fiche courante AVANT la fiche +bfiche+ {Fiche}
   *
   *  NOTES
   *  -----
   *    Cf. les notes de `set_after' ci-dessus  
   */
  set_before:function(afiche)
  {
    
    // Modifier dans le parent
    // Modifier dans le DOM (div_items du parent)
    this.modified = true 
  }
})

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
  
  "type":{
    get:function(){ return this._type || null},
    set:function(ty){ this._type = ty }
  },
  /* Méthode pratique retournant <type>#<id> (p.e. 'book#12') */
  "type_id":{
    get:function(){ return this.type + '#' + this.id}
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
      if(this.is_paragraph) return this.texte || ""
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
      if('string' == typeof val) this.style = val.split('.')
      break
    default:
      this.loaded = true
    }
    // On met la donnée dans la propriété
    this[prop] = val
  }
  dlog("<- Fiche::dispatch", DB_FCT_ENTER)
}
