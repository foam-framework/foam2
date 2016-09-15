var reg = test.helpers.ExemplarRegistry.create();

var a = test.helpers.Exemplar.create({
  name: 'testA',
  description: "The A test code",
  isAsync: false,
  code: foam.String.multiline(function() {/*
    var a = "a1";
    console.log(a);
  */}),
}, reg);

var b = test.helpers.Exemplar.create({
  name: 'testB',
  description: "The B test code",
  isAsync: false,
  dependencies: [ 'testA' ],
  code: foam.String.multiline(function() {/*
    var b = "b2";
    console.log(a, b);
  */}),
}, reg);

console.log(b.generateExample());
eval(b.generateExample());

