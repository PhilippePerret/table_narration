=begin

Produit un backup de la collection narration

=end
path = File.expand_path(File.join('.', 'collection', 'narration'))
puts path
puts "Backup sur l'atelier en cours. Merci de patienter…"
puts `cd '#{path}';rftp sync`