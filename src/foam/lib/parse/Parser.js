/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.lib.parse',
  name: 'Parser',

  documentation: 'Parser interface',

  methods: [
    {
      name: 'parse',
      type: 'foam.lib.parse.PStream',
      args: [
        {
          name: 'ps',
          type: 'foam.lib.parse.PStream'
        },
        {
          name: 'x',
          // ParserContext is not modelled to refer to java type directly
          javaType: 'foam.lib.parse.ParserContext'
        }
      ]
    }
  ]
});
