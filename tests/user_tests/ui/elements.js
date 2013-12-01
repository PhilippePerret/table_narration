// pjst
// 
// Test de la présence des éléments nécessaires
// 
// Pour jouer ce test : ui/elements

function ui_elements() {
  my = ui_elements
  
  my.step_list = [
  ["Vérification de la table de travail",UI_Verification_Table_travail],
  ["Vérification de l'entête", UI_Verification_Entete],
  ["Vérification des éléments divers",UI_Verification_elements_divers],
  "Fin" // juste pour virgule
  ]
  
  switch(my.step)
  {
  case "Fin":
    break
    
  default:
    pending("Il faut implémenter le test "+my.step)
  }
}


function UI_Verification_Table_travail() {
  specs("On doit trouver la section#table")
  jq('section#table').should.exist
}

function UI_Verification_Entete() {
  specs("Vérification de l'entête, qui contient les principaux outils.")
  
  blue("On doit trouver une section header contenant les outils principaux")
  // La section header
  jq('section#header').should.exist
  
  blue("Doit contenir les outils permettant de créer des fiches")
  L(APP.FICHES.datatype).each(function(type, dtype){
    jq('section#header div.card_tool[data-type="'+type+'"]#card_tool-'+type).should.exist
  })
  
  blue("Marque de l'état de l'enregistrement de la collection")
  jq('section#header div#mark_saved').should.exist
  var saved_no = jq('section#header div#mark_saved span#mark_saved_no')
  saved_no.should.exist
  saved_no.should_not.be.visible
  var saved_yes = jq('section#header div#mark_saved span#mark_saved_yes')
  saved_yes.should.exist
  saved_yes.should.be.visible
  var saved_forbid = jq('section#header div#mark_saved span#mark_saved_forbidden')
  saved_forbid.should.exist
  saved_forbid.should_not.be.visible
  
  
}

function UI_Verification_elements_divers() {
  blue("On doit trouver un div#flash")
  jq('div#flash').should.exist
  jq('div#flash').should_not.be.visible
}
