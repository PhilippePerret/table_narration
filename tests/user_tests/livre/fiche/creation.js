/*
 * To run this test : livre/fiche/creation
 */
function livre_fiche_creation()
{
  my = livre_fiche_creation
  
  my.specs =  "Test de la création complète d'une fiche, depuis la demande de création jusqu'à "+
              "la construction de sa fiche sur la table de travail."
  
  my.step_list = [
  ["Vérification des méthodes/propriétés complexes utiles", FicheCreation_methodes_utiles],
  ["Construction du code HTML", FicheCreation_code_html_de_la_fiche],
  ["Création de la fiche sur la table de travail", FicheCreation_Creation_de_la_fiche]
  
  ]

  switch(my.step)
  {
  default:
    pending("Step '"+my.step+"' should be implanted")
  }
}


function FicheCreation_methodes_utiles() {
  APP.ibook = new APP.Book()
  var compprops = [
  'create', 'build', 'save', 'html'
  ]
  L(compprops).each(function(prop){'ibook'.should.have.property(prop)})
}

function FicheCreation_code_html_de_la_fiche() {
  APP.ipage = new APP.Page()
  'ipage'.should.have.property('html')
  'ipage.html'.should_not.be.null
  'ipage.html'.should.contain('<fiche id="'+APP.ipage.id+'" ')
  'ipage.html'.should.contain('class="fiche page"')
  'ipage.html'.should.contain('</fiche>')
}

function FicheCreation_Creation_de_la_fiche() {
  APP.ichap = new APP.Chapter()
  var id_chap = APP.ichap.id
  'ichap'.should.have.property('build')
  APP.ichap.dispatch({
    top:200, left:600, ranged:false
  })
  if(APP.ichap.obj.length) APP.ichap.obj.remove()
  
  APP.ichap.build // <-- TEST
  
  var ofiche = jq('fiche#'+id_chap)
  ofiche.should.exist
  ofiche.should.be.visible
  ofiche.should.be.at( 600, 200)
}