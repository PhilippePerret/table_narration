# encoding: UTF-8

=begin

  Sauve une ou plusieurs fiches.

NOTES
-----
  * Actualise le dernier ID utilisé si nécessaire.

=end

# Pour l'actualisation du dernier ID fiche utilisé
upper_id = 0 + Fiche::last_id

# Enregistrement de toutes les fiches transmises
param(:fiches).each do |data|
  ifiche = Fiche.new(data['id'], data['type'])
  File.unlink(ifiche.path) if ifiche.exists?
  
  File.open(ifiche.path, 'wb'){|f| f.write (Marshal.dump data)}

  upper_id = ifiche.id if ifiche.id > upper_id
end unless param(:fiches).nil?

# Actualisation du dernier ID si nécessaire
Fiche::update_last_id upper_id if upper_id != Fiche::last_id