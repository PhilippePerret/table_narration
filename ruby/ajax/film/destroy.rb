=begin

Destruction d'un film.

@requis   :item_id    Identifiant du film (dans les params).

@return   Le process film
@return   :item_id
=end

# @note: le cherchera dans interdata
require_model 'film/ruby/model/film'

RETOUR_AJAX[:film_process] << "= Ajax Destroy Request ="

Film.new(param :item_id).destroy

RETOUR_AJAX[:item_id] = (param :item_id)
RETOUR_AJAX[:film_process] << "= /Fin Ajax destroy ="
