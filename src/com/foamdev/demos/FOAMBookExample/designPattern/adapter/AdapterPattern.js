/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// The adapt function is called on a property value update
// Properties can specify an 'adapt' function which is called whenever
// the properties' value is updated. It's the adapt function's responsibility
// to convert or coerce the type if necessary.

// Both the previous value of the property and the proposed new value are
// passed to adapt.  Adapt returns the desired new value, which may be different
// from the newValue it's provided.
foam.CLASS({
  name: 'AdaptTest',
  properties: [
    {
      name: 'flag',
      adapt: function(oldValue, newValue) {
        console.log('Adapt old:', oldValue, "to new:", newValue);
        // adapt to a boolean
        return !! newValue;
      }
    }
  ]
});
// adapt called once from the flag:true initializer here
var o = AdaptTest.create({
  flag: true
});

// adapt called again to adapt null
o.flag = null;
console.log("Adapted value:", o.flag);


// Properties can define adapt, preSet, and postSet all at once
var lastPostSetValue;
foam.CLASS({
  name: 'AdaptPrePostTest',
  properties: [
    {
      name: 'a',
      adapt: function(oldValue, newValue) {
        console.log('adapt old:', oldValue, 'new:', newValue);
        return newValue + 1;
      },
      preSet: function(oldValue, newValue) {
        console.log('preSet old:', oldValue, 'new:', newValue);
        return newValue + 2;
      },
      postSet: function(oldValue, newValue) {
        console.log('postSet old:', oldValue, 'new:', newValue);
        lastPostSetValue = this.a;
      }
    }
  ]
});
var o = AdaptPrePostTest.create();
o.a = 1;
o.a = 10;