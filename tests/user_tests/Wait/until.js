/*
 *	Test de la méthode `Wait.until`.
 *
 *	Note	Ce sont les mêmes tests que `Wait.while` mais en utilisant `until`.
 *
 *  Pour le jouer, entrer dans le fichier de fichier :
 *      pure_js_tests/Wait/until
 */
function pure_js_tests_Wait_until(poursuivre){
	
	I = pure_js_tests_Wait_until
	
	if(I.dont_know_step_list){
    
    specs("Tests complets de la méthode Wait.until qui doit permettre d'attendre qu'une "+
          "condition soit remplie. En cas d'erreur on produit un échec ou on appelle une " +
          "méthode propre. En cas de succès, on retourne au script ou on appelle une méthode " +
          "définie.")
    
		I.set_step_list_to([
      "Essai régulier",
      "Contrôle du temps de l'étape normale",
      "Essai avec un temps raccourci",
      "Contrôle du temps d'un wait raccourci",
      "Essai avec une méthode appelée en cas d'échec",
      "Contrôle de la méthode appelée en cas d'échec",
      "Essai d'une méthode appelée en cas de succès",
      "Controle de la méthode appelée en cas de succès",
      "Essai en modifiant le laps de temps entre les essais",
      "Controle de la modification du laps de temps",
      "Modification des messages rapport"
		])
    
    
	}
	
	I.define_work
	
	if(I.run_step(
    
    
    "Essai régulier"
  
  )){
		db("Pas de panique, on doit aller jusqu'au bout de la boucle until");
		I.start = Time.now()
    APP.tested = 12
		I.wait.until(
      function(){return false},
      {failure:function(bool){db("Atteinte du bout de Wait.until")}/* pour ne pas générer d'erreur*/}
		)
	}
	else if(I.run_step(
    
    
    "Contrôle du temps de l'étape normale"
  
  )){
		duree = Time.now() - I.start;
		duree = (parseInt(duree/100,10)/10);
		db("La durée du wait a été d'à peu près "+duree+" secs (arrondi).");
		if( duree > 19 && duree < 21 ) success("Le temps est bon");
		else failure("La durée du wait est incorrecte (devrait être entre 19 et 21)")
		I.end_step
	}
	
	else if(I.run_step(
    
    
    "Essai avec un temps raccourci"
  
  
  )){
		I.start = Time.now();
		I.wait.until(
			function(){return false}, 
      {max_time:3, failure:function(bool){db("Atteinte du bout de Wait.until")}/* pour ne pas générer d'erreur*/}
		)
	}

	else if(I.run_step(
    
    
    "Contrôle du temps d'un wait raccourci"
  
  
  )){
		duree = Time.now() - I.start;
		duree = (parseInt(duree/100,10)/10);
		db("La durée du wait a été d'à peu près "+duree+" secs (arrondi).");
		if( duree > 2 && duree < 4 ) success("Le temps est bon");
		else failure("La durée du wait est incorrecte (devrait être entre 2 et 4 secondes)")
		I.end_step
	}
	
	else if(I.run_step(
    
    
    "Essai avec une méthode appelée en cas d'échec"
  
  
  )){
		I.wait.until(
			function(){return false}, 
			{max_time:2, failure:function(bool){success("<div id=\"failure_called\"> La méthode failure a bien été appelée</div>")}}
		)
	}
	
	else if(I.run_step(
    
    
    "Contrôle de la méthode appelée en cas d'échec"
  
  
  )){
		if($('div#rapport').length == 0) failure("Bizarrement, je ne trouve pas le div#rapport…");
		if($('div#rapport div#failure_called').length == 0) failure("La méthode d'échec n'a pas été appelée…");
		else success("OK");
		I.end_step
	}
	
	if(I.run_step(
    
    
    "Essai d'une méthode appelée en cas de succès"
  
  
  )){
		jusqua = Time.now() + 2000;
		I.wait.until(
			function(){return Time.now() > jusqua}, 
			{max_time:5, success:function(bool){success("<div id=\"success_called\"> La méthode success a bien été appelée !</div>")}}
		)
	}
	else if(I.run_step(
    
    
    "Controle de la méthode appelée en cas de succès"
  
  
  )){
		if($('div#rapport div#success_called').length == 0) failure("La méthode success n'a pas été appelée…");
		else success("OK");
		I.end_step
	}
	else if(I.run_step(
    
    
    "Essai en modifiant le laps de temps entre les essais"
  
  
  )){
		I.calls = [];
		I.wait.until(
			function(){I.calls.push(Time.now());return false}, 
			{max_time:10, laps:2*1000, failure:function(bool){db("Fin normale de la boucle Wait.until")}}
		)
	}
	else if(I.run_step(
    
    
    "Controle de la modification du laps de temps"
  
  
  )){
		if(undefined==I.calls) failure("`I.calls` devrait être défini pour tester les valeurs");
		else{
			// Il doit y avoir en gros deux seconds entre chaque appel
			erreur = false;
			for(var i=0, len=I.calls.length; i<len; ++i){
				if(i == 0) continue ; // passer la première
				var avant = I.calls[i-1];
				var apres = I.calls[i];
				var inter = parseInt((apres-avant)/1000,10);
				if(inter != 2){
					if(false == erreur) erreur = [];
					erreur.push(inter+" msecs entre l'appel "+(i-1)+" et l'appel "+i);
				}
			}
			if(false == erreur) success("La modification du laps de temps est opérationnelle.");
			else{
				failure("Il n'y a pas 2 secondes entre chaque appel test de la méthode Wait.until :\n"+
								erreur.join("\n"));
			}
		}
		I.end_step
	}
	else if(I.run_step(
    
    
    "Modification des messages rapport"
  
  
  )){
		
    if(I.must_stop_at( 0 )){
      I.start = Time.now()
  		I.wait.until(function(){return false}, {
        next_stop_point:1,
  			max_time: 5, 
        failure_message:"Je n'ai pas tenu 5 secondes",
  			message:"Je vais attendre seulement 5 secondes"
  		})
    }
    else if (I.must_stop_at( 1 )){
      APP.laps = Time.now() - I.start
      'laps'.should.be.between(4*1000, 7*1000)
      var deux_lasts = get_lasts_div_rapport(4, all = true)
      APP.avant_derniere_ligne_rapport  = deux_lasts[2]
      APP.derniere_ligne_rapport        = deux_lasts[3]
      'avant_derniere_ligne_rapport'.should.contain("Je n'ai pas tenu 5 secondes")
      'derniere_ligne_rapport'.should.contain("Je vais attendre seulement 5 secondes")
      I.end_step_with(2)
    }
    else if(I.must_stop_at( 2 ){
      w("Il faudra implémenter ici la suite", BLUE)
      I.end_step
    }
	}
	
}