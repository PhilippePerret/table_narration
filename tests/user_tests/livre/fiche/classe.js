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
  "Fonctionnement des méthodes synchrones",
  "Propriétés spéciales “parent” et “enfants”",
  "Fonctionnement des méthodes `open` et `close`"
  ]
  switch(my.step)
  {
  case "Existence de la classe Fiche et de ses méthodes/propriétés":
    Fiche_Classe_et_methodes_principales()
    break
    
  case "Fonctionnement des propriétés basiques":
    Fiche_Fonctionnement_proprietes_basiques()
    break
    
  case "Fonctionnement des méthodes synchrones":
    Fiche_Fonctionnement_methodes_synchrones()
    break
    
    
  case "Propriétés spéciales “parent” et “enfants”":
    Fiche_Propriete_speciale_parent_et_enfants()
    break
    
  case "Fonctionnement des méthodes `open` et `close`":
    Fiche_Methodes_open_et_close()
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
  
  w("Je crée une instance fiche pour faire quelques vérifications simples")
  APP.ifiche = new APP.Fiche()
  
  // Propriétés
  var properties = [
  'id', 'created_at', 'type', 'class',
  'deleted',
  'opened', 'ranged', 'selected'
  ]
  L(properties).each(function(prop){'instance_Fiche'.should.have.property(prop)})
  'ifiche.deleted'  .should.be.false
  'ifiche.opened'   .should.be.true
  'ifiche.ranged'   .should.be.false
  'ifiche.selected' .should.be.false
  
  // Pseudo-propriétés (propriétés complexes)
  var comp_properties = [
  'jid', 'dom_id', 'titre', 'updated_at', 'modified', 'resume', 'parent', 'enfants',
  'obj', 'dom_obj', 'top', 'left', 'positionne',
  'create', 'save', 'load', 'build', 'observe', 'open', 'close', 'range', 'delete',
  'html',
  'is_book', 'is_chapter', 'is_page', 'is_paragraph',
  'set_values',
  'toggle_select', 'select', 'deselect'
  ]
  L(comp_properties).each(function(prop){'Fiche.prototype'.should.have.property(prop)})
  'ifiche.top'.should.be.equal_to(null, strict = true)
  'ifiche.left'.should.be.equal_to(null, strict = true)
  
  // Méthodes
  var methods = [
  'dispatch', 'on_drop', 'add_child', 'remove_child'
  ]
  L(methods).each(function(method){'Fiche.prototype'.should.respond_to(method)})
  
}

function Fiche_Fonctionnement_proprietes_basiques() {

  var now = NOW
  var current_last_id = 0 + APP.FICHES.last_id
  
  APP.instanceFiche = new APP.Fiche()
  var id = APP.instanceFiche.id
  
  blue("Class de fiche")
  'instanceFiche.class'.should = "Fiche"
  blue("Identifiant absolu de la fiche")
  'instanceFiche.id'.should_not.be.null
  'instanceFiche.id'.should = current_last_id + 1
  'FICHES.last_id'.should   = current_last_id + 1
  
  blue("`dom_id` de la fiche")
  'instanceFiche.dom_id'.should = "f-" + id ;
  blue("`jid` de la fiche")
  'instanceFiche.jid'.should = "fiche#f-" + id
  
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
  
  blue("Le type d'une fiche (Fiche) ne doit pas être défini")
  'instanceFiche.type'.should.be.null
  
  blue("Les méthodes `is_<type>` (is_page, etc.)")
  APP.ibook = new APP.Book()
  'ibook.is_book'.should.be.true
  'ibook.is_chapter'.should.be.false
  'ibook.is_page'.should.be.false
  'ibook.is_paragraph'.should.be.false
  APP.ichap = new APP.Chapter()
  'ichap.is_book'.should.be.false
  'ichap.is_chapter'.should.be.true
  'ichap.is_page'.should.be.false
  'ichap.is_paragraph'.should.be.false
  APP.ipage = new APP.Page()
  'ipage.is_book'.should.be.false
  'ipage.is_chapter'.should.be.false
  'ipage.is_page'.should.be.true
  'ipage.is_paragraph'.should.be.false
  APP.ipara = new APP.Paragraph()
  'ipara.is_book'.should.be.false
  'ipara.is_chapter'.should.be.false
  'ipara.is_page'.should.be.false
  'ipara.is_paragraph'.should.be.true
  
  blue("Le résumé (null au départ) doit pouvoir être défini")
  'instanceFiche.resume'.should.be.null
  var le_resume = "Un résumé pour la fiche courante"
  APP.instanceFiche.resume = le_resume
  'instanceFiche.resume'.should = le_resume
  w("Un résumé vide doit mettre résumé à null")
  APP.instanceFiche.resume = "  "
  'instanceFiche.resume'.should_not = "  "
  'instanceFiche.resume'.should.be.null
  
  pending("Test de la méthode-complexe `obj`")
  pending("Test de la méthode-complexe `dom_obj`")
}

