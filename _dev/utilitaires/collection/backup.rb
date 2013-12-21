=begin

Produit un backup de la collection narration

=end
path = File.expand_path(File.join('.', 'collection', 'narration'))
puts path
puts `cd '#{path}';rftp sync`