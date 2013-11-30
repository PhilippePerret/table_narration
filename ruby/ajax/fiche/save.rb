# encoding: UTF-8

=begin

  Sauve une ou plusieurs fiches.

Tiens en même temps à jour la liste des fiches non rangées
(qui devront être rechargées au prochain chargement)  
=end


# Liste des éléments non rangés
non_ranged = Collection::non_rangeds

# Enregistrement de toutes les fiches transmises
param(:fiches).each do |data|
  path_fiche = Fiche::path_to data
  File.unlink(path_fiche) if File.exists?( path_fiche )
  File.open(path_fiche, 'wb'){|f| f.write data.to_json }
  non_ranged << "#{data['id']}:#{data['type']}" if data['ranged'] == "false"
end

# Enregistrement de la nouvelle liste des non rangés
Collection::save_non_rangeds non_ranged