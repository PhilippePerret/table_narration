Object.defineProperties(String.prototype,{
	"contains":{
		value:function(value, strict){
			if(undefined == strict) strict = false
      /*
       *  La valeur à évaluer. Soit le texte brut (this.toString), soit
       *  l'évaluation de l'expression
       */
      var val ;
      var val_evaluated = this.eval
      if(val_evaluated != undefined) val = val_evaluated
      else val = this.toString()
      // console.log("val = "+val)
       
      var exact_type_value = _exact_type_of( value )
      if( strict && (this.exact_type != exact_type_value) ) return false
      // console.log("Exact type:"+this.exact_type)
      if(exact_type_value == 'regexp')
      {
        // console.log(" Contains par expression régulière")
        // console.log("reg = "+value)
        return val.match(value) !== null
      }
      else
      {
				if(strict) 	return val == value
				else 				return val.indexOf(value) > -1
      }
		}
	},
	"not_contains":{value:function(value, strict){return ! this.contains(value,strict)}}
	
})