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
  Dir["./publication/source/lib/*.rb"].each{|mod| require mod}

  # On récupère l'instance {RLatex::Document} document initié par RLatex 
  # (dans main.rb)
  document = RLatex::document

  # Définir le document
  document.author = "Philippe Perret"
  document.type 'book'
  document.options.paper_size     'a5paper'
  document.options.font_size      '11pt'
  document.options.with_index     true
  document.options.with_biblio    true
  document.options.no_date        true
  document.options.bibliography_title  'Filmographie'
  # document.options.back_references true

  # = Pour essai en simplifiant le travail =
  # document.options.with_index       false
  # document.options.with_biblio      false
  document.options.back_references  false

  # @note : les autres options sont définies dans le fichier `defaults.yml` de RLatex


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

  # On prend le livre voulu dans la collection courante
  # 
  # Notes
  # -----
  #   * $BOOK est défini si l'on passe par la procédure normale de publication,
  #     c'est-à-dire par le site. Il n'est pas défini lorsqu'on run directement
  #     ce script.
  #   =================
  #   === IMPORTANT ===
  #   =================
  #   * PUISQUE ÇA NE FONCTIONNE PAS ENCORE directement depuis le navigateur,
  #     la demande de publication enregistre un fichier ./.publishing contenant
  #     les informations sur le livre est la collection. Si $BOOK n'est pas
  #     défini et qu'on trouve ce fichier, c'est lui qu'on prend pour la publication.
  if $BOOK.nil?
    path = File.join('.', './.publishing.rb')
    if File.exists? path
      require path
      $BOOK = Fiche.new BOOK_ID, 'book'
      Collection::define_name COLLECTION
      dlog "Fichier à traiter venant de ./publishing.rb (BOOK_ID:#{BOOK_ID}/COLLECTION:#{COLLECTION})"
      File.unlink path
    else
      
      # Non : On prend toujours la collection affichée
      # if Collection::name != DEFAULT_COLLECTION
      #   Collection.define_name DEFAULT_COLLECTION
      # end
      $BOOK = Fiche.new( 0, 'book') 
    end
  end
  document.destination_file File.join('.', 'livres', Collection::name, $BOOK.normalized_affixe_from_titre)
  puts "Fichier destination : #{document.destination_file}"
  $BOOK.prepare_publication

  # Fabrication de la bibliographie (custom)
  Film::build_biblio

  # On construit l'annexe définition des mots du scénodico
  Mot::build_annexe

  # On produit le fichier `source.tex`
  document.build_source

end