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
  
  def publish_as_titre
    case type
    when 'book' then source.title = (data['real_titre'] || main_value).to_latex
    when 'chap' then source.new_chapter main_value.to_latex
    when 'page' then source.new_section main_value.to_latex
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
    traite_balise_for_latex
    @latex += "\n" if paragraph?
    @latex.to_latex
  end
  
  # Traite le paragraphe en fonction de son style
  # Principe
  # --------
  #   * Si la méthode 'ParserStyle::<style paragraphe>' existe, on l'invoque 
  #     pour traiter le paragraphe.
  # 
  def traite_per_style
    if ParserStyle::respond_to? self.style
      ParserStyle::send(self.style, self)
    end
  end
  # # Traite le paragraphe en fonction de son ptype
  # # @requis {String} @latex La main value du paragraphe
  # # 
  def traite_per_ptype
    @latex = case ptype
    when 'text' then @latex
    when 'list' # Liste à puce
      "\\begin{itemize}\n" + 
      @latex.split("\n").collect do |line|
        "\\item #{line}"
      end.join("\n") + "\n\\end{itemize}\n"
    when 'enum' # Liste numérotée
      "\\begin{enumerate}\n" + 
      @latex.split("\n").collect do |line|
        "\\item #{line}"
      end.join("\n") + "\n\\end{enumerate}\n"
    when 'desc' # Liste de définitions
      "\\begin{description}\n" + 
      @latex.split("\n").collect do |line|
        mot, desc = line.split('::')
        "\\item[#{mot}] \\hfill \\\n#{desc}"
      end.join("\n") + "\n\\end{description}\n"
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
  
  # Traitement des balises dans @latex
  # 
  def traite_balise_for_latex
    return @latex if @latex.index('[').nil?
    dlog "Une balise détectée dans #{@latex}"
    @latex.gsub!(/\[(film|mot|ref|img):([^\|\]]+)(?:\|([^\|\]]+))?(?:\|([^\]]+))?\]/u){
      tout = $&
      bal = $1
      ide = $2
      val = $3
      opt = ($4 || "").split
      foo = case bal
        when 'film' then Film::new(ide)
        when 'mot'  then Mot::new(ide)
        when 'ref'  then Ref::new(ide)
        when 'img'  then 
          Image::new(ide, val)
      end
      case bal
        when 'film', 'mot', 'ref'
          foo.to_latex( opt.unshift(val) )
        else # pour toutes les autres balises
          foo.to_latex
      end
    }
  end
  
  # Raccourci au document source.tex de RLatex
  # 
  def source
    @document ||= RLatex::document
  end
  
end