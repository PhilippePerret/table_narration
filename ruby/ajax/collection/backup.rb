#encoding: UTF-8

=begin

Fait un backup de la collection actuelle

Le backup se fait seulement une fois par jour. On peut cependant le forcer
en envoyant le paramètre 'force_backup' à 1. Cela ne supprime pas le backup
du jour mais l'enregistre avec l'heure courante

Pas de backup quand on est en mode test.

=end
forcer_backup = param(:force_backup).to_i == 1

unless Collection::name == "test"
  now = Time.now
  archive_suffixe = now.strftime("%y%m%d")
  archive_suffixe += now.strftime("\_%H\h%M") if forcer_backup
  archive_name =  archive_suffixe + ".zip"
  archive_path = File.join(Collection::folder_backups, archive_name)

  # Une sauvegarde par jour seulement
  unless File.exists? archive_path
    `zip -r '#{archive_path}' './collection/current'`
  end
  
  # Si c'est la collection Narration, et qu'on force le backup, on 
  # actualise aussi online
  if Collection::name == 'narration' && forcer_backup
    path = File.expand_path(Collection::folder)
    res = `cd '#{path}';/usr/bin/rftp sync`
    RETOUR_AJAX[:backup_narration] = true
    RETOUR_AJAX[:backup_narration_folder] = path
    RETOUR_AJAX[:backup_narration_log] = res
    RETOUR_AJAX[:backup_narration_exit] = $?.to_i
  end
end