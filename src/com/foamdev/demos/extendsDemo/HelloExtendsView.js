/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.foamdev.demos.extendsDemo',
  name: 'HelloExtendsView',
  extends: 'com.foamdev.demos.extendsDemo.HelloView',

//   imports: [
//     'propFromController'
//   ],

  methods: [
    function initE() {
        this.start('h1').add('Hello ').add(this.data.yourName$).add('!').end();
        console.log(this.propFromController);
        console.log(this.propFromHelloView);
    }
  ]
});
