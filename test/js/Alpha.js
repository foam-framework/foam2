var GLOBAL = global || this;
var Alpha = require('../../src/Alpha').Alpha;
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
