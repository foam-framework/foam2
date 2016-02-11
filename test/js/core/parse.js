
var corePromise = global.loadCoreTo('core/parse.js');
var beforeEachTest = function(callback) {
  return beforeEach(function(done) {
    corePromise.then(function() {
      callback();
      done();
    });
  });
};



describe('Parser', function() {
  var p;
  var foundMike;

  beforeEachTest(function() {
    foam.CLASS({
      name: 'ParserTest',
      grammars: [
        {
          name: 'NameParser',
          symbols: {
            START: foam.parse.seq("Hello", " ",
                       foam.parse.alt("world", "adam", foam.parse.sym('mike')),
                       "!"),
            'mike': foam.parse.seq("mike", " ", foam.parse.alt("carcasole", "elseole"))
          },
          actions: {
            'mike': function(a) {
              foundMike += 1;
              return a;
            }
          }
        }
      ]
    });
    p = /*X.*/ParserTest.create();
    foundMike = 0;
  });
  afterEach(function() {
    p = null;
    foundMike = 0;
  });

  it('parses simple strings', function() {
    expect(p.NameParser("Hello world!")).toEqual([ 'Hello', ' ', 'world', '!' ]);
    expect(foundMike).toEqual(0);
  });

  it('parses actions', function() {
    expect(p.NameParser("Hello mike carcasole!")).toEqual([ 'Hello', ' ', [ 'mike', ' ', 'carcasole' ], '!' ]);
    expect(foundMike).toEqual(1);
  });
  it('parses alternates', function() {
    expect(p.NameParser("Hello adam!")).toEqual([ 'Hello', ' ', 'adam', '!' ]);
    expect(foundMike).toEqual(0);
  });
  it('parses alt sequences', function() {
    expect(p.NameParser("Hello mike elseole!")).toEqual([ 'Hello', ' ', [ 'mike', ' ', 'elseole' ], '!' ]);
    expect(foundMike).toEqual(1);
  });

  it('fails on invalid input', function() {
    expect(p.NameParser("Helo world!")).toBeUndefined();
    expect(foundMike).toEqual(0);
  });
});

