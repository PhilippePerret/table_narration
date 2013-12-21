/* === CLASSE BOOK === */
window.Book = function(data)
{
  if(undefined == data) data = {}
  data.type = 'book'
  Fiche.call(this, data)
  this.indice = Collection.books.length
  Collection.books.push( this )
}
Book.prototype = Object.create( Fiche.prototype )
Book.prototype.constructor = Book

$.extend(Book.prototype,{
  /**
    * Procède à la publication du livre, c'est-à-dire à la fabrication des
    * fichier postscript et PDF par mon RLatex.
    *
    * Notes
    * -----
    *
    * @method publish
    * @async
    * @param  {Object} options   Options. TODO Plus tard, permettra de définir
    *                            ce qu'il faut imprimer (p.e. seulement la TdM)
    *                             en mettant {only_tdm:true} dans +options+
    *
    */
  publish:function(options){
    F.show("Publication en cours…",{keep:true})
    Ajax.send({script:'fiche/publish', book:this.id, options:options}, $.proxy(this.retour_publish,this))
  },
  /**
    * Retour ajax de la méthode `publish`
    *
    * @method retour_publish
    * @param  {Object} rajax  Objet remonté par Ajax
    *
    */
  retour_publish:function(rajax){
    if(rajax.ok)
    {
      // Flash.clean()
      F.show("Publication effectuée avec succès.")
    }
    else{ 
      F.error(rajax.message)
      F.show("Pas de panique… Ce livre a été enregistré pour publication. Il suffit de runner le module `./publication/source/builder.rb` dans TextMate pour que le livre soit finalisé.",{keep:true})
    }
  }
  
})

Object.defineProperties(Book.prototype,{
  
  /*
   *  Concernant le TITRE RÉEL (real_titre)
   *  
   */
  "real_titre_jid":{get:function(){return 'input#'+this.dom_id+'-real_titre'}},
  "input_real_titre":{get:function(){ return $(this.real_titre_jid) }},
  "html_input_real_titre":{
    get:function(){
      return '<div class="div_real_titre">'+
                '<label class="libelle">Titre réel</label>' +
                '<input type="text" value="" id="'+this.dom_id+'-real_titre" class="real_titre" />'+
              '</div>'
    }
  },
  "real_titre":{
    set:function(titre){ 
      if (titre == this._real_titre) return
      this._real_titre = titre
      this.input_real_titre.val( titre )
    },
    get:function(){
      return this._real_titre || null
    }
  }
  
})

/* Méthode appelée au changement de real titre du livre */
Book.prototype.onchange_real_titre = function(evt)
{
  var idm = "Fiche::onchange_real_titre ["+this.type_id+"]"
  dlog("---> "+idm, DB_FCT_ENTER | DB_CURRENT)
  this.real_titre = this.input_real_titre.val()
  this.modified = true
  dlog("<- "+idm, DB_FCT_ENTER | DB_CURRENT)
}