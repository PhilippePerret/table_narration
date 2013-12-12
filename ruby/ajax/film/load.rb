=begin

Retourne les data du film d'identifiant :film_id

=end

# @note: dans interdata
require_model 'film/ruby/model/film'

RETOUR_AJAX[:film] = Film.new(param :film_id).data