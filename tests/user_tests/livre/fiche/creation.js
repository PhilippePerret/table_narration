/*
 * To run this test : livre/fiche/creation
 */
function livre_fiche_creation()
{

  my = livre_fiche_creation
  
  my.specs =  "Test de la création complète d'une fiche, depuis la demande de création jusqu'à "+
              "la construction de sa fiche sur la table de travail."
  
  my.step_list = [
  // ["Préparation du test de création des fiches", FicheCreation_Preparation],
  // ["Vérification des méthodes/propriétés complexes utiles", FicheCreation_methodes_utiles],
  // ["Construction du code HTML", FicheCreation_code_html_de_la_fiche],
  // ["Construction de la fiche sur la table de travail", FicheCreation_Construction_de_la_fiche],
  // ["Création de la fiche sur la table de travail", FicheCreation_Creation_de_la_fiche],
  ["Test du fonctionnement des observers", FicheCreation_Fonction_observers],
  "Fin"
  ]

  switch(my.step)
  {
  case "Fin":
    break
    
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
  'create', 'build', 'save', 'html', 'html_recto', 'html_verso', 'observe'
  ]
  L(compprops).each(function(prop){'ibook'.should.have.property(prop)})
}

function FicheCreation_code_html_de_la_fiche() {
  APP.ipage = new APP.Page()
  'ipage'.should.have.property('html')
  'ipage.html'.should_not.be.null
  'ipage.html'.should.contain('<fiche id="f-'+APP.ipage.id+'"')
  'ipage.html'.should.contain('class="fiche page')
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

function FicheCreation_Fonction_observers() {
  switch(my.stop_point)
  {
  case 1:
    specs("Ce test permet de savoir si les observers ont bien été placés sur la fiche."+
    "\nLe test se fait sur tous les types de fiche.")
  
    APP.ipage = new APP.Page({titre:"Titre au départ"})
    var page = APP.ipage
    page.create
    page.deselect
  
    w("La touche tabulation ne doit pas retourner la fiche")
    Keyboard.press(APP.K_TAB)
    jq(page.recto_jid).should.be.visible
    jq(page.verso_jid).should_not.be.visible
    'ipage.retourned'.should.be.false
  
    blue("Cliquer sur la fiche doit la sélectionner")
    jq(page.jid).click // <-- TEST
    'ipage.selected'.should.be.true
    jq(page.jid).should.have.class('selected')
    
    blue("La sélection de la fiche doit avoir activé les raccourcis clavier propres")
    w("On presse la touche tabulation pour retourner la fiche")
    Keyboard.press(APP.K_TAB)
    jq(page.recto_jid).should_not.be.visible
    jq(page.verso_jid).should.be.visible
    'ipage.retourned'.should.be.true
    w("Tabulation à nouveau pour remettre la fiche au recto")
    Keyboard.press(APP.K_TAB)
    jq(page.recto_jid).should.be.visible
    jq(page.verso_jid).should_not.be.visible
    'ipage.retourned'.should.be.false
      
    blue("Focusser dans le titre doit changer son style")
    w("Le test ne peut pas être exécuté, car il faudrait basculer vers l'application")
    jq(page.input_titre_jid).should_not.have.class('focused')
    jq(page.input_titre_jid).obj.select() // <-- TEST
    jq(page.input_titre_jid).should.have.class('focused')
    jq(page.input_titre_jid).obj[0].blur() // <-- TEST
    jq(page.input_titre_jid).should_not.have.class('focused')
    
    blue("Modifier le titre doit changer le titre et mettre la fiche modifiée")
    my.new_titre = "Un titre donné à " + Time.now()
    jq(page.input_titre_jid).val(my.new_titre)
    'ipage._titre'.should = my.new_titre
    
    blue("Modifier le titre réel d'un livre doit modifier la fiche")
    APP.ibook = new APP.Book({real_titre:"Le titre réel au départ"})
    var book = APP.ibook
    book.create
    var new_real_titre = "Un nouveau titre réel à "+Time.now()
    jq(book.real_titre_jid).val(new_real_titre)
    'ibook._real_titre'.should = new_real_titre
    
    blue("Focusser dans un champ d'édition doit régler la gestion propre des touches")
    jq(page.input_titre_jid).obj.select() // <-- TEST
    Keyboard.press({meta:true, key_code:APP.Key_F})
    // TODO Implémenter la vérification

    my.wait.for(0).and(NEXT_POINT)
    break
  case 2:
    var page = APP.ipage

    my.wait.for(0).and(NEXT_POINT)
    break
  case 3:
    my.wait.for(0)
  }
  
}