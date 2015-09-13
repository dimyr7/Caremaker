var states = require('./state.json')

for(var i = 0; i < states.length; i++){
	console.log("<option value=\""+states[i].abbreviation+"\">"+states[i].abbreviation+"</option>");
}
