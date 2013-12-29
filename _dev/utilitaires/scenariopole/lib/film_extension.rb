=begin

Extension de la class Film (interdata)

=end

class Film
  
  class << self
    # Prépare la table qui permet d'obtenir le nouveau id du film en
    # fonction de son ancien.
    # @note L'ancien était entier, fabriqué d'après le titre
    def prepare_films
      # Film::update_listes_js # juste une fois, pour faire la donnée json seule
      @FILMS = Film::data_json
      # puts @FILMS.inspect # pour visualiser la liste de films
      @FILMS
    end
    
    def get_film id
      @FILMS ||= prepare_films
      @FILMS[id]
    end
  end
end