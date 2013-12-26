=begin

Extension de la classe Fiche pour la publication

=end

class Fiche
  
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
    end
  end

  def publish_as_paragraph
    source << self.to_latex
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
    traite_per_ptype
    traite_balise_for_latex
    @latex += "\n" if paragraph?
    @latex.to_latex
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