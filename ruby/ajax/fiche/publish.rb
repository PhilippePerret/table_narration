=begin

Publication du livre param :book

Mais ça ne semble pas encore fonctionner quand je le fais depuis le navigateur.
Donc il faut s'assure que le fichier final existe.


=end


collection_name = (param :collection_name) || Collection::name
path_to_publication = File.expand_path('.', 'publication')
path_to_folder_livres = File.join(path_to_publication, 'livres', 'narration')

# On vérifie que ce soit bien un livre
book = Fiche.new (param :book), 'book'

# Les fichiers finaux qu'on devra trouver
path_to_pdf_final = File.join(path_to_folder_livres, "#{book.normalized_affixe_from_titre}.pdf")
path_to_ps_final  = File.join(path_to_folder_livres, "#{book.normalized_affixe_from_titre}.ps")
File.unlink path_to_pdf_final if File.exists? path_to_pdf_final
File.unlink path_to_ps_final  if File.exists? path_to_ps_final

if book.exists?
  begin
    path = File.join('.', '.publishing.rb')
    File.open(path, 'wb'){|f| f.write "BOOK_ID=#{param :book}\nCOLLECTION='#{collection_name}'"}
    `cd "#{path_to_publication}";/usr/bin/rlatex .`
    RETOUR_AJAX[:log_publish] = File.read( File.join('.', 'publication', 'rlatex.log') )
    unless (File.exists? path_to_pdf_final) && (File.exists? path_to_ps_final)
      raise "La publication n'a pas pu se faire entièrement. Utilise plutôt l'utilitaire ./_dev/utilitaires/publish.rb pour publier le livre courant."
    end
  rescue Exception => e
    RETOUR_AJAX[:ok] = false
    RETOUR_AJAX[:message] = e.message
    # RETOUR_AJAX[:error] = e.message + "\n" + e.backtrace.join("\n")
  end
else
  RETOUR_AJAX[:ok] = false
  RETOUR_AJAX[:message] = "Impossible de publier le livre (soit ce n'est pas un livre, soit il n'existe pas)"
end