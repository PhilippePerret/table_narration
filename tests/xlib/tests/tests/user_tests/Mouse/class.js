function LaDerniere(){
	alert("Je passe dans la dernière")
}
function Mouse_class() {
	
	my = this.Mouse_class
	
	if(undefined == my.step_list) my.set_step_list([
		"Première étape",
		"Deuxième étape"
		])
		
	my.define_work
	
	if(my.step_is("Première étape")){
		if(undefined == my.stop_point){
      // console.log("---> Première étape")
			return my.proxy(1)
		}
		else if (my.stop_point == 1){
      // console.log("---> stop point 1")
			return my.proxy(window.LaDerniere)
		}
	}
	else if (my.step_is("Deuxième étape")){
		console.log("---> deuxième étape")
		return my.step_end
	}
	else { 
		console.log("La fin")
		my.end
	}
}