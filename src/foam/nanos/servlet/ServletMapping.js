/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.servlet',
  name: 'ServletMapping',

  properties: [
    {
      class: 'String',
      name: 'className'
    },
    {
      class: 'Object',
      name: 'servletObject',
      javaType: 'javax.servlet.Servlet',
      transient: true
    },
    {
      class: 'String',
      name: 'pathSpec'
    },
    {
      class: 'Map',
      name: 'initParameters'
    }
  ]
});
