/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

describe('IDSupport', function() {
  var ids = ['r', 'color'];
  var properties = ['r', 'color'];
  var Circle;
  var circle;
  beforeEach(function() {
    foam.CLASS({
      package: 'foam.core.id.test',
      name: 'Circle',
      ids: ids,
      properties: properties
    });
    Circle = foam.lookup('foam.core.id.test.Circle');
    circle = Circle.create({r: 1, color: 'red'});
  });

  it('should generate ID class with "Id" suffix in same package', function() {
    var circle = Circle.create({r: 1, color: 'red'});
    expect(circle.id.cls_.id).toBe('foam.core.id.test.CircleId');
  });
  it('ID should have exactly the properties listed in class "ids"', function() {
    expect(circle.id.cls_.getAxiomsByClass(foam.core.Property).
           map(function(prop) { return prop.name; })).
        toEqual(ids);
  });
  it('ID string representation should be compact FON', function() {
    expect(circle.id.toString()).toBe('{r:1,color:"red"}');
  });
  fit('should support old-style array assignment', function() {
    var idValues = [ 10, 'blue' ];
    circle.id = idValues;
    for ( var i = 0; i < ids.length; i++ ) {
      var propName = ids[i];
      var propValue = idValues[i];
      expect(circle[propName]).toBe(propValue);
      expect(circle.id[propName]).toBe(propValue);
    }
  });
  fit('should throw on bad array assignment', function() {
    expect(function() {
      circle.id = [ 100 ];
    }).toThrow();
  });
});
