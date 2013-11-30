#encoding: UTF-8

=begin

Fait un backup de la collection actuelle

Le backup se fait seulement une fois par jour. On peut cependant le forcer
en envoyant le paramètre 'force_backup' à 1. Cela ne supprime pas le backup
du jour mais l'enregistre avec l'heure courante

Pas de backup quand on est en mode test.

=end

unless Collection::mode_test?
  now = Time.now
  archive_suffixe = now.strftime("%y%m%d")
  archive_suffixe += now.strftime("\_%H\h%M") if param(:force_backup).to_i == 1
  archive_name =  archive_suffixe + ".zip"
  archive_path = File.join(Collection::folder_backups, archive_name)

  # Une sauvegarde par jour seulement
  unless File.exists? archive_path
    `zip -r '#{archive_path}' './collection/current'`
  end
end