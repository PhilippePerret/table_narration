# VOIR SEULEMENT les différences
#
#	Sens : Pure-JS-Tests -> Applications
#
# Pour actualiser effectivement les fichiers, cf. le script `update.sh' de ce dossier.
#
# CMD+R pour procéder
#
# @note		Ne traite pas les fichiers des dossiers 'user_*'
#
function diff_with {
	echo "DIFFERENCES P-Js-T -> $1 (NO UPDATE)"
	rsync -ruvn ~/Sites/cgi-bin/lib/javascript/optional/PureJavascriptTests/-\>Site/tests.php ~/Sites/cgi-bin/$1
	# rsync -ruvn -f'- \.git*' -f'- */\.*' -f'- \.*' -f'- xlib/tests/*' --exclude="user_[tests|lib]*" --delete ~/Sites/cgi-bin/lib/javascript/optional/PureJavascriptTests/-\>Site/tests/ ~/Sites/cgi-bin/$1/tests
	# MODE SANS DELETE
	rsync -ruvn -f'- \.git*' -f'- */\.*' -f'- \.*' -f'- xlib/tests/*' --exclude="user_[tests|lib]*" ~/Sites/cgi-bin/lib/javascript/optional/PureJavascriptTests/-\>Site/tests/ ~/Sites/cgi-bin/$1/tests
}

# in : film
#
echo -e "\n\n"
echo "In film"
echo "-------"
diff_with 'film'

# in:	music_roadmap
#
echo -e "\n\n"
echo "In music_roadmap"
echo "----------------"
diff_with 'music_roadmap'

echo -e "\n\nLancer 'update.sh' si ces informations sont correctes pour vraiment actualiser les fichiers."