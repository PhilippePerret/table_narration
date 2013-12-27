/* === CLASSE BOOK === */
window.Book = function(data)
{
  if(undefined == data) data = {}
  data.type = 'book'
  Fiche.call(this, data)
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
    * @param  {Object} options   Options de publication
    *   @param  {Boolean} options.only_tdm  Si true, n'imprime que la table des matières du livre
    *
    */
  publish:function(options){
    var mess = LOCALE.fiche.message['book publishing'], options_mess = "" ;
    mess = mess.replace(/_LIVRE_/, this.titre)
    if(options.only_tdm) options_mess = " (seulement la TdM)"
    mess = mess.replace(/_OPTIONS_/, options_mess)
    mess += "…"
    F.show(mess)
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
      // F.show("Pas de panique… Ce livre a été enregistré pour publication. Il suffit de runner le module `./publication/source/builder.rb` dans TextMate pour que le livre soit finalisé.",{keep:true})
    }
  },
  
  /**
    * Pour lire le livre, c'est-à-dire le passer de page en page depuis la 
    * couverture jusqu'à la fin.
    * Notes
    * -----
    *   * La méthode est asynchrone dans le sens où les pages ne sont pas 
    *     nécessairement toutes chargées au moment où la commande est exécutée.
    *     
    * @method read
    * @async
    * @param  {Object} params   Les paramètres de lecture
    *   @param  {Number}  params.from   Page à partir de laquelle il faut lire (0 = couverture)
    *   @param  {Number}  params.to     Page jusqu'à laquelle on doit lire. -1 pour la dernière.
    */
  read:function(params)
  {
    var divpdf = $('div#div_book_pdf')
    var jobjet = $('object#book-pdf')
    if(this.reading)
    {
      // Fin de la lecture
      divpdf.hide(500)
      this.reading = false
    }
    else
    {
      // Afficher le pdf
      divpdf[0].style.display = 'block'
      var me = this
      divpdf.show({duration:500, complete:function(){
        var objet = jobjet[0]
        objet.data = "publication/livres/"+Collection.name+"/"+me.pdf_filename
        if(divpdf.hasClass('ui-draggable') == false ) divpdf.draggable()
        if(console)console.clear()
      }})
      this.reading = true
    }
  },
  
})

Object.defineProperties(Book.prototype,{
  /**
    * Retourne le nom du book tel qu'il a été utilisé pour la création
    * du fichier PDF.
    * @property {String} pdf_filename
    * @static
    */
  "pdf_filename":{
    get:function(){
      if(undefined == this._pdf_filename)
      {
        this._pdf_filename = this.titre.replace(/ /g,'_').capitalize() + '.pdf'
      }
      return this._pdf_filename
    }
  },
  
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