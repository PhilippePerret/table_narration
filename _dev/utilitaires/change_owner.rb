#!/Users/philippeperret/.rvm/rubies/ruby-2.0.0-p353/bin/ruby
# encoding: UTF-8

=begin

Change le propriétaire d'un fichier ou d'un dossier

=end
PROPRIO = '_www'
PATH    = "./js/data"

require './data/secret/data_phil' # => DATA_PHIL
if File.exists? PATH
  `echo "#{DATA_PHIL[:password]}" | sudo -S chown #{PROPRIO} '#{PATH}'`
end