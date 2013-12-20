
# Pour requérir un model du dossier ./ruby/model/ ou du dossier ./interdata
# 
def require_model model
  path_local = File.join('.', 'ruby', 'model', model)
  if File.exists? path_local
    require path_local
  else
    path_interdata = File.join('..', 'interdata', model)
    require path_interdata
  end
end


# Permet de mettre les logs dans le retour ajax
# 
def alog line
  RETOUR_AJAX[:log] ||= ""
  RETOUR_AJAX[:log] << "#{line}\n"
end

def log line
  openlog if @reflog.nil?
  @reflog.write "#{line}\n"
end

def openlog
  pathlog = File.join(".", "log")
  File.unlink pathlog if File.exists? pathlog
  @reflog = File.open('./log', 'a')
  @reflog.write("===== LOG #{Time.now.strftime('%d %m %Y - %H:%M')} =====\n\n")
end

def closelog
  return if @reflog.nil?
  @reflog.close
end