=begin

Publication du livre param :book

=end

# On vérifie que ce soit bien un livre
book = Fiche.new (param :book), 'book'
if book.exists?
  begin
    raise "Pour le moment, la publication ne peut pas se faire par ce biais."+
    "\nUtiliser le script utilitaire ./_dev/utilitaires/collection/publish.rb"
    path = File.join('.', './.publishing.rb')
    File.open(path, 'wb'){|f| f.write "BOOK_ID=#{param :book}\nCOLLECTION='#{Collection::name}'" }
    # book.publish(param :options)
    path_publishing_folder = File.expand_path(File.join('.', 'publication'))
    raise "Dossier `#{path_publishing_folder}' introuvable" unless File.exists? path_publishing_folder
    # Si ça fonctionne, ajouter plus tard les options
    cmd = "cd '#{path_publishing_folder}';/usr/bin/rlatex ."
    # cmd = "cd '#{path_publishing_folder}';rlatex ."
    ret = `#{cmd}`
    res = $?
    RETOUR_AJAX[:command_line]    = cmd
    RETOUR_AJAX[:retour_command]  = ret
    RETOUR_AJAX[:reponse_command] = res.inspect
    if res.to_i == 127
      raise "La commande `rlatex' n'a pas été trouvée ou un problème est survenu."
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