# encoding: UTF-8

=begin
  Mets la collection actuelle de côté lorsqu'on veut tester
  l'application.
  Le module permet en fait de basculer de la collection test (des fiches
  pré-établies pour les tests)

Les tests ont peut-être déjà été appelés, il ne faut peut-être rien faire.


Le script retourne OK si tout s'est bien passé, ce qui permettra de régler
le bouton permettant de retrouver la collection originale à la fin des
tests.

=end

raise "Le dossier de la collection est introuvable" unless File.exists?(Collection.folder)