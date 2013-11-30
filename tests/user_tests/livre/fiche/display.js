/*
 * To run this test : livre/fiche/display
 */
function livre_fiche_display()
{
  my = livre_fiche_display
  
  my.specs = "Test de l'affichage des fiches (principalement pour voir si elles contiennent les "+
  "bons éléments HTML)"
  
  my.step_list = [
  ["Préparation du terrain",                              FicheDisplay_Preparation],
  ["Test des méthodes utiles à l'affichage",              FicheDisplay_Test_methods],
  ["Test des éléments qu'on trouve dans toute fiche",     FicheDisplay_of_regular_fiche],
  ["Test des éléments propres à un livre",                FicheDisplay_of_a_book],
  ["Test des éléments propres à un chapitre",             FicheDisplay_of_a_chapitre],
  ["Test des éléments propres à une page",                FicheDisplay_of_a_page],
  ["Test des éléments propres à un paragraphe",           FicheDisplay_of_an_paragraph],
  ["Test de la méthode `set_values`",                     FicheDisplay_Method_set_values],
  "Fin"
  ]

}

function FicheDisplay_Preparation() {
  with(APP)
  {
    FICHES.list = {}
    $('section#table').html("")
  }
}

function FicheDisplay_Test_methods() {
  var compprops = [
  'dom_id', 'jid', 
  'titre_jid', 'input_titre', 
  'items_jid', 'div_items'
  ]
  L(compprops).each(function(prop){ 'Fiche.prototype'.should.have.property(prop) })
  
  blue("Test du retour des propriétés")
  APP.ipage = new APP.Page()
  'ipage.titre_jid'.should = "input#"+APP.ipage.dom_id+"-titre"
  'ipage.items_jid'.should = "div#"+APP.ipage.dom_id+"-items"
  APP.ipage.create
  w("`input_titre` doit retourner l'élément jQuery du champ de titre")
  'ipage.input_titre'.should.be.defined
  'ipage.input_titre'.should.have.property('jquery')
  'ipage.input_titre'.should.respond_to('attr')
  w("`div_items` doit retourner l'élément jQuery du div des items")
  'ipage.div_items'.should.be.defined
  'ipage.div_items'.should.have.property('jquery')
  'ipage.div_items'.should.respond_to('attr')
}

function FicheDisplay_of_regular_fiche() {
  var titre = "Le titre de la page "+Time.now()
  APP.ipage = new APP.Page({titre:titre})
  APP.ipage.create ;
  var id  = APP.ipage.id
  var jid = APP.ipage.jid
  var dom_id = APP.ipage.dom_id
  
  jq(jid).should.be.visible
  jq(jid + ' > div.poignee').should.be.visible
  jq(jid + ' > recto').should.be.visible
  jq(jid + ' > verso').should.exist
  jq(jid + ' > verso').should_not.be.visible
  
  blue("Test de la présence des éléments du recto")
  w("Le titre")
  var inpTitre = jq(jid + ' > recto > input.titre') ;
  inpTitre.should.be.visible
  inpTitre.should.have.attribute('id', dom_id+'-titre')
  inpTitre.should.contain(titre)
  w("Les items (cachés par défaut, si la fiche n'est pas ouverte)")
  var divItems = jq(jid + ' > recto > div.items')
  divItems.should.exist
  divItems.should_not.be.visible
  divItems.should.be.empty
  w("J'ouvre la fiche pour voir si ses éléments vont se révéler")
  APP.ipage.open // <-- TEST
  divItems.should.be.visible
  
  blue("Test de la présence des éléments du verso")
}

function FicheDisplay_of_a_book() {
  with(APP){ $('section#table').html('') }
  // Propriétés complexes et simples
  var props = [
  'real_titre', 'real_titre_jid', 'input_real_titre'
  ]
  L(props).each(function(prop){ 'Book.prototype'.should.have.property( prop ) })

  APP.ibook = new APP.Book()
  APP.ibook.create
  var id = APP.ibook.id
  
  blue("Le `real_titre` du livre")
  'ibook.real_titre_jid'.should = 'input#'+APP.ibook.dom_id+'-real_titre'
  'Book.prototype'.should.have.property('input_real_titre')
  'ibook.input_real_titre'.should.be.defined
  'ibook.input_real_titre'.should.have.property('jquery')
  inpRealTitre = jq(APP.ibook.real_titre_jid)
  inpRealTitre.should.be.visible
  inpRealTitre.should.have.class('real_titre')
  inpRealTitre.should.contain("")
  var titre_reel = "Un titre "+Time.now()+" bien réel"
  APP.ibook.real_titre = titre_reel
  inpRealTitre.should.contain(titre_reel)
  
  pending("Poursuivre l'affichage propre d'un Book")
  
  blue("Ouvert, le livre doit afficher ses chapitres et les titres des pages")
  
  blue("Fermé, le livre ne doit afficher que son titre de référence")
  APP.ibook.close
  jq(APP.ibook.titre_jid).should.be.visible
  jq(APP.ibook.real_titre_jid).should_not.be.visible
  jq(APP.ibook.items_jid).should_not.be.visible
  APP.ibook.open
  jq(APP.ibook.titre_jid).should.be.visible
  jq(APP.ibook.real_titre_jid).should.be.visible
  jq(APP.ibook.items_jid).should.be.visible
}

