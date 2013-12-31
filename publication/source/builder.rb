=begin

Constructeur des livres
-----------------------

C'est ce script principal qu'utilise RLatex pour produire le fichier 
`source.tex` et autres fichiers utiles pour produire les livres et/ou 
les fichiers indispensables.

Notes
-----
  * Il est lancé par la commande CMD+P sur une fiche (lorsqu'elle est un livre
    ou qu'elle appartient à un livre) mais ce script peut être aussi lancé,
    dans lequel cas c'est toujours la collection définie ci-dessous qui sera 
    utilisée
=end
dlog "---> builder.rb"

# changer pour utiliser une autre collection
DEFAULT_COLLECTION = 'publishing' unless defined?(DEFAULT_COLLECTION)

# On doit toujours s'assure qu'on travaille dans le dossier racine
# de table narration (ce qui n'est pas le cas lorsqu'on appelle rlatex en
# command en ligne)
# folder_narration = File.dirname(File.dirname(File.dirname(File.expand_path(__FILE__))))
# En dur
folder_narration = File.join('', 'Users', 'philippeperret', 'Sites', 'table_narration')

Dir.chdir(folder_narration) do

  # puts "Dossier courant : #{File.expand_path('.')}"
  require './ruby/model/collection'
  require './ruby/model/fiche'
  Dir["./ruby/lib_publication/*.rb"].each{|mod| require mod}

  build_content_tex # dans lib_publication/builder.rb
  
end