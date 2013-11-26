
function essai(poursuivre){
	
	I = essai
	
	if(I.dont_know_step_list){
		
		specs("Ceci est juste un script d'essai pour voir si tout est OK. Il ne teste pas encore "+
					"votre application puisque je ne la connais pas…")
		
		I.set_step_list_to([
			"Première étape",
			"Deuxième étape",
			"Troisième étape",
			"Quatrième étape"
			])
			
	}
	
	I.define_work



	if( I.run_step( 
		
		
		"Première étape" 
	
	
	)){
		db("La première étape est jouée, elle teste si le fichier ./tests.php existe bien.");
		I.wait.until(function(){return TFile.exists('./tests.php')});
	}
	else if ( I.run_step(
		
		
		"Deuxième étape"
	
	
	)){
		db("La deuxième étape est jouée, c'est juste une attente de 4 secondes");
		if(TFile.resultat == true) success("Le fichier ./tests.php existe !")
		else { 
			failure("Malheureusement, je ne trouve pas le fichier ./tests.php…")
		}
		
		I.wait.for(4);
	}
	else if ( I.run_step(
		
		
		3
	
	
	)){
		db("La troisième étape est jouée simplement en donnant un indice d'étape dans `I.run_step`");
		w("Dans cette étape, je vais donner des valeurs à l'application et les tester.", BLUE)
		
		APP._une_valeur_test = 12
		
		'_une_valeur_test'.should_not.be.a_string
		'_une_valeur_test'.should_not.be.an_array
		'_une_valeur_test'.should.be.a_number
		'_une_valeur_test'.should_not.be.eq(13)
		'_une_valeur_test'.should.be.eq(12)
		'_une_valeur_test'.should.be.greater_than(11)
		'_une_valeur_test'.should.be.less_than(13)
		
		I.wait.for( 3 );

	}

	else if( I.run_step(
		
		
		"Quatrième étape"
	
	
	)){
		if(I.must_stop_at(0)){
			db("C'est un premier stop-point")
			I.go_to_stop_point(1)
		}
		else if(I.must_stop_at(1)){
			db("C'est un deuxième stop-point")
			I.go_to_stop_point(2)
		}
		else if(I.must_stop_at(2)){
			db("C'est le dernière point d'arrêt")
			I.end_step
		}
	}

}
