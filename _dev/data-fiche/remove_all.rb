=begin

Détruit complètement la collection test

=end

require './data/secret/data_phil' # => DATA_PHIL
if File.exists? "./collection/test"
  `echo "#{DATA_PHIL[:password]}" | sudo -S rm -rf './collection/test'`
end