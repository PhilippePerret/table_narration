/*
 *  Objet Pluriel FICHES
 *  --------------------
 *
 */
window.FICHES = {
  
  /*
   *  CONSTANTES
   *  
   */
  datatype:{
    'para'  : {level: 5 },
    'page'  : {level: 10},
    'chap'  : {level: 15},
    'book'  : {level: 20}
    },

  /*
   *  PROPRIÉTÉS GÉNÉRALES
   *  
   */
  last_id: -1,
  
  /*
   *  List {Hash} des fiches instanciées
   *  ----------------------------------
   *  En clé, l'identifiant ({Number}), en valeur l'instance de la fiche
   *
   *  C'est la méthode `create' de la fiche qui la met dans la liste
   *
   */
  list:{},
  /*
   *  Nombre de fiches dans `list'
   */
  length:0,
  
  /*
   *  {Hash} des fiches sélectionnées
   *  
   *  En clé, l'ID de la fiche, en valeur, son instance
   */
  selecteds:{},
  
  /*
   *  Fiche courante (instance Fiche)
   *  
   */
  current:null,

  /*
   *  Indique si on se trouve dans un champ de saisie (input-text ou textarea)
   *  de la fiche courante.
   *  
   */
  in_text_field:false,
  
  /*
   *  Ajoute une fiche instanciée
   *  
   *  NOTE
   *  ----
   *
   *  @param  ifiche    Instance Fiche de la fiche instanciée
   *
   */
  add:function(ifiche)
  {
    // La fiche ne doit pas encore exister
    if(undefined != this.list[ifiche.id]) return
    this.list[ifiche.id] = ifiche
    this.length ++
  },
  
  /*
   *  Supprime une fiche instanciée
   *  
   */
  remove:function(ifiche)
  {
    // La fiche doit exister
    if(undefined == this.list[ifiche.id]) return
    delete this.list[ifiche.id]
    this.length --
  },
  
  /*
   *  Ajout d'une fiche à la sélection
   *  
   *  NOTES
   *  -----
   *    * Dans tous les cas, la dernière fiche est mise en fiche courante
   *
   *  @param  ifiche    Instance de la fiche à ajouter à la sélection
   *  @param  keep      Si TRUE, on doit garder les sélections courantes
   *                    FALSE par défaut, vrai quand la touche majuscule est
   *                    appuyée.
   */
  add_selected:function(ifiche, keep)
  {
    // console.log("-> add_selected (ifiche #"+ifiche.id+")")
    if(undefined == keep) keep = false
    if(this.current == ifiche) return
    if(this.current && !keep) this.current.deselect
    this.current = ifiche
    if (undefined != this.selecteds[ifiche.id]) return
    
    this.selecteds[ifiche.id] = ifiche
    // Réglage de la captation des touches clavier
    window.onkeypress = keypress_when_fiche_selected_out_textfield
  },
  /*
   *  Suppression d'une fiche de la sélection
   *  
   *  @param  ifiche    Instance de la fiche à retirer de la sélection
   */
  remove_selected:function(ifiche)
  {
    if(this.current == ifiche) this.current = null
    delete this.selecteds[ifiche.id]
    window.onkeypress = keypress_when_no_selection_no_edition
  },
  
  /*
   *  Méthode appelée quand on focuse/blure dans n'importe quel champ de
   *  saisie de la fiche
   *  
   */
  onfocus_textfield:function(ifiche, evt)
  {
    // console.log("-> onfocus_textfield dans " + evt.target.id)
    ifiche.select
    window.onkeypress = keypress_when_fiche_selected_in_textfield
    var target = $(evt.currentTarget)
    target.addClass('focused')
    target.select()
    this.in_text_field = true
  },
  onblur_textfield:function(ifiche, evt)
  {
    // console.log("-> onblur_textfield de " + evt.target.id)
    $(evt.target).removeClass('focused')
    if(this.current) window.onkeypress = keypress_when_fiche_selected_out_textfield
    else window.onkeypress = keypress_when_no_selection_no_edition
    this.in_text_field = false
  }
}

Object.defineProperties(FICHES,{
  "init_all":{
    get:function(){
      this.length     = 0
      this.list       = {}
      this.current    = null
      this.last_id    = -1
      this.selecteds  = {}
      $('section#table').html('')
    }
  }
  
})
