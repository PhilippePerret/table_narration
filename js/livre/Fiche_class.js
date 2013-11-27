/*
 *  Class Fiche
 *  -----------
 *
 *  Toutes les instances Book, Page, Chapter et Paragraph héritent d'elle
 *
 *
 *  RAPPELS
 *  -------
 *
 *  * C'est en ajoutant un enfant à une fiche qu'on détermine les propriétés
 *    `parent' et `enfants' des deux fiches concernant.
 *    cf. la méthode "add_enfant".
 *
 */

// Classe Fiche
window.Fiche = function(data)
{
  this.class      = "Fiche"
  this.id         = null
  this.created_at = null
  this.type       = null      // le type, entre 'book', 'page', 'chap', 'para'
  
  this.dispatch(data)
  
  // Nouvelle fiche ?
  if(this.id == null) 
  {
    this.created_at = Time.now()
    this.id = ++ FICHES.last_id
  }
}

Object.defineProperties(Fiche.prototype, {
  
  "type":{
    get:function(){ return this._type || null},
    set:function(ty){ this._type = ty }
  },
  
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
  }
  
})

