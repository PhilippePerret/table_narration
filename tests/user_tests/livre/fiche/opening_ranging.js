/*
 * To run this test : livre/fiche/opening_ranging
 */
function livre_fiche_opening_ranging()
{
  my = livre_fiche_opening_ranging
  
  my.specs = "Test des méthodes qui ouvre, ferme, range et unrange une fiche"
  
  my.step_list = [
  // ["Existence des méthodes utiles", FicheRange_Methodes_utiles],
  ["Test de l'ouverture simple des fiches suivant leur type", Fiche_Test_open_simple_by_type],
  // ["Test de l'ouverture d'enfants suivant leur type", Fiche_Test_open_children],
  // ["Test du rangement simple", FicheRange_Test_simple],
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

function FicheRange_Methodes_utiles() {
  var props = [
  'open', 'close', 'unrange', 'range', 'clone', 'clone_in_parent', 'html_clone',
  'titre_in_input', 'titre_in_div'
  ]
  L(props).each(function(prop){'Fiche.prototype'.should.have.property(prop)})
  
}

function Fiche_Test_open_simple_by_type() {
  specs("Suivant le type de la fiche, l'ouverture produit un résultat différent."+
  "\nL'ouverture “simple” signifie que les éléments n'ont pas de parent (orphelins)")
  
  APP.FICHES.init_all
  blue("Ouverture d'un livre")
  w("@rappel: Une fiche est toujours créée ouverte par défaut")
  var book = APP.ibook = create_book({titre:"Un livre"})
  Keyboard.press(K_RETURN)
  var book_items = jq(book.items_jid)
  var book_real_titre = jq(book.real_titre_jid)
  book_items.should.exist
  book_real_titre.should.exist
  return
  'ibook.opened'.should.be.true
  book_items.should.be.visible
  jq('input#'+book.titre_id).should.exist
  jq('div#'+book.titre_id).should_not.exist
  w("On ferme le livre")
  book.close // <-- TEST
  book_items.should_not.be.visible
  book_real_titre.should_not.be.visible
  jq('input#'+book.titre_id).should_not.exist
  jq('div#'+book.titre_id).should.exist
  w("On ouvre le livre")
  book.open // <-- TEST
  book_items.should.be.visible
  book_real_titre.should.be.visible
  jq('input#'+book.titre_id).should.exist
  jq('div#'+book.titre_id).should_not.exist
  
  blue("Ouverture d'un chapitre")
  var chap = APP.ichap = APP.FICHES.full_create({type:'chap'})
  var chap_items = jq(chap.items_jid)
  chap_items.should.exist
  chap_items.should.be.visible // toujours
  'ichap.opened'.should.be.true // toujours
  jq('input#'+chap.titre_id).should.exist
  jq('div#'+chap.titre_id).should_not.exist
  w("On ferme le chapitre")
  chap.close // <-- TEST
  'ichap.opened'.should.be.true
  chap_items.should.be.visible // toujours
  jq('input#'+chap.titre_id).should_not.exist
  jq('div#'+chap.titre_id).should.exist
  w("On ouvre le chapitre")
  chap.open // <-- TEST
  'ichap.opened'.should.be.true
  chap_items.should.be.visible // toujours
  jq('input#'+chap.titre_id).should.exist
  jq('div#'+chap.titre_id).should_not.exist
  
  blue("Ouverture d'une page")
  var page = APP.ipage = APP.FICHES.full_create({type:'page'})
  var page_titre = jq(page.titre_jid)
  var page_items = jq(page.items_jid)
  page_titre.should.exist
  page_items.should.exist
  'ipage.opened'.should.be.true
  page_titre.should.be.visible
  page_items.should.be.visible
  w("On ferme la page")
  page.close // <-- TEST
  jq('input#'+page.titre_id).should_not.exist
  jq('div#'+page.titre_id).should.exist
  page_titre.should.be.visible
  page_items.should_not.be.visible
  w("On ouvre la page")
  page.open // <-- TEST
  page_titre.should.be.visible
  page_items.should.be.visible
  jq('input#'+page.titre_id).should.exist
  jq('div#'+page.titre_id).should_not.exist
  
  blue("Ouverture d'un paragraphe (ne doit rien changer)")
  var para = APP.ipara = APP.FICHES.full_create({type:'para'})
  var para_texte = jq(para.texte_jid)
  para_texte.should.exist
  para_texte.should.be.visible
  'ipara.opened'.should.be.false // toujours
  w("On ferme le paragraphe")
  para.close // <-- TEST
  para_texte.should.be.visible
  'ipara.opened'.should.be.false // toujours
  w("On ouvre le paragraphe")
  para.open // <-- TEST
  para_texte.should.be.visible
  'ipara.opened'.should.be.false // toujours
  
}

function FicheRange_Test_simple() {
  specs("Le test simple signifie qu'on a déjà un enfant (page) dans un parent "+
  "(chapitre) et qu'on va simplement l'ouvrir puis le ranger")
  APP.FICHES.init_all
  
  
  // Création du chapitre
  var chap = APP.ichap = APP.FICHES.full_create( {type:'chap'} )
  // Création de la page
  var page = APP.ipage = APP.FICHES.full_create( {type:'page'} )
  
  blue("La méthode `html_clone` doit retourner le bon code")
  'page.html_clone'.should.contain('<fiche id="clone'+page.dom_id+'" class="fiche page clone"')
  'page.html_clone'.should.contain('<recto')
  'page.html_clone'.should.contain('<div id="'+page.dom_id_clone+'-titre" class="titre"')

  w("On ajoute une page à un chapitre et on ouvre la page")
  chap.add_child( page )
  page.open // <-- TEST
  'ipage.ranged'.should.be.false
  'ipage.opened'.should.be.true
  
  w("On ferme la page")
}

function Fiche_Test_open_children() {
  switch(my.stop_point)
  {
  case 1:
    specs("L'ouverture d'un enfant doit produire des résultats différents suivant "+
    "le type de la fiche")
  
    var book = APP.ibook = APP.FICHES.full_create({type:'book'})
    var book_items = jq(book.items_jid)
    var book_real_titre = jq(book.real_titre_jid)
    book_items.should.exist
    book_real_titre.should.exist
    'ibook.opened'.should.be.true
  
    blue("Ouverture d'un chapitre appartenant à un livre")
    w("@note: Pour le moment, ça ne produit rien, puisque le "+
    "chapitre reste toujours dans le livre auquel il appartient.")
    var chap = APP.ichap = APP.FICHES.full_create({type:'chap'})
    book.add_child( chap ) // <-- enfant
    var chap_items = jq(chap.items_jid)
    chap_items.should.exist
    chap_items.should.be.visible  // toujours
    'ichap.opened'.should.be.true // toujours
    'ichap.ranged'.should.be.true // Un ajout d'enfant le range toujours
    w("On ouvre le chapitre")
    chap.open // <-- TEST
    'ichap.opened'.should.be.true // toujours
    'ichap.ranged'.should.be.true // toujours
    chap_items.should.be.visible  // toujours
    w("On ferme le chapitre")
    chap.close // <-- TEST
    'ichap.opened'.should.be.true
    'ichap.ranged'.should.be.true
    chap_items.should.be.visible // toujours
  
    blue("Ouverture d'une page")
    specs("@note: C'est le cas le plus complexe puisque l'on doit créer un clone "+
    "de la fiche, qui restera dans le chapitre, tandis que la page sera ouverte "+
    "en dehors du chapitre.")
    var page = APP.ipage = APP.FICHES.full_create({type:'page'})
    w("Création de la page #"+page.id+" et insertion dans le chapitre #"+chap.id)
    chap.add_child( page ) // <-- enfant de chapitre
    var page_titre = jq(page.titre_jid)
    var page_items = jq(page.items_jid)
    page_titre.should.exist
    page_items.should.exist
    'ipage.opened'.should.be.false
    'ipage.ranged'.should.be.true
    w("On ouvre la page")
    page.open // <-- TEST
    page_titre.should.be.visible
    page_items.should.be.visible
    'ipage.opened'.should.be.true
    'ipage.ranged'.should.be.false
    w("On doit trouver le clone dans le chapitre")
    my.clone = jq(chap.jid+' > recto > div.items > fiche.clone#clone'+page.dom_id)
    my.clone.should.exist
    my.clone.should.be.visible
    page_titre.should.be.visible
    page_items.should.be.visible

    w("On ferme la page")
    page.close // <-- TEST
    my.wait.for(0).and(NEXT_POINT)    
    break
  case 2:
    var chap = APP.ichap
    var page = APP.ipage
    var page_titre = jq(page.titre_jid)
    var page_items = jq(page.items_jid)
    my.clone = jq(chap.jid+' > recto > div.items > fiche.clone#clone'+page.dom_id)
    my.clone.should_not.exist
    var fiche_in_chap = jq(chap.jid+' > recto > div.items > '+ page.jid)
    fiche_in_chap.should.exist
    fiche_in_chap.should.be.visible
    'ipage.ranged'.should.be.true
    'ipage.opened'.should.be.false
    page_titre.should.be.visible
    page_items.should_not.be.visible
    my.wait.for(0).and(NEXT_POINT)    
  case 3:
  
    blue("Ouverture d'un paragraphe enfant d'une page")
    var page = APP.ipage = APP.FICHES.full_create({type:'page'})
    var para = APP.ipara = APP.FICHES.full_create({type:'para'})
    page.add_child( para ) // <-- paragraphe enfant de la page
    var para_texte = jq(para.texte_jid)
    para_texte.should.be.visible
    'ipara.opened'.should.be.false // toujours
    'ipara.ranged'.should.be.true  // Toujours quand il a un parent
    w("On ouvre le paragraphe")
    para.open // <-- TEST
    'ipara.opened'.should.be.false // toujours
    'ipara.ranged'.should.be.true  // Toujours
    w("On ferme le paragraphe")
    para.close // <-- TEST
    'ipara.opened'.should.be.false // toujours
    'ipara.ranged'.should.be.true  // Toujours
    my.wait.for(0)
    break
  }
}