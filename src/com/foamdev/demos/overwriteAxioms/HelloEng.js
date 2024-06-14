/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.foamdev.demos.overwriteAxioms',
  name: 'Hello',

  properties: [
    {
      class: 'String',
      name : 'yourName',
      value: 'Jane Doe',
      view : {
        class: 'foam.u2.TextField',
        onKey: true,
        placeholder: 'Your name please Sir Eng.'
      }
    }
  ],
});
