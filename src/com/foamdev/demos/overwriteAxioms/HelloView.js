/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.foamdev.demos.overwriteAxioms',
  name: 'HelloView',
  extends: 'foam.u2.View',// it will imports 'data'

 /* imports: [
    'HelloUser'
  ],*/

  methods: [
    function initE() {
      this.start('h1').add('Name:').end().start('div').add(this.data.yourName).end(). 
        start('h1').add('Hello ').add(this.data.yourName$).add('!').end();
      
      this.data.yourName = null;  
      this.start('h1').add('Hello ').add(this.data.YOUR_NAME).end();
    }
  ]
});
