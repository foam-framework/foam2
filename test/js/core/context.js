describe('ConteXt object', function() {
  it('exists', function() {
    expect(foam).toBeTruthy();
    foam.register({id: 'com.acme.Foo'});
    foam.lookup('com.acme.Foo');
  });

  it('subcontexts', function() {
    var sub = foam.sub({ hello: 4 }, 'namey');
    expect(sub.hello).toEqual(4);
  });

  it('subcontexts with dynamic values', function() {
    foam.CLASS({ 
      name: 'Tester',
      package: 'test',
      properties: [ 'a' ]
    });
    var testa = test.Tester.create({ a: 3 });
    var sub = foam.sub({ hello$: testa.a$ });

    expect(sub.hello).toEqual(3);
    testa.a = 99;
    expect(sub.hello).toEqual(99);

  });

  it('describes', function() {
    foam.sub().describe();

    foam.sub({ hello: 'thing', wee: foam.core.Property.create() }, 'namey').describe();
  });

});
