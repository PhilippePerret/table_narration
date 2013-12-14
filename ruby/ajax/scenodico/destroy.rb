=begin

Destruction d'un mot.

@requis   :item_id    Identifiant du mot (dans les params).

@return   Le process dico
@return   :item_id
=end

# @note: le cherchera dans interdata
require_model 'scenodico/ruby/model/mot'

RETOUR_AJAX[:dico_process] << "= Ajax Destroy Request ="

Mot.new(param :item_id).destroy

RETOUR_AJAX[:item_id] = (param :item_id)
RETOUR_AJAX[:dico_process] << "= /Fin Ajax destroy ="
