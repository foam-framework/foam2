describe('coverage for debugging helpers', function() {
  it('covers describe()', function() {
    var p = foam.core.Property.create({});
    p.describe();
    p.cls_.describe();
  });
});
