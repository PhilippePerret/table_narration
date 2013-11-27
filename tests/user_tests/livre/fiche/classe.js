//pjst

/*
 * Tests de la super classe Fiche
 *
 * Rappel : tous les livres, chapitres, pages, paragraphes, sont des enfants de
 *          Fiche.
 *
 *  Pour jouer ce test : livre/fiche/classe
 */

function livre_fiche_classe() {
  my = livre_fiche_classe
  
  my.step_list = [
  "Existence de la classe Fiche et de ses méthodes/propriétés",
  "Fonctionnement des propriétés basiques",
  "Fonctionnement des méthodes asynchrones",
  "Propriétés spéciales “parent” et “enfants”"
  ]
  switch(my.step)
  {
  case "Existence de la classe Fiche et de ses méthodes/propriétés":
    Fiche_Classe_et_methodes_principales()
    break
    
  case "Fonctionnement des propriétés basiques":
    Fiche_Fonctionnement_proprietes_basiques()
    break
    
  case "Fonctionnement des méthodes asynchrones":
    Fiche_Fonctionnement_methodes_asynchrones()
    break
    
    
  case "Propriétés spéciales “parent” et “enfants”":
    Fiche_Propriete_speciale_parent_et_enfants()
    break
    
  default:
    pending("Le test “`"+my.step+"`” doit être implémenté")
  }
    
}

function Fiche_Classe_et_methodes_principales() {
  'Fiche'.should.be.defined
  'Fiche'.should.be.a_function
  if('Fiche'.is_not.a_function) return ;
  
  APP.instance_Fiche = new APP.Fiche()
  
  // Propriétés
  var properties = [
  'id', 'created_at', 'type', 'class'
  ]
  L(properties).each(function(prop){'instance_Fiche'.should.have.property(prop)})
  
  // Pseudo-propriétés (propriétés complexes)
  var comp_properties = [
  'titre', 'updated_at', 'modified', 'resume', 'parent', 'enfants'
  ]
  L(comp_properties).each(function(prop){'Fiche.prototype'.should.have.property(prop)})
  
  // Méthodes
  var methods = [
  'dispatch', 'add_child', 'remove_child'
  ]
  L(methods).each(function(method){'Fiche.prototype'.should.respond_to(method)})
  
}

function Fiche_Fonctionnement_proprietes_basiques() {

  var now = NOW
  var current_last_id = 0 + APP.FICHES.last_id
  
  APP.instanceFiche = new APP.Fiche()
  
  blue("Class de fiche")
  'instanceFiche.class'.should = "Fiche"
  blue("Identifiant absolu de la fiche")
  'instanceFiche.id'.should_not.be.null
  'instanceFiche.id'.should = current_last_id + 1
  'FICHES.last_id'.should   = current_last_id + 1
  
  blue("Titre de la fiche")
  'instanceFiche.titre'.should.be.null
  APP.instanceFiche.titre = "Un titre de fiche"
  w("On met le titre à “Un titre de fiche”")
  'instanceFiche.titre'.should = "Un titre de fiche"
  
  blue("Date de création de la fiche (doit être définie à l'instanciation)")
  'instanceFiche.created_at'.should_not.be.null
  'instanceFiche.created_at'.should.be.between(now, now + 100)

  blue("Date de modification de la fiche")
  var maintenant = NOW
  APP.instanceFiche.updated_at = maintenant
  'instanceFiche.updated_at'.should = maintenant
  
  blue("Le typep d'une fiche ne doit pas être défini")
  'instanceFiche.type'.should.be.null
  
  blue("Le résumé (null au départ) doit pouvoir être défini")
  'instanceFiche.resume'.should.be.null
  var le_resume = "Un résumé pour la fiche courante"
  APP.instanceFiche.resume = le_resume
  'instanceFiche.resume'.should = le_resume
  w("Un résumé vide doit mettre résumé à null")
  APP.instanceFiche.resume = "  "
  'instanceFiche.resume'.should_not = "  "
  'instanceFiche.resume'.should.be.null
}

