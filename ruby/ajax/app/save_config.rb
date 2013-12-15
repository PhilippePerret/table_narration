=begin

Sauvegarde la configuration courante (pour la prochaine ouverture)

NOTES
-----
  * La configuration est contenue dans `param :config'
  * Cette procédure est appelée lorsque l'on clique sur l'appareil
    photo ou lorsque l'on quitte l'application Table narration
  * Le fonctionnement est le suivant : au chargement de l'application,
    on lit le fichier `current_config.conf' et on le détruit (cf. Collection.load)
    Ensuite, quand on quitte l'application, on prend la configuration courante
    mais on ne l'enregistre que si l'on ne trouve de fichier config.
  * Si `param :force', alors on force l'enregistrement de la configuration, même
    si on trouve déjà un fichier.
=end
path_config = Collection::path_current_config

unless (param :force).nil?
  File.unlink path_config if File.exists? path_config
end

unless File.exists? path_config
  # File.open(path_config, 'wb'){ |f| f.write Marshal.dump(param :config)}
  # Pour le moment, j'essaie d'enregistrer simplement la donnée, qui doit être sous
  # forme de string.
  File.open(path_config, 'wb'){ |f| f.write (param :config).gsub(/\\"/, '"')}
end
  
  