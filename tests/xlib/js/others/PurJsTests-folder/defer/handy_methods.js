
/*
 *  Test qu'une liste {Array} contienne (ou non) un objet qui possède au moins
 *  les propriétés définies dans +props+.
 *
 *  @param  arr     {String} Nom de la variable dans l'application (donc sans "APP")
 *  @param  props   {Object} Liste des propriétés à comparer (p.e. {id:12, class:'Fiche'})
 *                  Toutes les propriétés doivent être égales pour que l'objet soit trouvé
 *  @param  negatif {Boolean} Inverse la condition. Si true, l'objet ne doit pas être trouvé
 *                  pour entrainer un succès.
 *
 *  TODO  Il faudra pouvoir faire '<arr>.should.contain.object.with(<props>)'
 */
function ArrayShouldContainObjectWith(arr, props, negatif)
{
  if(undefined == negatif) negatif = false ;
  var i, el, found = false ;
  var arr_evaluated = eval_in_app( arr )
  for(i = 0, len = arr_evaluated.length; i < len ; ++i)
  {
    el = arr_evaluated[i]
    if( ElementInArrayHasProperties(el, props) )
    {
      found = true
      break
    }
  }
  var something = LOCALES['object containing'] + (inspect(props)) ;
  if(found == !negatif) success(arr + (negatif ? LOCALES['doesnt contain'] : LOCALES['contains']) + something);
  else failure(arr + (negatif ? LOCALES['should not contain'] : LOCALES['should contain']) + something);
}
function ElementInArrayHasProperties(el, props)
{
  for(var prop in props){
    if(false == props.hasOwnProperty(prop)) continue ;
    if( el[prop] != props[prop] ) return false
  }
  return true
}

// Pour obtenir le contenu de la dernière "ligne" (div) du rapport :
Object.defineProperties(this,{
	// Retourne le contenu HTML de la dernière ligne de rapport écrite
	get_last_div_rapport:{
		get:function(){return $('div#rapport').children().last().html()},
		configurable:true
	},
  // Retourne les N dernières lignes du rapport
  // @param   nombre      Le nombre de ligne remontées (à partir de la dernière)
  // @param   all         Si true, remonte toutes les lignes, même autre que success-failure-pending
  //                      Défaut: false
  get_lasts_div_rapport:{
    value:function(nombre, all){
      if(undefined == all) all = false
      var jid = 'div#rapport > ' +(all ? 'div' : 'div.SFP')
      var lasts = []
      $(jid).slice(-nombre).each(function(){
        lasts.push($(this).html())
      })
      return lasts.reverse()
    }
  }
})

// Tester le retour de méthodes ou de propriétés complexes
// -------------------------------------------------------
// @param		code			Le code à évaluer. Par exemple "'ma_var'.is.a_number"
// @param		expected	Le résultat attendu (il sera évalué de façon stricte : ===)
// 
// @produit	Un succès si le résultat est celui escompté, un échec dans le cas contraire.
function eval_and_result(code, expected) {
	res = eval(code)
	if(res === expected) success("`"+code+"` renvoie bien "+tostring(expected))
	else failure("`"+code+"` devrait renvoyer "+tostring(expected)+", il renvoie : "+res)
}

// --- Définition des propriétés complexes ---
// 
// Donne la valeur +defaut+ à +foo+ si +foo+ est undéfini ou strictement null
function _when_undefined_or_null(foo, defaut){
  if(undefined == foo || null === foo) return defaut
  else return foo
}

