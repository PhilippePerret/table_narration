# / Users/philippeperret/.rvm/rubies/ruby-2.0.0-p353/bin/ruby
# encoding: UTF-8

# Ça ne fonctionne pas, en l'appelant par Ajax
# 
touche    = param(:texte)
modifiers = param(:modifiers)

cmd=<<-EOC
osascript -e \'
set texte to "#{param(:texte)}"
tell application "Firefox"
  activate
  activate
  -- Pour faire passer l'application au premier plan
  tell application "System Events"
    keystroke "1" using {command down}
    set AppleScript's text item delimiters to ""
    repeat with letter in texte
      keystroke letter
    end repeat
    set AppleScript's text item delimiters to []
  end tell
end tell
\'
EOC

# cmd = "open ~/Sites"


RETOUR_AJAX[:pour_voir] = "Le retour est #{system '#{cmd}'} / #{touche}"
