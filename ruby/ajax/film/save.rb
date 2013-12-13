=begin

Enregistrement de la nouvelle fiche d'identité d'un film.
Ou création du film.

=end

# @note: le cherchera dans interdata
require_model 'film/ruby/model/film'

RETOUR_AJAX[:film_process] << "= Ajax Save Request ="

data = (param :data)
film = Film.new(data['id'])
film.merge data

RETOUR_AJAX[:film_process] << "= Fin save ="
