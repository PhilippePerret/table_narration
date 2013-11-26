// pjst
// 
// Test de la présence des éléments nécessaires
// 
// Pour jouer ce test : ui/elements

function ui_elements() {
  my = ui_elements
  
  my.step_list = [
  "Vérification de la table de travail",
  "Vérification de l'entête",
  "Vérification des éléments divers"
  ]
  
  switch(my.step)
  {
  case "Vérification de la table de travail":
    UI_Verification_Table_travail()
    break
  case "Vérification de l'entête":
    UI_Verification_Entete()
    break
    
  case "Vérification des éléments divers":
    UI_Verification_elements_divers()
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
  specs("On doit trouver une section header contenant les outils principaux")
  // La section header
  jq('section#header').should.exist
  
}

function UI_Verification_elements_divers() {
  blue("On doit trouver un div#flash")
  jq('div#flash').should.exist
  jq('div#flash').should_not.be.visible
}
