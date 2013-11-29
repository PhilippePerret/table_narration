/* === CLASSE BOOK === */
window.Book = function(data)
{
  if(undefined == data) data = {}
  data.type = 'book'
  Fiche.call(this, data)
}
Book.prototype = Object.create( Fiche.prototype )
Book.prototype.constructor = Book
