=begin

Extension de la class Film pour la publication

=end
require '../interdata/film/ruby/model/film'
class Film
  
  FILMS = {}
  
  # ---------------------------------------------------------------------
  #   Class
  # ---------------------------------------------------------------------
  class << self
  
    # Ajoute un film à {Hash} FILMS
    def add ifilm
      return unless FILMS[ifilm.id].nil?
      FILMS[ifilm.id] = ifilm
    end
    
  end
  
  # ---------------------------------------------------------------------
  #   Instance
  # ---------------------------------------------------------------------
  
  # Construit et retourne le code pour le texte LaTex, en mémorisant le
  # film si ça n'est pas déjà fait.
  # 
  # Notes
  # -----
  #   * Ne corrige pas les caractères spéciaux, etc., ce qui sera fait plus tard
  #     par la méthode appelante.
  # 
  # @param  {Array} options   Liste des options pour l'affichage.
  #                           NOTE : en première valeur, le titre (inutilisé ici)
  #                           Ensuite, contient quelque chose comme [annee, original]
  #                           pour déterminer les choses à faire apparaitre.
  # 
  def to_latex options
    options.shift # retirer le titre
    self.class.add self
    # Pour le moment :
    "#{titre} (#{titre_fr || '---'}, #{annee})"
  end
  
end