var GLOBAL = global || this;
require('../../src/Alpha');
var Alpha = GLOBAL.Alpha;
describe('Alpha', function() {
  it('Truthy truth', function() {
    var alpha = new Alpha(true);
    expect(alpha.truthy).toBe(true);
    expect(alpha.extraTruthy).toBe(false);
  });
  it('Extra truthy truth', function() {
    var alpha = new Alpha({ b: true });
    expect(alpha.truthy).toBe(true);
    expect(alpha.extraTruthy).toBe(true);
  });
  it('Falsey false', function() {
    var alpha = new Alpha(false);
    expect(alpha.truthy).toBe(false);
    expect(alpha.extraTruthy).toBe(false);
  });
});