function FicheDisplay_of_a_chapitre() {
  pending("Implémenter le test de l'affichage d'un chapitre")
}

function FicheDisplay_of_a_page() {
  pending("Implémenter le test de l'affichage d'une page")
}
function FicheDisplay_of_an_paragraph() {
  with(APP){ $('section#table').html('') }
  // Propriétés complexes et simples
  var props = [
  'texte', 'texte_jid', 'input_texte'
  ]
  L(props).each(function(prop){ 'Paragraph.prototype'.should.have.property( prop ) })
  
  APP.ipara = new APP.Paragraph()
  APP.ipara.create
  
  blue("Le `texte` du paragraphe")
  'ipara.texte_jid'.should = "textarea#"+APP.ipara.dom_id+'-texte'
  'ipara.input_texte'.should.be.defined
  'ipara.input_texte'.should.have.property('jquery')
  var inpTexte = jq(APP.ipara.texte_jid)
  inpTexte.should.be.visible
  inpTexte.should.have.class('texte')
  inpTexte.should.contain( "" )
  var txt = "Un texte à "+Time.now()+" pour mettre dans le paragraphe."
  APP.ipara.texte = txt // <-- TEST
  inpTexte.should.contain( txt )
  
  pending("Poursuivre le test de l'affichage d'un paragraphe")
  // TODO Le paragraphe doit se servir du titre comme d'un indice
}

function FicheDisplay_Method_set_values() {
  APP.ipage = new APP.Page()
  if(!'ipage'.have.property('set_values')){return failure("LA MÉTHODE `Fiche.set_values` doit exister pour pouvoir la tester")}

  var dom_id = APP.ipage.dom_id;
  APP.ipage.create
  
  var titre  = "Titre de la page "+Time.now()
  APP.ipage.titre = titre
  
  jq(APP.ipage.titre_jid).should.be.empty
  jq(APP.ipage.items_jid).should.be.empty
  
  APP.ipage.set_values ; // <-- TEST
  
  var div_items = jq(APP.ipage.items_jid)
  jq(APP.ipage.titre_jid).should = titre 
  div_items.should.be.empty
  
  APP.ipara1 = new APP.Paragraph({texte:"Le paragraphe 1"})
  APP.ipara1.create
  APP.ipara2 = new APP.Paragraph({texte:"Le paragraphe 2"})
  APP.ipara2.create
  APP.ipara3 = new APP.Paragraph({texte:"Le paragraphe 3"})
  APP.ipara3.create

  w("On met un premier paragraphe dans la page")
  APP.ipage.add_child( APP.ipara1)
  jq(APP.ipage.items_jid).should_not.be.empty
  div_items.should.contain('<fiche id="'+APP.ipara1.dom_id+'"')
  div_items.should_not.contain('<fiche id="'+APP.ipara2.dom_id+'"')
  div_items.should_not.contain('<fiche id="'+APP.ipara3.dom_id+'"')
  w("On met le deuxième paragraphe dans la page")
  APP.ipage.add_child( APP.ipara2)
  div_items.should.contain('<fiche id="'+APP.ipara1.dom_id+'"')
  div_items.should.contain('<fiche id="'+APP.ipara2.dom_id+'"')
  div_items.should_not.contain('<fiche id="'+APP.ipara3.dom_id+'"')
  jq(APP.ipara2.dom_id).should.be.after( APP.ipara1.dom_id )
  w("On met le troisième paragraphe dans la page, mais avant le premier")
  APP.ipage.add_child( APP.ipara3, APP.ipara1 )
  div_items.should.contain('<fiche id="'+APP.ipara1.dom_id+'"')
  div_items.should.contain('<fiche id="'+APP.ipara2.dom_id+'"')
  div_items.should.contain('<fiche id="'+APP.ipara3.dom_id+'"')
  jq(APP.ipara3.dom_id).should.be.before( APP.ipara1.dom_id )
  
}