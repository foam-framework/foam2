/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.lib.xml',
  name: 'OutputXML',

  documentation: 'define interface for XML output',

  methods: [
    {
      name: 'outputXML',
      args: [
        {
          name: 'outputter',
          javaType: 'foam.lib.xml.Outputter'
        }
      ]
    }
  ]
});
