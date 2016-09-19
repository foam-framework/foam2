var reg = test.helpers.ExemplarRegistry.create();

var ta = test.helpers.Exemplar.create({
  name: 'testA',
  description: "The A test code",
  isAsync: false,
  code: "var a = 'a1'\n" +
        "console.log(a);"
}, reg);

var tb = test.helpers.Exemplar.create({
  name: 'testB',
  description: "The B test code",
  isAsync: false,
  dependencies: [ 'testA' ],
  code: foam.String.multiline(function() {/*
var b = "b2";
console.log(a, b);
*/}),
}, reg);

console.log(tb.generateExample());
eval(tb.generateExample());


var tc = test.helpers.Exemplar.create({
  name: 'testC',
  description: "The C test code async",
  isAsync: true,
  dependencies: [ 'testB' ],
  code: foam.String.multiline(function() {/*
console.log("resolving c");
return Promise.resolve("C");
*/}),
}, reg);

console.log(tc.generateExample());
eval(tc.generateExample());

var td = test.helpers.Exemplar.create({
  name: 'testD',
  description: "The D test code, async dep",
  isAsync: false,
  dependencies: [ 'testC' ],
  code: foam.String.multiline(function() {/*
    var d = results[0];
      console.log("results",d);
    return d;
  */}),
}, reg);

document.write("<hr><pre>"+td.generateExample()+"</pre>");
eval(td.generateExample());


var te = test.helpers.Exemplar.create({
  name: 'testE',
  description: "The E test code, async dep",
  isAsync: false,
  dependencies: [ 'testD', 'testA' ],
  code: foam.String.multiline(function() {/*
    var e = results[0];
      console.log("results2",e);
  */}),
}, reg);

document.write("<hr><pre>"+
  te.generateExample()+
  eval(te.generateExample())+
  "</pre>");

