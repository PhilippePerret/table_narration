/*
 *  Test de l'Objet Data
 *  --------------------
 *  Gestion des données diverses
 */
window.Data = {
  
  // Dispatche les données +data+ dans l'objet +obj+
  // Corrige certaines valeurs spéciales.
  dispatch:function(obj, data)
  {
    var prop, val ;
    for(prop in data)
    {
      if(false == data.hasOwnProperty(prop)) continue
      val = data[prop]
      // Traitement spécial en fonction de la propriété
      switch(prop)
      {
      case 'id': val = parseInt(val, 10); break;
      default:
        // Traitement spécial en fonction du typeof de la valeur
        switch( this.exact_typeof( val ) )
        {
        
        // Quand la valeur est un string
        case 'string':
          val = this.exact_val_of_string(val)
          break

        case 'object':
          break
        }
      }
      obj[prop] = val
    }
  },
  
  
  // Retourne le « type exact » de la valeur +valeur+
  // array, integer, float (marge d'erreur si aucune décimale), 'nan', 'infinity', 'null', etc. 
  exact_typeof:function( valeur )
  {
  	switch(typeof valeur){
  		case 'function'	:                       return 'function'
  		case 'object'		:
  			if(valeur === null)                   return 'null'
        if(valeur instanceof RegExp)          return 'regexp'
  			if('function' == typeof valeur.slice) return 'array'
  			else                                  return 'object'
  		case 'number'		:
  			var tos = valeur.toString()
  			if(tos == "NaN") 				              return "nan"
  			if(tos == "Infinity") 	              return "infinity"
  			if(tos.indexOf('.')>-1)               return 'float'
  			else 										              return 'integer'
  		default: return typeof valeur // 'string', 'boolean'
  	}
  },
  
  // Transforme des valeurs string spéciales
  exact_val_of_string:function(val)
  {
    switch(val)
    {
    case 'null'   : return null
    case 'false'  : return false
    case 'true'   : return true
    default: return val
    }
  }
}