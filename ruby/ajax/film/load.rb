=begin

Retourne les data du film d'identifiant :item_id

=end

# @note: dans interdata
require_model 'film/ruby/model/film'

RETOUR_AJAX[:ditem] = Film.new(param :item_id).data