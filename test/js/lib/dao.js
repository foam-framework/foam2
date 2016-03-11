
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./tmp');
}

describe('LocalStorageDAO', function() {
  var a;
  var a2;
  var b;

  beforeEach(function() {
    foam.CLASS({
      name: 'CompA',
      package: 'test',
      properties: [ 'id', 'a', 'b' ]
    });
    foam.CLASS({
      name: 'CompB',
      package: 'test',
      properties: [ 'id', 'b' ]
    });
    a = test.CompA.create({id: 4, a:1, b:2});
    a2 = test.CompA.create({id: 6, a:'hello', b:6});
    b = test.CompB.create({id: 8, b:a2});
  });
  afterEach(function() {
    a = a2 = b = null;
  });

  it('can be created', function() {
    foam.dao.LocalStorageDAO.create({ name: '_test_LS_' });
  });
  it('reads back written data', function() {
    var dao = foam.dao.LocalStorageDAO.create({ name: '_test_LS_' });

    dao.put(a);
    dao.put(a2);
    dao.put(b);

    // a new local storage dao with the same store name
    // TODO: guarantee file sync so we can test this synchronously
    //var dao2 = foam.dao.LocalStorageDAO.create({ name: '_test_LS_' });
    var dao2 = dao; // still checks deserialization

    var result = foam.dao.ArraySink.create();
    dao2.select(result);

    expect(result.a[0]).toEqual(a);
    expect(result.a[1]).toEqual(a2);
    expect(result.a[2]).toEqual(b);
    expect(result.a[2].toJSON()).toEqual(b.toJSON());
  });

  // TODO: test nested objects when foam.json supports them
});

