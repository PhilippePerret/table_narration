# encoding: UTF-8

=begin

  Sauve une ou plusieurs fiches.

=end

RETOUR_AJAX[:pour_voir] = "Pour voir si ce script sera appelé"

# Enregistrement de toutes les fiches transmises
param(:fiches).each do |data|
  path_fiche = Fiche::path_to data
  File.unlink(path_fiche) if File.exists?( path_fiche )
  File.open(path_fiche, 'wb'){|f| f.write data.to_json }
end