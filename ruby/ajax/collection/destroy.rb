=begin

Destruction complète de la collection.

Par mesure de prudence, même si :collection est fourni en paramètre, on ne peut détruire que la collection test. Donc cette méthode n'est utilisée que pour les
tests.

=end

require 'fileutils'

def unlink_if_exists path
  File.unlink path if File.exists? path
end

if Collection::name == "test"
  folder = './collection/test'
  unlink_if_exists './collection/test/CURRENT_CONFIG.conf'
  FileUtils::rm_rf folder
  Dir.mkdir(folder, 0777)
else
  RETOUR_AJAX[:ok]      = false
  RETOUR_AJAX[:message] = "Seul la collection “test” peut être détruite par ce biais !"
end