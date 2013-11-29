/*
 * To run this test : livre/fiche/creation
 */
function livre_fiche_creation()
{

  my = livre_fiche_creation
  
  my.specs =  "Test de la création complète d'une fiche, depuis la demande de création jusqu'à "+
              "la construction de sa fiche sur la table de travail."
  
  my.step_list = [
  ["Préparation du test de création des fiches", FicheCreation_Preparation],
  ["Vérification des méthodes/propriétés complexes utiles", FicheCreation_methodes_utiles],
  ["Construction du code HTML", FicheCreation_code_html_de_la_fiche],
  ["Construction de la fiche sur la table de travail", FicheCreation_Construction_de_la_fiche],
  ["Création de la fiche sur la table de travail", FicheCreation_Creation_de_la_fiche]
  
  ]

  switch(my.step)
  {
    
  default:
    pending("Step '"+my.step+"' should be implanted")
  }
}

function FicheCreation_Preparation() {
  with(APP)
  {
    $('section#table').html('')
    FICHES.list = {}
  }
}
function FicheCreation_methodes_utiles() {
  APP.ibook = new APP.Book()
  var compprops = [
  'create', 'build', 'save', 'html', 'html_recto', 'html_verso'
  ]
  L(compprops).each(function(prop){'ibook'.should.have.property(prop)})
}

function FicheCreation_code_html_de_la_fiche() {
  APP.ipage = new APP.Page()
  'ipage'.should.have.property('html')
  'ipage.html'.should_not.be.null
  'ipage.html'.should.contain('<fiche id="f-'+APP.ipage.id+'"')
  'ipage.html'.should.contain('class="fiche page')
  'ipage.html'.should.contain('<div class="poignee"></div>')
  'ipage.html'.should.contain('<recto id="'+APP.ipage.dom_id+'-recto"')
  'ipage.html'.should.contain('</recto>')
  'ipage.html'.should.contain('<verso id="'+APP.ipage.dom_id+'-verso"')
  'ipage.html'.should.contain('</verso>')
  'ipage.html'.should.contain('</fiche>')
  
  w("Les autres tests sont fait dans le test livre/fiche/display.js")
}
function FicheCreation_Construction_de_la_fiche() {
  
  if(APP.ichap != undefined)
  {
    id_chap = APP.ichap.id
  }
  
  switch(my.stop_point)
  {
  case 1:
    APP.ichap = new APP.Chapter()
    var id_chap = APP.ichap.id
    APP.ichap.dispatch({
      top:200, left:600, ranged:false
    })
    if(APP.ichap.obj) APP.ichap.obj.remove()
  
    APP.ichap.build // <-- TEST
    my.wait.for( 1, "Construction (build) de la fiche…" ).and( NEXT_POINT )
    break
  case 2:
    var ofiche = jq(APP.ichap.jid)
    ofiche.should.exist
    ofiche.should.be.visible
    ofiche.should.be.at( 600, 200)
    w("@note: build construit une fiche fermée")
    ofiche.should_not.have.class('opened')
    'ichap.opened'.should.be.false
    my.wait.for(0)
    break
  }
}

// À la différence de la méthode `build', la méthode `create' va ouvrir
// la fiche.
function FicheCreation_Creation_de_la_fiche() {
  APP.ichap = new APP.Chapter()
  var id_chap = APP.ichap.id
  APP.ichap.dispatch({
    top:100, left:400, ranged:false
  })
  if(APP.ichap.obj) APP.ichap.obj.remove()
  
  APP.ichap.create ; // <-- TEST
  
  ('FICHES.list['+APP.ichap.id+']').should.be.defined ;
  ('FICHES.list['+APP.ichap.id+'].class').should = "Fiche" ;
  ('FICHES.list['+APP.ichap.id+'].type').should = "chap" ;
  var ofiche = jq(APP.ichap.jid)
  ofiche.should.be.visible
  ofiche.should.be.at( 400, 100)
  'ichap.opened'.should.be.true
  ofiche.should.have.class('opened')
}