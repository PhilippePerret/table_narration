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