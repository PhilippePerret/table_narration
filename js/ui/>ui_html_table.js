/**
  * @module ui_html_table
  *
  * Le module définit l'objet UI.Html.str2table et la classe HTMLTable qui
  * permet de mettre en forme un tableau.
  *
  */

/**
  * @class HTMLTable
  * @constructor
  */
window.HTMLTable = function(str)
{
  this.code_str         = str
  this.width_colonnes   = null
  this.nombre_colonnes  = null

  this.parse_code_str
  
}

Object.defineProperties(HTMLTable.prototype,{
  /**
    * Retourne le code HTML pour la table
    * @property {String} to_html
    */
  "to_html":{
    get:function(){
      return '<table>'+
              this.html_entete_colonnes +
              this.html_rangees +
              '</table>'
    }
  },
  
  /**
    * Code HTML pour toutes les rangées du tableau
    * @property {HTMLString} html_rangees
    */
  "html_rangees":{
    get:function(){
      var me = this
      return  L(me.rangees).collect(function(drangee){
                return '<tr>' + me.html_tr(drangee)
              }).join("")
    }
  },
  /**
    * Code HTML pour une rangée
    * Notes
    *   * Un colspan est indiqué en indiquant "-" en contenu de la
    *     rangée sur laquelle doit se poursuivre la cellule précédente.
    * @method html_tr
    * @param  {Array} drangee   Liste des contenus de la rangée
    * @return {HTMLString} Code pour la rangée de table
    */
  "html_tr":{
    value:function(drangee)
    {
      // Pour être sûr de ne pas ajouter de colonne indésirable
      var row = '<tr>', cols = drangee.slice(0, this.nombre_colonnes), icol = 0, ispan, col;
      while( undefined != (col = drangee.shift()))
      {
        ispan = 1
        while(drangee[0] && drangee[0].trim() == "-"){ ++ ispan ; drangee.shift() }
        row += '<td' + (ispan>1?' colspan="'+ispan+'"':'') + '>' + col + '</td>'
      }
      return row + '</tr>'
    }
  },
  
  /**
    * Parse le code string donné en argument à l'instanciation
    * Notes
    * -----
    *   * Méthode complexe => appeler sans parenthèses
    * Produit
    * -------
    *   * La définition des colonnes
    *
    * @method parse_code_str
    */
  "parse_code_str":{
    get:function(){
      var lines = this.code_str.split("\n")
      if(lines[0].substring(0,1) == "|"){ // ancien format
        lines = L(lines).collect(function(line){
          return line.substring(1, line.length).trim()
        })
      }
      // La première ligne doit définir les colonnes
      this.width_colonnes  = lines.shift().split(' ')
      this.nombre_colonnes = this.width_colonnes.length
      // On ajoute un marqueur de nouvelle rangée s'il n'existe pas
      if(lines[0].substring(0,3) != "---") lines.unshift('---')
      this.rangees  = []
      var irangee   = -1
      while(line = lines.shift())
      {
        if(line.substring(0,3) == '---')
        { // => Début d'une nouvelle rangée
          irangee += 1
          this.rangees.push([])
        }
        else
        { // => Contenu d'une rangée
          var contenu = line.split('||')
          for(var i in contenu) this.rangees[irangee].push(contenu[i])
        }
      }
    }
  },
  
  /**
    * Retourne le code HTML pour l'entête des colonnes
    * Principe des colonnes
    * ---------------------
    *   * Si la définition comprend une unité, on la prend
    *   * Sinon, si le total fait 100, ce sont des pourcentages
    *   * Dans le cas contraire, ce sont des pixels.
    *   * On ne peut pas mélanger nombre sans unité et nombre avec unité.
    *
    * @property {HTMLString} entete_colonnes
    */
  "html_entete_colonnes":{
    get:function(){
      var colun = this.width_colonnes[0], unite = "", c = "" ;
      if(colun.toString().replace(/[a-z]/g,'') == colun.toString())
      { // => pas d'unité
        unite = (L(this.width_colonnes).somme() == 100) ? "%" : "px"
      }
      c = L(this.width_colonnes).collect(function(width){
        return '<col width="'+width+unite+'">'
      }).join("")
      return '<colgroup>' + c + '</colgroup>'
    }
  }
})

/**
  * @class UI.Html
  * @static
  */

if('undefined' == typeof UI.Html) UI.Html = {}
$.extend(UI.Html, {
  
  /**
    * Prend le code courant (this.code) et le formate comme un tableau HTML
    * Notes
    * -----
    *   * Propriété complexe => appeler sans parenthèses
    * @method formate_as_tableau
    * @return {StringHTML} Le code pour le tableau courant
    */
  str2table:function(str)
  {
    return (new HTMLTable(str)).to_html
  }
})