# encoding: UTF-8

=begin

  Sauve une ou plusieurs fiches.
  Ou la détruit si son paramètre 'deleted' est à true.

NOTES
-----
  * Actualise le dernier ID utilisé si nécessaire.

=end

# Pour l'actualisation du dernier ID fiche utilisé
upper_id = 0 + Fiche::last_id

# Enregistrement de toutes les fiches transmises
param(:fiches).each do |data|
  ifiche = Fiche.new(data['id'], data['type'])
  # Dans tous les cas on détruit le fichier actuel de la fiche
  File.unlink(ifiche.path) if ifiche.exists?
  # Si c'est vraiment une sauvegarde
  unless data['deleted'] == "true"
    data['texte'] = data['texte'].strip_slashes unless data['texte'].nil?
    data['titre'] = data['titre'].strip_slashes unless data['titre'].nil?
    data['updated_at'] = Time.now.to_i
    File.open(ifiche.path, 'wb'){|f| f.write (Marshal.dump data)}
    upper_id = ifiche.id if ifiche.id > upper_id
  else
    # Dans le cas d'une destruction, il faut regarder si la configuration courante
    # doit être modifiée (si la fiche n'a pas de parent)
    if data['parent'].nil?
      
    end
  end
end unless param(:fiches).nil?

# Actualisation du dernier ID si nécessaire
Fiche::update_last_id upper_id if upper_id != Fiche::last_id