function Fiche_Fonctionnement_methodes_synchrones() {

  APP.ifiche = new APP.Fiche()
  var id = APP.ifiche.id
  
  blue("Méthode `dispatch`")
  'ifiche.type'.should.be.null
  'ifiche.fausse_prop'.should.be.null
  w("Je dispatche")
  APP.ifiche.dispatch({type:"para", fausse_prop:12})
  'ifiche.type'.should = "para"
  'ifiche.fausse_prop'.should = 12
  
  
  blue("Méthode `modified`")
  APP.ifiche.modified           = false
  APP.Collection.modified       = false
  APP.Collection.modifieds_list = null
  'ifiche.modified'.should.be.false
  'Collection.modified'.should.be.false
  'Collection.modifieds_list'.should.be.null
  APP.ifiche.modified = true // <-- TEST
  'ifiche.modified'.should.be.true
  'ifiche._modified'.should.be.true
  'Collection.modified'.should.be.true
  ArrayShouldContainObjectWith('Collection.modifieds_list', 
    {id: APP.ifiche.id, class:'Fiche'})
  
  APP.ifiche.modified = false // <-- TEST
  'ifiche.modified'.should.be.false
  'ifiche._modified'.should.be.false
  'Collection.modified'.should.be.true
  ArrayShouldContainObjectWith('Collection.modifieds_list', 
    {id: APP.ifiche.id, class:'Fiche'})
  
  blue("Méthode `create`")
  specs("La méthode create est testée indépendamment")
  
  blue("Méthode `delete`")
  specs("La méthode `delete` se contente de marquer la fiche `deleted` et de la marquer "+
        "modifiée.")
  APP.ipage = new APP.Page()
  'ipage.deleted'.should.be.false
  APP.ipage.modified = false
  'ipage._modified'.should.be.false
  APP.ipage.delete // <-- TEST
  'ipage.deleted'.should.be.true
  'ipage._modified'.should.be.true
  ArrayShouldContainObjectWith('Collection.modifieds_list', 
    {id: APP.ipage.id, type:'page', class:'Fiche'})
  
  blue("Méthode `remove`")
  specs("La méthode `remove` est testée indépendamment (cf. test livre/fiche/deletion.js)")
  
  blue("Méthode `close`")
  specs("La méthode `close` doit permettre de “fermer” la fiche, c'est-à-dire de "+
  "la passer de son état ouvert (opened) à son état fermé."+
  "\nNote: On la teste avant la méthode `open` puisque la fiche est ouverte à sa création.")
  APP.ibook = new APP.Book()
  APP.ibook.create
  'ibook.opened'.should.be.true
  jq(APP.ibook.jid).should.have.class("opened")
  APP.ibook.close // <-- TEST
  'ibook.opened'.should.be.false
  jq(APP.ibook.jid).should_not.have.class("opened")
  
  blue("Méthode `open`")
  specs("La méthode `open` doit permettre d'“ouvrir” la fiche, c'est-à-dire de " +
  "la passer de son état fermé à son état ouvert.")
  APP.ibook.open // <-- TEST
  'ibook.opened'.should.be.true
  jq(APP.ibook.jid).should.have.class("opened")
  
}

function Fiche_Methodes_open_et_close() {
  
  
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