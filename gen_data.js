var numRecords = 10000;
var data = global.data = new Array(numRecords);
for ( var i = 0; i < numRecords; i++ ) {
  data[i] = test.Person.GEN_RANDOM();
}

require('fs').writeFileSync('persons.json', foam.json.Strict.stringify(data));
require('fs').writeFileSync('persons.fon', foam.json.Network.stringify(data));
