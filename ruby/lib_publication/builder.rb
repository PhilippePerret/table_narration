=begin

Préparation du fichier context.tex qui va contenir tout le texte du livre
et être inclus dans source.tex

Le code est appelé depuis ./publication/source/builder.rb par le code :

    *** Début du code ***
    DEFAULT_COLLECTION = 'publishing' unless defined?(DEFAULT_COLLECTION)
    folder_narration = File.join('', 'Users', 'philippeperret', 'Sites', 'table_narration')
    Dir.chdir(folder_narration) do
      require './ruby/model/collection'
      require './ruby/model/fiche'
      Dir["./ruby/lib_publication/*.rb"].each{|mod| require mod}
      build_content_tex # dans lib_publication/builder.rb
    end
    *** Fin du code ***

Notes
-----
  * J'ai mis ce code ici principalement parce que rien n'est sauvé sur github
    du dossier publication.

=end
def build_content_tex
  # On récupère l'instance {RLatex::Document} document initié par RLatex 
  # (dans main.rb)
  document = RLatex::document

  # Définir le document
  document.author = "Philippe Perret"
  document.type 'book'
  document.options.paper_size     'a5paper'
  document.options.font_family    'Utopia Regular with Fourier'
  document.options.font_size      '11pt'
  document.options.with_index     true
  document.options.with_biblio    true
  document.options.no_date        true
  document.options.bibliography_title  'Filmographie'
  # Ne pas indiquer le mot "Chapitre" avant les chapitres
  document.options.no_name_chapter  true
  # document.options.back_references true

  # = Pour essai en simplifiant le travail =
  # document.options.with_index       false
  # document.options.with_biblio      false
  document.options.back_references  false
  
  # Mettre une ligne dans le pied de page
  document.options.footer_line      0.4
  document.options.header_line      0

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
  if $BOOK.nil?
    path = File.expand_path(File.join('.', '.publishing.rb'))
    dlog "Path .publishing.rb  : #{path}"
    if File.exists? path
      dlog "-> Récupération du book à traiter par .publishing.rb"
      require path
      $BOOK = Fiche.new BOOK_ID, 'book'
      Collection::define_name COLLECTION
      dlog "Fichier à traiter venant de ./publishing.rb (BOOK_ID:#{BOOK_ID} /COLLECTION:#{COLLECTION})"
      File.unlink path
    else
      
      # Non : On prend toujours la collection affichée
      # if Collection::name != DEFAULT_COLLECTION
      #   Collection.define_name DEFAULT_COLLECTION
      # end
      $BOOK = Fiche.new( 0, 'book') 
    end
  else
    dlog "$BOOK n'est pas nil (#{$BOOK.type}:#{$BOOK.id}:#{$BOOK.titre})"
  end
  affixe_dest = $BOOK.normalized_affixe_from_titre
  affixe_dest += "-tdm" if OPTIONS_COMMAND[:only_tdm]
  document.destination_file File.join('.', 'livres', Collection::name, affixe_dest)
  dlog "Fichier destination : #{document.destination_file}"
  begin
    $BOOK.prepare_publication OPTIONS_COMMAND
  rescue Exception => e
    dlog "\n\n###---------------------------------------------------------------------"+
          "\n### ERROR : #{e.message}"
    dlog "### " + e.backtrace.join("\n### ")
    dlog "###---------------------------------------------------------------------"
    raise
  end

  # Fabrication de la bibliographie (custom)
  Film::build_biblio

  # On construit l'annexe définition des mots du scénodico
  Mot::build_annexe

  # On produit le fichier `source.tex`
  document.build_source
  
end