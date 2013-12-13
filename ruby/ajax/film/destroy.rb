=begin

Destruction d'un film.

@requis   :film_id    Identifiant du film (dans les params).

=end

# @note: le cherchera dans interdata
require_model 'film/ruby/model/film'

RETOUR_AJAX[:film_process] << "= Ajax Destroy Request ="

Film.new(param :film_id).destroy

RETOUR_AJAX[:film_process] << "= /Fin Ajax destroy ="
