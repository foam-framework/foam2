
describe('pattern.Pooled', function() {

  beforeEach(function() {
    foam.CLASS({
      name: 'PooledClass',
      package: 'test',
      axioms: [foam.pattern.Pooled.create()],
      properties: [ 'a', 'b' ],
    });
  });
  afterEach(function() {
    a = null;
    delete foam.__objectPools__;
  });

  it('allocates new instances', function() {
    var instances = [
      test.PooledClass.create(),
      test.PooledClass.create({ a: 1, b: 2 }),
      test.PooledClass.create({ a: 3, b: 4 }),
      test.PooledClass.create({ a: 5, b: 6 }),
    ];
    expect(test.PooledClass.__objectPool__.length).toEqual(0);
  });

  it('returns destroyed instances to the pool', function() {
    var instances = [
      test.PooledClass.create(),
      test.PooledClass.create({ a: 1, b: 2 }),
      test.PooledClass.create({ a: 3, b: 4 }),
      test.PooledClass.create({ a: 5, b: 6 }),
    ];
    expect(test.PooledClass.__objectPool__.length).toEqual(0);

    instances.forEach(function(inst) {
      inst.destroy();
    });
    expect(test.PooledClass.__objectPool__.length).toEqual(instances.length);
  });

  it('eliminates the contents of destroyed objects', function() {
    var p = test.PooledClass.create({ a: 5, b: 6 });
    p.destroy();

    expect(p.a).toBeUndefined();
    expect(p.b).toBeUndefined();
  });

  it('retains JS objects', function() {
    var p = test.PooledClass.create({ a: 5, b: 6 });
    var i_ = p.instance_;
    var p_ = p.private_;
    p.destroy();

    // should pull from pool
    p = test.PooledClass.create({ a: 5, b: 6 });
    i_.a = 99; // hack in a value
    expect(p.a).toEqual(99);
    expect(p.private_).toBe(p_);
  });


});


