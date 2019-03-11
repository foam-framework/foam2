/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.boot',
  name: 'NSpecAware',

  properties: [
    {
      name: 'nSpec',
      class: 'FObjectProperty',
      type: 'foam.nanos.boot.NSpec'
    }
  ]
  // methods: [
  //   {
  //     name: 'getNSpec',
  //     class: 'FObjectProperty',
  //     type: 'foam.nanos.boot.NSpec'
  //   },
  //   {
  //     name: 'setNSpec',
  //     args: [
  //       {
  //         name: 'nspec',
  //         type: 'foam.nanos.boot.NSpec'
  //       }
  //     ]
  //   }
  // ]
});
