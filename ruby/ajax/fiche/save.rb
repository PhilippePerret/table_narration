# encoding: UTF-8

=begin

  Sauve une ou plusieurs fiches.

Tiens en même temps à jour la liste des fiches non rangées
(qui devront être rechargées au prochain chargement)

Actualise le dernier ID utilisé si nécessaire.

=end


# Liste des éléments non rangés
non_ranged = Collection::non_rangeds

# Pour l'actualisation du dernier ID fiche utilisé
upper_id = 0 + Fiche::last_id

# Enregistrement de toutes les fiches transmises
param(:fiches).each do |data|
  ifiche = Fiche.new(data['id'], data['type'])
  File.unlink(ifiche.path) if ifiche.exists?
  File.open(ifiche.path, 'wb'){|f| f.write data.to_json }
  # La fiche doit-elle faire partie des non-rangée ?
  non_ranged << ifiche.idtype unless ifiche.ranged?
  upper_id = ifiche.id if ifiche.id > upper_id
end unless param(:fiches).nil?

# Enregistrement de la nouvelle liste des non rangés
Collection::save_non_rangeds non_ranged if non_ranged != Collection::non_rangeds

# Actualisation du dernier ID si nécessaire
Fiche::update_last_id upper_id if upper_id != Fiche::last_id