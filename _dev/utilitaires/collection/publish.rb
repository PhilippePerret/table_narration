=begin

Pour publier tous les livres de la collection

Principe
--------

=end

# Options de publication
# ----------------------
# Par exemple pour ne publier que les tables des matières, etc.
# 
# NOTER qu'il ne faut pas commenter cette ligne, car elle permet au
# script de publication (`ruby/ajax/collection/publish.rb`) de savoir
# que la publication n'est pas demandée par ajax.
OPTIONS_PUBLISHING = {}

# Collection
# ----------
# Par défaut, c'est la collection courante qui est utilisée. Mais on peut la
# redéfinir en définissant la constante ci-dessous
COLLECTION_NAME = 'narration'

# Livre
# -----
# Pour ne traiter qu'un livre en particulier
# Commenter cette ligne pour traiter tous les livres de la collection
# LIVRE_ID = 5

# Pour afficher le log de RLatex
AFFICHER_LOG_RLATEX = true

require './ruby/lib/functions'
require './ruby/model/fiche'
require './ruby/model/collection'
require './data/secret/data_phil'

Collection::define_name COLLECTION_NAME
path_to_publication = File.expand_path('.', 'publication')
puts "path_to_publication: #{path_to_publication}"
counter_book = 0
logs = []

if defined? LIVRE_ID
  [File.join(Collection::folder_fiches, 'book', "#{LIVRE_ID}.msh")]
else
  Dir["#{Collection::folder_fiches}/book/*.msh"]
end.each do |path|
  counter_book += 1
  id = File.basename(path, File.extname(path))
  ibook = Fiche.new id, 'book'
  puts "\nLivre #{counter_book} : id ##{id}::#{ibook.titre}"
  path = File.join('.', '.publishing.rb')
  File.open(path, 'wb'){|f| f.write "BOOK_ID=#{id}\nCOLLECTION='#{COLLECTION_NAME}'"}
  `cd "#{path_to_publication}";echo '#{DATA_PHIL[:password]}' | sudo -S /usr/bin/rlatex .`
  logs << File.read( File.join('.', 'publication', 'rlatex.log') )
  # break if counter_book > 1
end

puts "\n\nNombre de livres traités : #{counter_book}"
if AFFICHER_LOG_RLATEX
  puts "\n\nRLatex Log :"
  puts logs.join("\n\n")
end
