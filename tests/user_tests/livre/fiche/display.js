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
  ["Test des éléments qu'on trouve dans toute fiche",     FicheDisplay_of_regular_fiche],
  ["Test des éléments propres à un livre",                FicheDisplay_of_a_book],
  ["Test des éléments propres à un paragraphe",           FicheDisplay_of_an_paragraph]
  ]

}

function FicheDisplay_Preparation() {
  with(APP)
  {
    FICHES.list = {}
    $('section#table').html("")
  }
}

function FicheDisplay_of_regular_fiche() {
  var titre = "Le titre de la page "+Time.now()
  APP.ipage = new APP.Page({titre:titre})
  APP.ipage.create ;
  var id  = APP.ipage.id
  var jid = APP.ipage.jid
  
  jq(jid).should.be.visible
  jq(jid + ' > div.poignee').should.be.visible
  jq(jid + ' > recto').should.be.visible
  jq(jid + ' > verso').should.exist
  jq(jid + ' > verso').should_not.be.visible
  
  blue("Test de la présence des éléments du recto")
  w("Le titre")
  var inpTitre = jq(jid + ' > recto > input.titre') ;
  inpTitre.should.be.visible
  inpTitre.should.have.attribute('id', jid+'-titre')
  inpTitre.should.contain(titre)
  w("Les items")
  var divItems = jq(jid + ' > recto > div.items')
  divItems.should.be.visible
  
  blue("Test de la présence des éléments du verso")
}

function FicheDisplay_of_a_book() {
  pending("Implémenter le test d'un livre")
  // TODO Il doit avoir un champ "titre réel" (-> real_titre)
}

function FicheDisplay_of_an_paragraph() {
  pending("Implémenter le test de l'affichage d'un paragraphe")
  // TODO Le paragraphe ne doit pas avoir de titre
}