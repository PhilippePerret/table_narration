#!/Users/philippeperret/.rvm/rubies/ruby-2.0.0-p353/bin/ruby
# encoding: UTF-8

=begin

Voir les données du film (régler l'identifiant ci-dessus)

=end

require '../interdata/film/ruby/model/film'

FILM_ID = 'ZUnAutreNouveau--'

film = Film.new FILM_ID
if film.exists?
  puts film.data.collect{|k,v| "#{k} => #{v.inspect}"}.join("\n")
else
  puts "### LE FILM D'IDENTIFIANT \n\t`#{FILM_ID}'\nN'EXISTE PAS dans\n\t`#{Film::folder_fiches_identite}/'…"
end