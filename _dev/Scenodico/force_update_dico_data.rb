#!/Users/philippeperret/.rvm/rubies/ruby-2.0.0-p353/bin/ruby
# encoding: UTF-8

=begin

Force l'actualisation du fichier interdata/scenodico/data_js/dico_data.js qui
définit la donnée DICO.DATA ({Hash} des mots en data mini — pour listing par 
exemple)

NOTES
-----

  = Normalement, la méthode est appelée automatiquement lorsqu'un nouveau
    mot est créé. Ou, plus rare, que le mot change.

=end


FOLDER_SCENODICO = File.join('..', 'interdata', 'scenodico')
MODELS_RUBY       = File.join(FOLDER_SCENODICO, 'ruby', 'model')

require File.join(MODELS_RUBY, 'Mot_class')

if defined?(Mot)
  Mot::update_dico_data_js
else
  puts "Impossible de requérir à Mot:Class"
end