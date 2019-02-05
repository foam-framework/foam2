/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.foamdev.demos.helloMVC',
  name: 'Hello',
  // If the model is just a data object, it shouldn't extend Element.

  //exports: [ 'as data' ], //FOAM has DI (Dependency Injection) built-in at the object level.

  properties: [
    {
      class: 'String',
      name : 'yourName',
      value: 'Jane Doe',
      view : {
        class: 'foam.u2.TextField',
        onKey: true,
        placeholder: 'Your name please'
      }
    }
  ],
});
