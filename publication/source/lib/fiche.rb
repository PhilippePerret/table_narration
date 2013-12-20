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
      publish_as_paragraph unless options[:only_tdm]
    else              
      publish_as_titre
      children_as_fiches.each { |fchild| fchild.prepare_publication }
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
  # TODO: Prendre en compte le `ptype` du texte si c'est un paragraphe.
  #       'text': type normal
  #       'list': une liste, donc \begin{itemize}\item etc.
  #       'file': un fichier à insérer
  #       'code': du code à évaluer
  def to_latex
    @latex = main_value
    traite_balise_for_latex
    @latex += "\n" if paragraph?
    @latex.to_latex
  end
  
  # Traitement des balises dans @latex
  # 
  def traite_balise_for_latex
    return @latex if @latex.index('[').nil?
    @latex.gsub!(/\[(film|mot|ref):([^\|\]]+)\|([^\|\]]+)(\|([^\]]+))?\]/u){
      tout = $&
      bal = $1
      ide = $2
      val = $3
      opt = ($5 || "").split
      case bal
      when 'film' then Film::new(ide)
      when 'mot'  then Mot::new(ide)
      when 'ref'  then Ref::new(ide)
      end.to_latex( opt.unshift(val) )
    }
  end
  
  
  
  # Raccourci au document source.tex de RLatex
  # 
  def source
    @document ||= RLatex::document
  end
  
end