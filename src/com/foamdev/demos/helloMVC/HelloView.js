/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.foamdev.demos.helloMVC',
  name: 'HelloView',
  extends: 'foam.u2.View',// it will imports 'data'

  /*imports: [
    'dataImported'
  ],*/
 /* imports: [
    'data'
  ],*/

  methods: [
    function initE() {
      //this.start('div').add('Name:').end().start('div').add(this.dataImported.yourName).end(). 
      this.start('div').add('Name:').end().start('div').add(this.data.yourName).end(). 
        //TODO start(this.YOUR_NAME).attrs({onKey: true, placeholder:'Your name please'}).end().
        //TODO .add(this.dataImported.YOUR_NAME)
        //start('h1').add('Hello ').add(this.dataImported.yourName$).add(this.dataImported.YOUR_NAME).add('!').end();
        start('h1').add('Hello ').add(this.data.yourName$).add(this.data.YOUR_NAME).add('!').end();
    }
  ]
});
