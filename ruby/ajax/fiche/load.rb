=begin

Charge les fiches données en arguments (et toutes celles nécessaires
à leur affichage — si elles sont ouvertes)

=end

@data_fiches = []
param(:fiches).each do |minidata|
  ifiche = Fiche.new minidata['id'], minidata['type']
  @data_fiches += ifiche.get_data :children => :if_opened
end

RETOUR_AJAX[:fiches] = @data_fiches

