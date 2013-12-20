=begin

Publication du livre param :book

=end

# On vérifie que ce soit bien un livre
book = Fiche.new (param :book), 'book'
if book.exists?
  begin
    path = File.join('.', './.publishing.rb')
    File.open(path, 'wb'){|f| f.write "BOOK_ID=#{param :book}\nCOLLECTION='#{Collection::name}'" }
    book.publish(param :options)
  rescue Exception => e
    RETOUR_AJAX[:ok] = false
    RETOUR_AJAX[:message] = "erreur"
    # RETOUR_AJAX[:message] = e.message
    # RETOUR_AJAX[:error] = e.message + "\n" + e.backtrace.join("\n")
  end
else
  RETOUR_AJAX[:ok] = false
  RETOUR_AJAX[:message] = "Impossible de publier le livre (soit ce n'est pas un livre, soit il n'existe pas)"
end