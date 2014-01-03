=begin

Extension de la classe Fiche pour la publication

=end

class Fiche
  
  # Le code de la fiche, en traitement
  # 
  attr_accessor :latex
  
  # === Méthode principale qui publie la fiche ===
  # 
  # Quel que soit le type de la fiche, on la passe par cette publication.
  # Mais le traitement est très simple pour les fiches autres que paragraphe,
  # puisque seul leur titre sera utilisé.
  # Donc le traitement d'un livre complet se fait en appelant cette méthode
  # c'est le démarrage (et donc la possibilité d'initialiser certaines valeurs)
  # 
  # Notes
  # -----
  #   * Ne pas utiliser le nom de méthode `publish` qui existe déjà dans
  #     dans le modèle Fiche général.
  #   * Les fiches marquées `not_printed` seront passées
  # 
  # @param  {Hash} options  Les options de publication
  #                         Cf. la méthode principale `<Fiche>.publish`
  # 
  def prepare_publication options = nil
    options ||= {}
    return if printed? == false && !options[:even_not_printed]
    case type
    when 'para'
      publish_as_paragraph if options[:only_tdm].nil? || options[:only_tdm] == false
    when 'book'
      # Démarrage de la procédure => initialisation
      # -------------------------------------------

      # On définit le titre du livre
      # TODO  Mais plus tard, on ne fera rien du tout puisqu'il y aura une
      #       première de couverture.
      source.title = (data['real_titre'] || main_value).to_latex
      # Liste des identifiants des autres livres auxquels on fait référence
      
      # dans les fiches. Cette liste permettra de déterminer les `external_document`
      # pour le package LaTex `xr` qui gère ces références externes.
      $IDS_BOOKS_XR = []
      
    else              
      publish_as_titre
      children_as_fiches.each { |fchild| fchild.prepare_publication options }
      # Quand le type est 'book', on passe ici lorsque tous les éléments ont
      # été traités. Il faut voir si le livre ne se termine pas par un exemple
      # de document. Il faut alors le flusher
      flush_document_auteur if DOC_EXEMPLE[:on]
    end
  end

  # Liste des styles de document auteur
  # cf. `./data/asset/paragraph_style.txt` pour les explications
  PREFIXES_STYLE_DOC_AUTEUR = ['scenario', 'synopsis', 'brainstorming']

  # Styles déjà traités. Cette table permet :
  #   * De savoir si un style appartient à un document d'auteur
  #   * D'obtenir immédiatement le nom de la commande LaTex correspondante
  #   * Cette table est remplie automatiquement au cours du programme
  STYLE_CSS_TO_COMMAND_LATEX = {}
  
  # Table contenant les styles de paragraphe traités qui ne sont pas
  # des styles appartenant à des exemples de document
  STYLE_CSS_HORS_DOC_EXEMPLE = {}
  
  # Table du document exemple courant
  # cf. `flush_document_exemple', `reset_document_exemple', etc.
  DOC_EXEMPLE = {
    :on => false, :prefix => nil, :command => nil, :content => nil
  }
  
  # Insert le paragraphe dans le fichier source.tex
  # (ou le mémorise dans le document exemple courant)
  # -----------------------------------------------
  # Notes
  #   * `source` est un alias de RLatex::document
  #   * Traitement particulier pour les styles qui appartiennent à un 
  #     type de document exemple (un scénario par exemple). Ces paragraphes ne sont
  #     pas inscrit tout de suite, ils doivent être rassemblés pour être placés
  #     dans des environnements personnalisés définis dans `source/asset.tex`.
  #     C'est le `style` du paragraphe qui détermine cette procédure, s'il commence
  #     par un des préfixes défini dans PREFIXES_STYLE_DOC_AUTEUR (cf. ci-dessus)
  # 
  def publish_as_paragraph
    source << self.to_latex unless is_in_exemple_document?
  end
  
  # Retourne TRUE si le paragraphe appartient à un document exemple (p.e. un scénario)
  # C'est 1/son style 2/le préfixe appartenant à PREFIXES_STYLE_DOC_AUTEUR ci-dessus
  # qui le détermine.
  def is_in_exemple_document?
    prefix_docex = prefix_doc_exemple    
    if prefix_docex.nil?
      # Le paragraphe courant n'appartient pas à un exemple de document
      # Mais si un exemple de document était "ouvert", il faut l'enregistrer
      # maintenant.
      flush_document_auteur if DOC_EXEMPLE[:on]
      return false # pour que le paragraphe soit inscrit
    else
      # Le paragraphe courant appartient à un exemple de document
      # ---
      # Mais c'est peut-être un autre type
      if DOC_EXEMPLE[:on] == false
        # Le paragraphe précédent n'appartenait pas à un exemple de document
        # On inaugure simplement un nouveau document exemple
        reset_document_auteur( prefix_docex )
      elsif DOC_EXEMPLE[:prefix] != prefix_docex
        # Le type du document courant était différent pour le paragraphe
        # précédent. Il faut flusher son contenu et initialiser un nouveau
        # document exemple
        flush_document_auteur( prefix_docex )
      else
        # On passe ici lorsque c'est un paragraphe appartenant à un
        # exemple de document déjà ouvert.
      end
      # On ajoute le paragraphe au document exemple
      latex_command = STYLE_CSS_TO_COMMAND_LATEX[self.style][:command]
      DOC_EXEMPLE[:content] << "\\#{latex_command}{#{self.to_latex}}"
      return true # Pour ne pas mettre le paragraphe dans source tout de suite
    end
  end
  
  # Retourne le préfixe "doc exemple" du paragraphe courant s'il appartient
  # à un type de document exemple, ou nil
  def prefix_doc_exemple
    return nil if self.style.nil?
    return nil if STYLE_CSS_HORS_DOC_EXEMPLE[self.style]
    if STYLE_CSS_TO_COMMAND_LATEX[self.style].nil?
      # Le style du paragraphe courant n'est pas connu. Il faut
      # l'analyser pour voir s'il appartient à un exemple de document
      dstyle  = self.style.split('_')
      prefix_docex = dstyle.first
      if PREFIXES_STYLE_DOC_AUTEUR.index(prefix_docex) != nil
        # Le paragraphe courant appartient à un type d'exemple de document
        STYLE_CSS_TO_COMMAND_LATEX[self.style] = {
          :prefix   => prefix_docex,
          :command  => prefix_docex + dstyle[1..-1].collect{|el| el.capitalize}.join('')
        }
        return prefix_docex
      else
        # Le paragraphe courant n'appartient pas à un type d'exemple de document
        # On le mémorise pour aller plus vite la prochaine fois qu'on rencontre
        # un paragraphe de ce style
        STYLE_CSS_HORS_DOC_EXEMPLE[self.style] = true
        return nil
      end
    else
      # Le paragraphe courant appartient à un type d'exemple de document et
      # son style a déjà été rencontré.
      return STYLE_CSS_TO_COMMAND_LATEX[self.style][:prefix]
    end
  end
  
  # Met le contenu du document auteur courant dans la source
  # @param  prefix {String}  Préfixe (type) du document exemple courant. Quand
  #                           cette méthode est appelée, le `prefix` n'est défini
  #                           que lorsqu'un autre document exemple est initié par le
  #                           paragraphe courant.
  def flush_document_auteur prefix = nil
    source << "\\#{DOC_EXEMPLE[:command]}{#{DOC_EXEMPLE[:content]}}"
    reset_document_auteur prefix
    
  end
  
  # Reset DOC_EXEMPLE
  # @param  {String}  prefix  Si fourni, c'est le préfixe pour le NOUVEAU document
  #                           exemple à initialiser. Utile lorsque deux types
  #                           de documents exemples différents se suivent.
  # 
  def reset_document_auteur prefix = nil
    DOC_EXEMPLE[:on]      = prefix.nil? ? false : true
    DOC_EXEMPLE[:prefix]  = prefix
    DOC_EXEMPLE[:command] = prefix.nil? ? nil : 'doc' + prefix.capitalize
    DOC_EXEMPLE[:content] = ""
  end
  
  # Publie la fiche comme simple titre
  # @note : le livre lui-même est traité plus haut, dans la méthode
  # `prepare_publication`
  def publish_as_titre
    case type
    when 'chap' then source.new_chapter main_value.to_latex, :label => "ref#{id}"
    when 'page' then source.new_section main_value.to_latex, :label => "ref#{id}"
    end
  end
  
  # Méthode principale qui transforme la fiche en texte LaTex
  # 
  # Notes
  # -----
  #   * Pour le moment, seul les paragraphes passent par ici
  #     A priori, je ne devrais pas mettre de balises dans les titres, mais je pense
  #     que dans la réalité, je ferai parfois "Analyse de [film:... un film...]"
  #     Donc il faudra passer tous les textes.
  # 
  def to_latex
    @latex = main_value
    traite_per_style if paragraph?
    traite_per_ptype
    ParserBalises::parse self
    @latex += "\n" if paragraph?
    @latex.to_latex
  end
  
  # Traite le paragraphe en fonction de son style (s'il est défini)
  # Principe
  # --------
  #   * Si la méthode 'ParserStyle::<style paragraphe>' existe, on l'invoque 
  #     pour traiter le paragraphe.
  # 
  def traite_per_style
    return if self.style.nil?
    ParserStyle::send(self.style, self) if ParserStyle::respond_to?( self.style )
  end
  
  # # Traite le paragraphe en fonction de son ptype
  # # @requis {String} @latex La main value du paragraphe
  # # 
  def traite_per_ptype
    @latex = case ptype
    when 'text' then @latex
    # liste à puce, numérotée, ou de définition
    # et table HTML
    when 'list', 'enum', 'desc', 'tabl', 'revc'
      ParserPType::parse self
    when 'ruby'
      eval @latex
    when 'code'
      "#{@latex}"
    when 'file'
      real_text
    when 'fico'
      "Charger le fichier #{@latex} et l'interpréter"
    when 'imag'
      "ptype 'imag' n'est pas encore traité dans #{__FILE__}"
    else 
      dlog "ptype inconnu : #{ptype}"
      ""
    end
  end
  
  # Préfixe externe
  # ---------------
  # Ce préfixe est utilisé pour faire une référence à un autre livre
  # 
  # Notes
  # -----
  #   * C'est le package `xr` qui s'en sert.
  #   * Les documents externes se trouvent dans `publication/source/external_document`
  #   * Ils portent le même nom que les pdf, mais ce sont des .tex
  #   * Ils sont déclarés dans source.tex par \external_document[<ce prefixe>-]{path}
  #   * Quand le builder rencontre une balise faisant référence à un autre livre,
  #     il fait cette référence en ajoutant ce préfixe (en utilisant ma commande
  #     \refpour{<prefix>-<ref>})
  # 
  def external_prefix
    @external_prefix ||= "B#{id}"    
  end
  # Nom du fichier external_document
  def external_name
    @external_name ||= "#{normalized_affixe_from_titre}.tex"
  end
  # External path pour source.tex
  def external_path_for_source
    @external_path_for_source ||= File.join('source', 'external_document', external_name)
  end
  # Path (mais pour enregistrer le document)
  def path_external
    @path_external ||= File.join(folder_external_documents, external_name)
  end
  def folder_external_documents
    @folder_external_documents ||= (self.class.getfolder File.join('publication', 'source', 'external_document'))
  end
    
  # Raccourci au document source.tex de RLatex
  # 
  def source
    @document ||= RLatex::document
  end
  
end