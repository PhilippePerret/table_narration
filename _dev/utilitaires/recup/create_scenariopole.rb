=begin

Création de la collection "Scénariopole" (un seul livre) reprenant les
anciens cours (afin de pouvoir les insérer dans la collection Narration)


=end

# ---------------------------------------------------------------------
# *** Options de fabrication ***
# Mettre à true pour voir ce qui sera créé, mais sans rien faire
MODE_DEBUG        = false
VERBOSE           = true
# Il y a plus de 8000 fiches, et le changement de propriétaire peut donc
# prendre du temps. On peut le désactiver si c'est juste un essai (noter :
# pour pouvoir charger la collection dans le navigateur, il est impératif
# que le propriétaire ait été mis à _www)
DONT_CHANGE_OWNER = false

# *** Fin options ***
# ---------------------------------------------------------------------

# Méthode pour simuler la méthode qui récupère les paramètres URI
# Pour l'utilisation des scripts ajax
def param key; Params::param key end
class Params
class << self
  def param key;        @params[key]  end
  def set_params hash;  @params=hash  end
end
end

THIS_FOLDER = File.dirname(__FILE__)
Dir["#{THIS_FOLDER}/lib/*.rb"].each { |m| require m }

# Définition de la collection courante
# @note: Ça ne change pas le fichier .current
Collection::define_name 'scenariopole'

# Quand on a construit la collection sans changer le propriétaire à
# la fin (ce qui est long), on peut relancer ce script en décommentant
# les deux lignes suivantes pour modifier ce propriétaire
# NPage::change_owner '_www'
# exit(0)

# Création de la collection
NPage::build_scenariopole

# Définir le dernier ID fiche (utile dans la phase de création du constructeur)
puts "Définition du dernier ID (Fiche::last_id)" if VERBOSE
Fiche::update_last_id NPage::last_id

# puts "\n*** Pages non classées ***"
dbooks = NPage::data_books
chap_non_classees_id = dbooks[:titre2id]["Pages non classées"]
nombre_pages_non_classees = dbooks[:books][chap_non_classees_id][:pages].count
# dbooks[:books][chap_non_classees_id][:pages].each do |dpage|
#   puts "- #{dpage[:id]}: #{dpage[:titre]}"
#   nombre_pages_non_classees += 1
# end
puts "\nNombre de pages non classées : #{nombre_pages_non_classees}"
puts "Nombre de fiches créées : #{NPage::last_id}"

# Pour terminer, on met _www en propriétaire de tous les éléments
NPage::change_owner '_www' unless DONT_CHANGE_OWNER
puts "\n*** OPÉRATION TERMINÉE ! ***"