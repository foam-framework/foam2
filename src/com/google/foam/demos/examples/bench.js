var N = 1000;

console.log('finished');

function test1() {
  var startTime = performance.now();
  var node = foam.u2.Element.create({nodeName: 'UL'});     // Create a <ul> node
  for ( var i = 0 ; i < N ; i++ )
    node.start('li').add("1text" + i).end();                // Append an <li>
  //node.write(document);
  console.log('U2 (pre)', performance.now() - startTime);
}

function test2() {
  var startTime = performance.now();
  var node = foam.u2.Element.create({nodeName: 'UL'});     // Create a <ul> node
  node.write(document);
  for ( var i = 0 ; i < N ; i++ )
    node.start('li').add("2text" + i).end();                // Append an <li>
  console.log('U2 (post)', performance.now() - startTime);
}

function test3() {
  var startTime = performance.now();
  var node = document.createElement("UL");               // Create a <ul> node
  for ( var i = 0 ; i < N ; i++ ) {
    var li = document.createElement("LI")
    li.appendChild(document.createTextNode("3text" + i)); // Append an <li>
    node.appendChild(li);
  }
  document.body.appendChild(node);
  console.log('DOM (pre)', performance.now() - startTime);
}

function test4() {
  var startTime = performance.now();
  var node = document.createElement("UL");               // Create a <ul> node
  document.body.appendChild(node);
  for ( var i = 0 ; i < N ; i++ ) {
    var li = document.createElement("LI")
    li.appendChild(document.createTextNode("4text" + i)); // Append an <li>
    node.appendChild(li);
  }
  console.log('DOM (post)', performance.now() - startTime);
}

function test5() {
  var startTime = performance.now();
  var node = '<ul>';
  for ( var i = 0 ; i < N ; i++ ) {
    node = node + '<li>5text' + i + '</li>'
  }
  node = node + '</ul>';
  document.body.outerHTML = node;
  console.log('outerHTML', performance.now() - startTime);
}

function allTests() {
  test1();
  //test2();
  test3();
  //test4();
  // test5();
  console.log('\n');
}


allTests();
allTests();
allTests();
