/**
  * @module ui_mode_unique
  * @class UI
  * @static
  *
  * Méthode de UI qui gèrent le mode unique et l'historique des fiches
  * ouvertes.
  */

/**
  * Constante-raccourci pour savoir si on se trouve dans le mode unique
  * Le mode unique permet de n'ouvrir qu'un seul 'book' et qu'une seule 'page'
  * à un endroit unique de la page (pour une meilleure lisibilité)
  * Notes
  *   * Réglé par la préférence `modeunique`
  *
  * @property {Boolean} MODE_UNIQUE
  * @default false
  * @for window
  */
window.MODE_UNIQUE = false

if('undefined' == typeof UI) UI = {}
$.extend(UI, {
  
  /**
    * Liste {Object} des instances de fiches book ou page ouvertes en mode unique
    * Cet objet possède la propriété 'book' et la propriété 'page' qui sont toutes
    * deux une liste ({Array}) des instances de fiches de chaque type ouvertes en
    * mode unique.
    * @property {Object}   historique_mode_open
    * @default  {'book':[], 'page':[]}
    */
  historique_mode_open: {'book':[], 'page':[]},
  
  /**
    * Méthode appelée quand on ouvre une fiche en mode unique
    * La méthode ferme éventuellement la fiche de même type couramment ouverte
    * et positionne la nouvelle fiche à ouvrir (déjà ouverte par sa méthode)
    * Notes
    *   * La méthode est appelée par tout type de fiche, donc il faut tester ici
    *     que ce soit un type book ou page
    *
    * @method open_mode_unique
    * @param  {Fiche} fiche   La fiche ouverte
    */
  open_mode_unique:function(fiche)
  {
    if(fiche.is_not_book && fiche.is_not_page) return
    var last = this.last_fiche_historique(fiche.type)
    if(last) last.close
    var left = fiche.is_book ? UI.GRID_X : 2 * UI.GRID_X ;
    var top  = 0
    fiche.obj.css({'top':top+"px", 'left':left+"px"})
    this.add_to_histo(fiche)
  },
  
  /**
    * Méthode appelée quand on ferme une fiche en mode unique
    * Notes
    *   * La méthode est appelée par tout type de fiche, donc il faut tester ici
    *     que ce soit un type book ou page
    * @method close_mode_unique
    * @param  {Fiche} fiche   L'instance fiche à fermer
    */
  close_mode_unique:function(fiche)
  {
    if(fiche.is_not_book && fiche.is_not_page) return
    this.remove_from_histo(fiche)
  },
  /**
    * Méthode ajoutant la fiche +fiche+ à l'historique des fiches book ou page
    * ouvertes.
    * Notes
    *   * Si la fiche à ajouter est la même que la dernière fiche ouverte,
    *     on ne fait rien. Cela arrive chaque fois qu'on ferme une fiche, puisque
    *     la dernière ouverte est alors rouverte (et passe donc par ici)
    * @method add_to_histo
    * @param  {Fiche} fiche   Instance fiche de la fiche
    */
  add_to_histo:function(fiche)
  {
    var last = this.last_fiche_historique(fiche.type)
    if(last && last.id == fiche.id) return
    this.historique_mode_open[fiche.type].push(fiche)
  },
  /**
    * Méthode retirant la fiche +fiche+ de l'historique des fiches book ou page
    * ouvertes.
    * C'est forcément la dernière fiche ouverte. Mais on vérifie quand même
    * @method remove_from_histo
    * @param  {Fiche} fiche   Instance fiche de la fiche
    */
  remove_from_histo:function(fiche)
  {
    var removed = this.historique_mode_open[fiche.type].pop()
    if(fiche.id != removed.id)
    {
      F.error("Bizarre… La fiche retirée des fiches openeds en mode unique ne correspond pas à la fiche fermée. Je la remets")
      this.historique_mode_open[fiche.type].push(fiche)
    }
  }
})

Object.defineProperties(UI,{
  /**
    * Retourne la dernière fiche enregistrée dans l'historique (mode unique)
    * @method last_fiche_historique
    * @param  {String} type   Le type de fiche 'book' ou 'page'
    */
  "last_fiche_historique":{
    value:function(type){
      var last = this.historique_mode_open[type].length - 1
      if( last == -1 ) return null
      else return this.historique_mode_open[type][last]
    }
  }
})