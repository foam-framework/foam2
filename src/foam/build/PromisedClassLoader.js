/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.build',
  name: 'PromisedClassLoader',
  properties: [
    {
      class: 'Promised',
      of: 'foam.build.ClassLoader',
      name: 'delegate'
    }
  ]
});
