=begin

Constructeur des livres
-----------------------

C'est ce script principal qu'utilise RLatex pour produire le fichier `source.tex` et autres fichiers utiles pour produire les livres et/ou les fichiers indispensables.

=end
require './ruby/model/collection'
require './ruby/model/fiche'
Dir["./publication/source/lib/*.rb"].each{|mod| require mod}

# Si ce fichier est appelé directement, il faut détourner vers le programme
# RLatex
unless defined?(RLatex)
  require "/Users/philippeperret/Programmation/Programmes/RLatex/main.rb"
  exit(256)
end

# On récupère le document initié par RLatex (dans main.rb)
document = RLatex::document

# Définir le document
document.author = "Philippe Perret"
document.type 'book'
document.options.font_size    '12pt'
# @note : les autres options sont définies dans le fichier `defaults.yml` de RLatex

# Ici, tout ce qu'il y a à faire pour nourir RLatex
# Pour la collection Narration, il faut récupérer tous les textes et les
# mettre dans le dossier `./publication/source/`
# TODO

# AIDE
# ----
# * Définir une section : \section{nom de la section}
# * Définir une sous-section : \subsection{nom de la sous-section}
# * Utiliser RLatex::Text::convert(string) pour convertir les textes
#     Mais peut-être que ça doit plutôt être fait dans le programme
#     ici, il faudra simplement ramasser le texte et le composer.
# * Se souvenir que l'espace après une commande est mangé

# CE QU'IL FAUT FAIRE
# -------------------
#   * Rassembler les références utilisées, pour pouvoir :
#     - Placer un \label dans les fiches référencées
#     - Remplacer la balise [ref:...] par la valeur de ce label.
#     NOTE : la lecture complète du livre est nécessaire
#   * Rassembler les films utilisés pour pouvoir :
#     - Faire la liste des films en annexe, avec les informations nécessaires
#     - Remplacer les balises [film:...] par une marque \index
#     NOTE : peut se faire au fil de la lecture
#   * Rassembler les mots du scénodico utilisés pour pouvoir :
#     - Faire la liste des mots en annexe, avec les définitions
#     - Remplacer les balises [mot:...] par une marque \index
#     NOTE : peut se faire au fil de la lecture
# 

# On prend le livre voulu dans la collection voulue
COLLECTION_ID = 'test'
BOOK_ID       = 0
Fiche::new(BOOK_ID, 'book').publish

# On produit le fichier `source.tex`
document.build_source