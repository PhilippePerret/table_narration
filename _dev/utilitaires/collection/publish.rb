=begin

Pour publier tous les livres de la collection

Principe
--------
On appelle le module ajax "collection/publish" qui lance la publication de tous les livres trouvés dans la collection courante.

=end

# Options de publication
# ----------------------
# Par exemple pour ne publier que les tables des matières, etc.
# 
# NOTER qu'il ne faut pas commenter cette ligne, car elle permet au
# script de publication (`ruby/ajax/collection/publish.rb`) de savoir
# que la publication n'est pas demandée par ajax.
OPTIONS_PUBLISHING = {}

# Collection
# ----------
# Par défaut, c'est la collection courante qui est utilisée. Mais on peut la
# redéfinir en définissant la constante ci-dessous
COLLECTION_NAME = 'narration'

require './ruby/ajax/collection/publish'

if RETOUR_AJAX[:ok]
  puts "Publication exécutée avec succès !"
else
  puts "### Des erreurs sont intervenues :"
  puts RETOUR_AJAX[:message].inspect
  puts "\nPour mieux voir les erreurs, double-cliquer sur le fichier ./publication/source.tex et lancer sa fabrication dans TexWorks."
end