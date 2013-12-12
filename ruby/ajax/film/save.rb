=begin

Enregistrement du film

NOTES
-----

  = Note 1
    Des données supplémentaires pouvant être ajoutées par d'autres
    applications. On procède par prudence ici : on charge les données
    du film si elles existent, et on ne remplace que celles transmises

  = Ça peut être un NOUVEAU FILM. La seule manière de le savoir est
    de vérifier s'il existe. film.new?

  = Si c'est un NOUVEAU FILM, il faut actualiser la donnée générale des
    film (en ajoutant simplement son code à la fin ?)

=end

# @note: dans interdata
require_model 'film/ruby/model/film'

# @note : dans la librairie générale
require '../lib/ruby/extension/array'
require '../lib/ruby/extension/hash'

data = (param :data).to_sym
film = Film.new(data[:id])

is_new = film.new?

data[:duree]  = data[:duree].to_i
data[:annee]  = data[:annee].to_i
data[:let]    = data[:let].to_i
data.each{|prop, val| data[prop] = nil if data[prop] == ""}

need_update = false
differences = []
unless film.new?
  # cf. note 1
  cur_data  = film.data
  # -> C'est ici qu'il faut vérifier si des données mini ont été modifiées
  [:titre, :titre_fr, :annee].each do |prop|
    if cur_data[prop] != data[prop] then
      differences << ":#{prop} : Current:#{cur_data[prop].inspect} / New:#{data[prop].inspect}"
      need_update = true
    end
  end
  # On merge les nouvelles données avec les anciennes
  new_data  = cur_data.merge( data )
else
  data[:created_at] = Time.now if film.new?
  new_data = data
end

# On donne les données et on les enregistre
film.data = new_data
film.save(backup = !is_new)

# debug
differences = differences.join("\n")
File.open("./test_save.txt", 'wb') do |f| 
  f.write "Actualisation nécessaire ? #{need_update.inspect}\n"
  f.write "Différences :\n#{differences}\n\n"
  f.write film.data.inspect 
end

# Le film a-t-il modifié une de ses données mini (dans lequel cas il
# faudrait actualiser la liste des tous les films)
if need_update
  Film::update_listes_js
end
