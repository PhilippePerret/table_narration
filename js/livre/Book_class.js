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

$.extend(Book,{
  /**
    * Le livre en lecture (PDF)
    * @property {Book} current_read_book
    * @default Null
    */
  current_read_book:null,
  /**
    * Méthode de classe pour lire le PDF du livre
    * @method read
    * @param  {Book} book L'instance du livre à lire
    * @param  {Object}  params  Paramètres pour la lecture
    *   @param  {Number}  params.page   Page à partir de laquelle il faut lire
    */
  read:function(book, params)
  {
    if(!this.current_read_book)
    {
      // => Aucun livre en lecture, il faut préparer le lecteur
      this.prepare_lecteur_pdf()
    }
    book.read(params)
    this.current_read_book = book
    if(console)console.clear()
  },
  /**
    * Méthode de classe pour arrêter la lecture PDF
    * @note   La méthode est appelée par le bouton d'arrêt
    * @method stop_read
    */
  stop_reading:function()
  {
    this.lecteur_pdf.hide()
    this.current_read_book = null
  },
  /**
    * Méthode qui prépare le lecteur PDF
    * Notes
    * -----
    *   * La préparation consiste à 
    *     * Afficher le DIV du lecteur
    *     * Le rendre draggable si nécessaire
    * @note   Ce n'est pas la balise object, mais le div la contenant, draggable
    * @method prepare_lecteur_pdf
    */
  prepare_lecteur_pdf:function()
  {
    this.lecteur_pdf.show()
    if(this.lecteur_pdf.hasClass('ui-draggable') == false ) this.lecteur_pdf.draggable()
  }
})

Object.defineProperties(Book,{
  /**
    * Objet jQuery du lecteur PDF
    * @property {jQuerySet} lecteur_pdf
    */
  "lecteur_pdf":{
    get:function(){return $('div#lecteur_pdf') }
  }
})

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
    Ajax.send({script:'fiche/publish', collection:Collection.name, book:this.id, options:options}, $.proxy(this.retour_publish,this))
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
    *   * Ce n'est pas cette méthode qui doit être appelée, mais Book.read (méthode
    *     de classe)
    *
    * @method read
    * @param  {Object} params   Les paramètres de lecture
    *   @param  {Number}  params.page   Page à partir de laquelle il faut lire (1 = couverture)
    */
  read:function(params)
  {
    $('object#book-pdf')[0].data = "publication/livres/"+Collection.name+"/"+this.pdf_filename
  }
  
})

Object.defineProperties(Book.prototype,{
  /**
    * Retourne le titre du book pour affichage dans une référence
    *
    * @property {String} titre_for_ref
    */
  "titre_for_ref":{
    get:function(){return this.real_titre || this.titre}
  },
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
        this._pdf_filename = Texte.to_ascii(this.titre.replace(/ /g,'_')).capitalize() + '.pdf'
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