/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// Actions
// Actions are methods which have extra information for GUIs

// Actions are methods which have extra information to make it easier
// to call them from GUIs. Extra information includes things like:
// a label, speech label, functions to determine if the action is currently
// available and enabled, user help text, etc.
var longCalls = 0;
foam.CLASS({
  name: 'ActionTest',
  properties: [ 'enabled', 'available' ],
  actions: [
    function shortForm() {
      console.log('short action!');
    },
    {
      name: 'longForm',
      isAvailable: function() {
        return this.available;
      }, //as if conditions
      isEnabled: function() {
        return this.enabled;
      },
      code: function() {
        console.log('long action!');
        longCalls += 1;
      }
    }
  ]
});
var o = ActionTest.create();
o.shortForm();

o.longForm(); // Won't be called because is not enabled or available yet
o.enabled = true;
o.longForm(); // Won't be called because is not available yet
o.available = true;
o.longForm(); // Finally able to be called