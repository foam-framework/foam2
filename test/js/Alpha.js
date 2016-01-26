var GLOBAL = global || this;
require('../../src/Alpha');
var Alpha = GLOBAL.Alpha;
describe('Alpha', function() {
  it('Truthy truth', function() {
    var alpha = new Alpha(true);
    expect(alpha.truthy).toBe(true);
  });
  it('Falsey false', function() {
    var alpha = new Alpha(false);
    expect(alpha.truthy).toBe(false);
  });
});
