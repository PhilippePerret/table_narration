=begin

Publie tous les livres de la collection donnée en argument ou la collection courante.

param :collection || collection courante

Principe
--------
On parcourt tous les livres de la collection et on compose leurs fichiers pdf et ps,
en leur donnant un nom correspondant à leur titre réel.

=end
if defined?(OPTIONS_PUBLISHING)
  # Les modèles sont requis
  require 'rubygems'
  require 'json'
  require './ruby/model/collection'
  require './ruby/model/fiche'
  require './ruby/lib/functions'
  
  # Quand le module est appelé par un utilitaire du dossier ./_dev/utilitaires/
  options = OPTIONS_PUBLISHING
  RETOUR_AJAX = {}
  if defined?(COLLECTION_NAME) && COLLECTION_NAME != Collection::name
    Collection::define_name COLLECTION_NAME
  end
else
  # Quand le module est appelé depuis ajax
  options = (param :options)
end

Dir["#{Collection::folder_fiches}/book/*.msh"].each do |path|
  id = File.basename(path, File.extname(path))
  book = Fiche.new id, 'book'
  begin
    # path = File.join('.', '.publishing.rb')
    # File.open(path, 'wb'){|f| f.write "BOOK_ID=#{param :book}\nCOLLECTION='#{Collection::name}'" }
    book.publish options
  rescue Exception => e
    RETOUR_AJAX[:ok] = false
    RETOUR_AJAX[:message] = e.message
    # RETOUR_AJAX[:error] = e.message + "\n" + e.backtrace.join("\n")
  end
  
end
