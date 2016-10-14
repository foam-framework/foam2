describe('Singleton axiom', function() {
  it('should always return the same axiom', function() {
    var a = foam.pattern.Singleton.create();
    var b = foam.pattern.Singleton.create();
    expect(a).toBe(b);
  });

  it('should always return the same axiom', function() {
    var a = foam.pattern.Singleton.create();
    var b = a.clone();
    expect(a).toBe(b);
  });

  it('should answer equals() with ===', function() {
    var a = foam.pattern.Singleton.create();
    var b = a.clone();
    expect(a.equals(b)).toBe(true);
    expect(b.equals(a)).toBe(true);
    expect(a.equals(7)).toBe(false);
    expect(a.equals(Math)).toBe(false);
  });
});

describe('Multiton axiom', function() {
  it('has multiple instances', function() {
    var a = foam.pattern.Multiton.create();
    var b = foam.pattern.Multiton.create();
    expect(a).not.toBe(b);
  });

  it('that cannot be cloned', function() {
    var a = foam.pattern.Multiton.create();
    var b = a.clone();
    expect(a).toBe(b);
  });

  it('should answer equals() with ===', function() {
    var a = foam.pattern.Multiton.create();
    var b = a.clone();
    var c = foam.pattern.Multiton.create();
    expect(a.equals(b)).toBe(true);
    expect(b.equals(a)).toBe(true);
    expect(a.equals(c)).toBe(false);
    expect(a.equals(Math)).toBe(false);
  });
});
