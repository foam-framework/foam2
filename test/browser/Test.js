foam.CLASS({
  name: 'Person',
  properties: ['firstName', 'lastName']
});

var p = Person.create({firstName:'Bob', lxxxastName: 'Smith'});
var X = foam.__context__.createSubContext({data: p});

var e = X.E().add('a: ', Person.FIRST_NAME, ' b: ', Person.FIRST_NAME, ' | ', p.firstName$, ' ', p.lastName$);
e.write();

foam.u2.DetailView.create({
  data: p
}).write();
