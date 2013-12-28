
require '../interdata/film/ruby/model/film'
require './data/secret/data_phil' # => DATA_PHIL

FILM_ID = 'LeCinquimeElment'
PROP_TO_MODIFY = :id
NEW_VALUE = 'LeCinquiemeElement'

film = Film.new FILM_ID
film.merge PROP_TO_MODIFY => NEW_VALUE

if RETOUR_AJAX[:film_process].count > 0
  puts "### Des erreurs sont survenues ###"
  puts RETOUR_AJAX[:film_process].join("\n")
end
