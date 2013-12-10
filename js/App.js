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
    Ajax.send({script:"tests/mode_test"}, $.proxy(this.suite_test, this))
	},
  suite_test:function(rajax)
  {
    if(rajax.ok)
    {
      F.show("Cliquer sur le bouton “-> Mode normal” pour revenir à la collection originale"+
      "\n\nDossier courant : " + rajax.current_folder, {keep:true})
      Collection.load
      $('input#btn_test').hide()
      $('input#btn_collection_originale').show()
    }
    else
    {
      F.error(rajax.message)
    }
  },
  
  // Repasser en mode normal (ce qui aura surtout pour effet de remettre le
  // dossier collection courante)
  mode_normal:function()
  {
    Ajax.send({script:"tests/mode_normal"}, $.proxy(this.suite_mode_normal,this))
  },
  suite_mode_normal:function(rajax)
  {
    if(rajax.ok)
    {
      F.show("Retour au mode normal. Rechargement de la collection en cours."+
      "\n\nDossier courant : " + rajax.current_folder, {keep:true})
      Collection.load
      $('input#btn_test').show()
      $('input#btn_collection_originale').hide()
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