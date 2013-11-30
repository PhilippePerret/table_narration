/*
 *	Objet App
 */
window.App = {
	
  // Pour lancer le test de l'application
  // 
  // @note: la méthode lance aussi un appel à un script ajax 
  // qui va mettre de côté la collection actuelle pour ne pas y 
  // toucher pendant les tests
	test:function()
	{
    window.open("./tests.php", 'pure-javascript-test')
    Ajax.send({script:"tests/backup_collection"}, $.proxy(this.suite_test, this))
	},
  suite_test:function(rajax)
  {
    if(rajax.ok)
    {
      
    }
    else
    {
      F.error(rajax.message)
    }
  },
  
  // Jouer 'App.ajax()' pour voir si le script ajax fonctionne
  ajax:function()
  {
    Ajax.send({
      script:"app/test_ajax",
      data:{}
    }, $.proxy(this.suite_ajax, this))
  },
  suite_ajax:function(rajax)
  {
    if(rajax.ok) alert("Tout s'est bien passé en ajax" +
    "\n\nRuby version: " + rajax.ruby_version)
  }
}