function Fiche_Fonctionnement_methodes_asynchrones() {
  blue("Méthode `dispatch`")
  APP.ifiche = new APP.Fiche()
  'ifiche.type'.should.be.null
  'ifiche.fausse_prop'.should.be.null
  w("Je dispatche")
  APP.ifiche.dispatch({type:"para", fausse_prop:12})
  'ifiche.type'.should = "para"
  'ifiche.fausse_prop'.should = 12
  
  blue("Méthode `modified`")
  APP.ifiche.modified = false
  APP.Collection.modified = false
  'ifiche.modified'.should.be.false
  'Collection.modified'.should.be.false
  APP.ifiche.modified = true // <-- TEST
  'ifiche.modified'.should.be.true
  'ifiche._modified'.should.be.true
  'Collection.modified'.should.be.true
  APP.ifiche.modified = false // <-- TEST
  'ifiche.modified'.should.be.false
  'ifiche._modified'.should.be.false
  'Collection.modified'.should.be.true
  
}
function Fiche_Propriete_speciale_parent_et_enfants() {
  specs("La propriété `parent` de la fiche permet de déterminer son parent tandis "+
        "que la propriété `enfants` permet de déterminer les enfants. "+
        "\nLorsqu'on définit un nouvel enfant à un parent, les propriétés des deux "+
        "objets doivent s'actualiser et la fiche doit être marquée modifiée.")
  
  blue("La définition d'un parent doit être contrôlée (level d'appartenance)")
  APP.ipage = new APP.Fiche()
  APP.ipage.type = 'page'
  'ipage.parent = 12'.should.throw(APP.LOCALE.fiche.error['parent should be an object'])
  'ipage.parent = null'.should.throw(APP.LOCALE.fiche.error['parent should be an object'])
  'ipage.parent = undefined'.should.throw(APP.LOCALE.fiche.error['parent should be an object'])
  'ipage.parent = {}'.should.throw(APP.LOCALE.fiche.error['parent should be a fiche'])
  APP.ipara = new APP.Fiche({type:"para"})
  'ipage.parent = ipara'.should.throw(APP.LOCALE.fiche.error['parent bad type'])
  APP.ibook = new APP.Fiche({type:'book'})
  'ipage.parent = ibook'.should_not.throw() ;
  'ipage._parent'.should_not.be.null
  'ipage._parent.class'.should = "Fiche"
  'ipage._parent.type'.should = "book"
  'ipage.parent'.should_not.be.null
  'ipage.parent.class'.should = "Fiche"
  'ipage.parent.type'.should = "book"
  'ipara.parent = ipage'.should_not.throw()
  'ipara.parent'.should_not.be.null
  'ipara.parent.class'.should = 'Fiche'
  'ipara.parent.type'.should = "page"
  
  
  // NOTE: C'est par `add_child` qu'on définit une nouvelle relation.
  // C'est par 'remove_child' qu'on supprime une relation
  blue("`add_child` doit permettre de créer une relation entre deux fiches")
  APP.ichap = new APP.Fiche({id:14, type:'chap'})
  APP.ipage = new APP.Fiche({id:12, type:'page'})
  'ichap.enfants'.should.be.null
  w("On tente d'ajouter des choses qui ne sont pas des fiches")
  'ipage.add_child()'.should.throw(LOCALE.fiche.error['child should be an object'])
  'ipage.add_child(null)'.should.throw(LOCALE.fiche.error['child should be an object'])
  'ipage.add_child(12)'.should.throw(LOCALE.fiche.error['child should be an object'])
  'ipage.add_child({})'.should.throw(LOCALE.fiche.error['child should be a fiche'])
  'ipage.add_child(ichap)'.should.throw(LOCALE.fiche.error['child bad type'])
  w("Ajout d'une bonne page")
  'ichap.add_child(ipage)'.should_not.throw()
  // Vérification des valeurs attribuées
  'ichap.enfants'.should.be.an_array
  'ichap.modified'.should.be.true
  'Collection.modified'.should.be.true
  APP.first_child = APP.ichap.enfants[0]
  'first_child.type'.should = 'page'
  'first_child.id'  .should = 12
  'ipage.modified'  .should.be.true
  APP.parent_page = APP.ipage.parent
  'parent_page'.should_not.be.null
  'parent_page.type'.should = 'chap'
  'parent_page.id'  .should = 14
  w("Ajout d'une seconde page dans le chapitre")
  APP.ipage2 = new APP.Fiche({id:16, type:'page'})
  'ipage2.parent'.should.be.null
  APP.ichap.add_child( APP.ipage2 )
  'ichap.enfants.length'.should = 2
  'ichap.enfants[0].id' .should = 12
  'ichap.enfants[1].id' .should = 16
  'ipage2.parent'.should_not.be.null
  'ipage2.parent.type'.should = 'chap'
  'ipage2.parent.id'  .should = 14
  'ipage2.modified'   .should.be.true
  
  blue("Suppression d'un enfant")
  APP.Collection.modified = false
  APP.ichap.modified = false
  APP.ipage.modified = false
  'ichap.remove_child()'.should.throw(LOCALE.fiche.error['child should be a fiche'])
  'ichap.remove_child(12)'.should.throw(LOCALE.fiche.error['child should be a fiche'])
  'ichap.remove_child({})'.should.throw(LOCALE.fiche.error['child should be a fiche'])
  'ichap.remove_child(ipage)'.should_not.throw()
  'ichap.enfants.length'.should = 1
  'ichap.enfants[0].id' .should = 16
  'ipage.parent'.should.be.null
  'Collection.modified'.should.be.true
  'ichap.modified'.should.be.true
  'ipage.modified'.should.be.true
}