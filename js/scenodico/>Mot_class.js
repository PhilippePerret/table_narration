/*
 *  Class Mot
 *  ---------
 *
 *  NOTES
 *  -----
 *    = La toute première définition se trouve dans le dossier required.
 *  
 */

// // On l'étend avec les méthodes et propriétés partagées
// $.extend(Mot.prototype, ObjetClass.prototype)


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
    var t ;
    // Simple pour le moment
    t = '<a onmouseover="DICO.show(this, \''+this.id+'\')" class="lk lk_mot">'+this.mot+'</a>'
    return t
  }

})

Object.defineProperties(Mot.prototype,{
  
  /*
   *  Retourne le code HTML de l'aperçu de l'item
   *  
   *  NOTES
   *  -----
   *    = Ce code sera placé dans un div.apercu
   */
  "html_apercu":{
    get:function(){
      return  '<div id="'+this.id_apercu+'" class="apercu">'+
                '<div class="mainprop"></div>' +
                '<div class="resume"></div>' +
              '</div>'
    }
  },
  
  /*
   *  Actualise l'affichage de l'aperçu de l'item
   *  
   */
  "update_apercu":{
    get:function(){
      if(this.apercu.length == 0) return
      this.apercu.find('.mainprop').html(this.mot)
      this.apercu.find('.resume').html(this.definition)
    }
  }
})
