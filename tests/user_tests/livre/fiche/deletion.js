/*
 * To run this test : livre/fiche/deletion
 */
function livre_fiche_deletion()
{
  my = livre_fiche_deletion
  
  my.specs = "Test complet de la destruction d'une fiche à l'aide de la méthode Fiche.remove."+
  "\nLa méthode doit :"+
  "\n\t- Supprimer la fiche de la liste des fiches (FICHES.list) ;" +
  "\n\t- Détruire le fichier de la fiche ;"+
  "\n\t- Détruire les relations d'appartenance (parent/enfant) ;"+
  "\n\t- Supprimer la fiche du DOM (~ de son objet parent if any, avec la possibilité de clone)."
  
  my.step_list = [
  ["Méthodes et propriétés utiles à la destruction d'une fiche", FicheDeletion_Methodes_et_proprietes_utiles],
  "Destruction simple d'une fiche (sans appartenance)",
  "Destruction d'une fiche avec appartenance",
  "Destruction d'un fiche non rangée (donc avec un clone dans le parent)"
  ]

  switch(my.step)
  {
  case "Destruction simple d'une fiche (sans appartenance)":
    FicheDeletion_Destruction_fiche_simple()
    break
    
  case "Destruction d'une fiche avec appartenance":
    FicheDeletion_Fiche_avec_appartenance()
    break
    
  default:
    pending("Step '"+my.step+"' should be implanted")
  }
}

function FicheDeletion_Methodes_et_proprietes_utiles() {
  var compprops = [
  'remove', 'delete'
  ]
  L(compprops).each(function(prop){ 'Fiche.prototype'.should.have.property(prop) })
  
  'Collection'.should.have.property('save')
  
}


function FicheDeletion_Destruction_fiche_simple() {

  switch(my.stop_point)
  {
  case 1:
    APP.ipara = new APP.Paragraph()
    APP.ipara.create ;
    ('FICHES.list['+APP.ipara.id+']')       .should.be.defined ;
    ('FICHES.list['+APP.ipara.id+'].class') .should = "Fiche" ;
    ('FICHES.list['+APP.ipara.id+'].type')  .should = "para"
    
    my.nombre_fiches = parseInt(FICHES.length, 10)
    
    'ipara.obj'.should.exist
    jq(APP.ipara.jid).should.be.visible
    
    APP.ipara.remove // <-- TEST
    
    my.wait.for(1).and(NEXT_POINT)
    break
  case 2:
    // Vérification
    'ipara.deleted'.should.be.true
    jq(APP.ipara.jid).should_not.exist ;
    ('FICHES.list['+APP.ipara.id+']').should.be.undefined ;
    'FICHES.length'.should = my.nombre_fiches - 1
    
    // On lance la sauvegarde pour vérifier la destruction du fichier
    APP.Collection.save
    
    my.wait.while(function(){ return APP.Collection.saving }).and(NEXT_POINT)
    break
  case 3:
    pending("Vérifier la destruction du fichier de la fiche")
    my.wait.for(0)
  }
  
}
function FicheDeletion_Fiche_avec_appartenance() {
  specs("Quand la fiche est en relation d'appartenance avec d'autres fiches :"+
  "\n\t- Il faut la supprimer du parent (if any)" +
  "\n\t- Il faut demander s'il faut supprimer ses enfants (if any)")
  pending("Implémenter FicheDeletion_Fiche_avec_appartenance (livre/fiche/deletion.js)")
}

