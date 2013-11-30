window.UTest = {
  
	// Méthode propre à l'application qui sera appelée avant les tests
	before_test:function(){
		window.LOCALE = APP.LOCALE
    APP.Collection.stop_automatic_saving
	},
	// Méthode propre à l'application qui sera appelée après les tests
	after_test:function(){
		
	},
	
	
  // Initialisation des tests (à chaque lancement de test)
  initialize:function(){
    // Pour mettre des valeurs à passer
    APP.TestValues = {}
    
  },
  
  Synopsis:{/* Les synopsis définis dans le dossier `./tests/lib/synopsis/' */}
  
}