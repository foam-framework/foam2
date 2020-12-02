/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.box',
  name: 'HTTPAuthorizationType',

  documentation: 'Types of HTTP Athorization',

  values: [
    {
      name: 'NONE',
      label: 'None',
      ordinal: 0
    },
    // {
    //   name: 'BASIC',
    //   label: 'Basic',
    //   ordinal: 1
    // },
    {
      name: 'BEARER',
      label: 'Bearer',
      ordinal: 2
    }
  ]
});
