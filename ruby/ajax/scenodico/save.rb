=begin

Enregistrement d'un mot dans le Scénodico.
Ou création.

=end

# @note: le cherchera dans interdata
require_model 'scenodico/ruby/model/mot'

RETOUR_AJAX[:dico_process] << "= Ajax Save Request ="

data  = (param :data)
Mot.new(data['id']).merge data

RETOUR_AJAX[:dico_process] << "= Fin save ="
