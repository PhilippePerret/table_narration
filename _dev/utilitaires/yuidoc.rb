=begin

Produit la document JS du dossier REL_PATH (à partir du dossier javascript)

=end

REL_PATH = '.'


FOLDER = File.expand_path(File.join('.', 'js', REL_PATH))
# Pour tester :
# FOLDER = File.expand_path(File.join('.', 'yuidoc_js_test', REL_PATH))
puts "YUIDoc #{FOLDER}"

`yuidoc --outdir ./yuidoc #{FOLDER}`