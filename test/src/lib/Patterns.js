
describe('Progenitor', function() {

  var progenitor;

  beforeEach(function() {
    foam.CLASS({
      name: 'ProgenitorClass',
      package: 'test',
      axioms: [foam.pattern.Progenitor.create()],
      properties: [
        {
          class: 'foam.pattern.PerInstance',
          name: 'a',
        },
        {
          class: 'foam.pattern.PerInstance',
          name: 'b',
          value: 54
        },
        {
          class: 'foam.pattern.PerInstance',
          name: 'c',
          factory: function() { return this.normalD; }
        },
        {
          name: 'normalD',
          value: 'no'
        }
      ],
    });
    progenitor = test.ProgenitorClass.create();
  });
  afterEach(function() {
    progenitor = null;
  });

  it('blanks per instance properties', function() {
    progenitor.a = "hideMe";
    progenitor.b = "defaultMe";

    var spawn = progenitor.spawn();

    expect(spawn.a).toBeUndefined();
    expect(spawn.b).toEqual(54);

    expect(progenitor.a).toEqual("hideMe");
    expect(progenitor.b).toEqual("defaultMe");

    expect(spawn.spawn).toEqual(null);
  });

  it('instances are separate', function() {
    var spawnA = progenitor.spawn();
    var spawnB = progenitor.spawn();

    progenitor.a = "hideMe";
    progenitor.b = "defaultMe";

    spawnA.a = 66;
    spawnA.b = 77;

    spawnB.a = false;
    spawnB.b = true;

    expect(spawnA.a).toEqual(66);
    expect(spawnA.b).toEqual(77);

    expect(spawnB.a).toEqual(false);
    expect(spawnB.b).toEqual(true);

    expect(progenitor.a).toEqual("hideMe");
    expect(progenitor.b).toEqual("defaultMe");

    expect(spawnA.__proto__).toBe(spawnB.__proto__);
  });

  it('runs factories', function() {
    var spawn = progenitor.spawn();

    expect(spawn.c).toEqual('no');
  });

  it('gives spawned instance access to the progenitor', function() {
    var spawn = progenitor.spawn();

    expect(spawn.progenitor).toBe(progenitor);

    expect(progenitor.progenitor).toBeUndefined();
  });

});




