/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.foamdev.demos.helloMVC',
  name: 'HelloView',
  extends: 'foam.u2.Element',

  imports: [
    'dataImported'
  ],

  methods: [
    function initE() {
      this.start('div').add('Name:').end().start('div').add(this.dataImported).end(). 
        //TODO start(this.YOUR_NAME).attrs({onKey: true, placeholder:'Your name please'}).end().
        //TODO this.DATA_IMPORTED      
        start('h1').add('Hello ').add(this.dataImported$).add('!').end();
    }
  ]
});
