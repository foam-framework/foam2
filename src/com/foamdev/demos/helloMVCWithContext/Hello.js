/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.foamdev.demos.helloMVCWithContext',
  name: 'Hello',
  // If the model is just a data object, it shouldn't extend Element.

  properties: [
    {
      class: 'String',
      name : 'yourName',
      value: 'Jane Doe',
//       view : {
//         class: 'foam.u2.TextField',
//         onKey: true,
//         placeholder: 'Your name please'
//       }
    },    
    {
      class: 'Boolean',
      name : 'alive',
      value: true,
    }, 
//     we may even swish the type of the property and the UI will render the property in the appropriete view   
//     {
//       class: 'Object',
//       name : 'alive',
//       value: "hello",
//     }
  ],
});
