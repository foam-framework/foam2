/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// This example demonstrate the manner to executes a function for each array element.

foam.CLASS({
  package: 'com.foamdev.demos.forEach',
  name: 'Controller',
  extends: 'foam.u2.Controller',// it will automatically exports: ['this as data']

  properties: [
    {
      name: 'names',
      value: [ 'Michal', 'Kevin', 'Eminem' ]
    }
  ],

  methods: [
    function initE() {
      this.start('div').add('Foreach :').end().
        start('div').add(this.slot(function(names) {
          return this.E('span').forEach(names, function(d, index) {
            this.start().add(index).add(' ').add(d).end();
          })
        })).
        end();
    }
  ]
});
