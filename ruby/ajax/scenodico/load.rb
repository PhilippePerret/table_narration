=begin

Chargement complet d'un mot

=end

# @note: dans interdata
require_model 'scenodico/ruby/model/mot'

RETOUR_AJAX[:ditem] = Mot.new(param :item_id).data