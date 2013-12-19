=begin

Extension de la class Mot pour la publication

=end
require '../interdata/scenodico/ruby/model/mot'
class Mot
  
  # Liste {Array} qui va contenir tous les mots à mettre en index
  # du livre.
  # 
  # Notes
  # -----
  #   * Cf. la méthode de classe `add` qui permet de les ajouter.
  # 
  MOTS = {}
  
  # ---------------------------------------------------------------------
  #   Classe
  # ---------------------------------------------------------------------
  class << self

    # Ajoute un mot à l'index du livre
    # 
    # Notes
    #   * La méthode peut être appelée soit par un mot marqué comme à indexer
    #     dans le document ou une balise Mot normale.
    # 
    # @param  {String|Mot}  imot Soit un simple mot string soit une instance
    #                       mot.
    def add imot
      mot = imot.class == String ? imot : imot.mot 
      return unless MOTS[mot].nil?
      MOTS[mot] = imot
    end
  end
  
  # ---------------------------------------------------------------------
  #   Instance
  # ---------------------------------------------------------------------

  # Retourne le mot formaté pour LaTex
  # 
  # Notes
  # -----
  #   * En plus de renvoyer le code à écrire dans content.tex, la méthode
  #     s'occuper aussi de nourir MOTS qui contiendra tous les mots à mettre
  #     en index.
  # 
  # @param  {Array}   options 
  #                   Les options d'affichage tirés de la balise écrite 
  #                   dans le texte.
  #                   NOTE : La première valeur est le mot tel qu'il doit être
  #                   affiché.
  def to_latex options
    # On le mémorise si ce n'est pas encore fait.
    self.class.add self
    displayed_mot = options.shift
    "\\index{#{mot}}#{displayed_mot}"
  end
  
end