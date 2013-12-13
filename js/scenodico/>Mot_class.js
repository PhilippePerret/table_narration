/*
 *  Class Mot
 *  ---------
 *
 *  NOTES
 *  -----
 *    = La toute première définition se trouve dans le dossier required.
 *  
 */

// On l'étend avec les méthodes et propriétés partagées
$.extend(Mot.prototype, ObjectClass.prototype)


$.extend(Mot.prototype,{
  /*
   *  Construit et retourne la balise à insérer dans une fiche
   *  avec les options +options+
   *
   *  @param  options   {Hash} des options.
   *                    Ces options sont celles disponibles dans DICO.OPTIONS et
   *                    sont insérées si elles existent en 3e paramètre de la
   *                    balise. Elles permettront de composer le mot affiché
   *  
   */
  balise:function(options)
  {
    if(undefined == options) options = {}
    var bal = "[mot:"+this.id+"|"
    bal += this.mot
    bal += "]"
    return bal
  },
  
  /*
   *  Formate la balise mot (cf. `balise' ci-dessus) en respectant
   *  les options +options+
   *  
   *  @param  opts          {Array} Les options d'affichage du mot.
   *                        Cf. ci-dessus
   */
  formate:function(opts)
  {
    var t =
    // Approximatif pour le moment
    t = '<a onclick="DICO.show(\''+this.id+'\')">'+this.mot+'</a>'
    return t
  }
  
})

/*
 *  Méthodes complexe
 *  
 */ 
Object.defineProperties(Mot.prototype,{
 
  /* ---------------------------------------------------------------------
   *
   *  DATA
   *  
   --------------------------------------------------------------------- */
  "mot":{
    get:function(){return this._mot},
    set:function(val){
      this._mot = val
    }
  },
  "definition":{
    get:function(){ return this._definition},
    set:function(def){
      this._definition = def
    }
  },
  
  /*
   *  Retourne les "data mini", c'est-à-dire les données qu'on trouve
   *  dans FILMS.DATA (mais ici, l'objet est construit)
   *
   *  NOTES
   *  -----
   *    = Cette méthode n'est utile (pour le moment) qu'à la création
   *      d'un nouveau film.
   *  
   */
  "data_mini":{
    get:function(){
      return {
        id          : this.id, 
        mot         : this.mot,
        let         : this.let
      }
    }
  },
  
  /* ---------------------------------------------------------------------
   *
   *  MÉTHODES D'AFFICHAGE
   *  
   --------------------------------------------------------------------- */
  
})