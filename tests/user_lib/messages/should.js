UMessage = {}
UMessage.should = {
	return:{
		'Film.titre':{
			failure:"La bonne valeur retournée devrait être #{expected}",
			success:"`Film.titre()` retourne la bonne valeur (#{expected})"
		}
	}
}