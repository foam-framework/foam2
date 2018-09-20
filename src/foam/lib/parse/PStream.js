/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.lib.parse',
  name: 'PStream',

  documentation: 'PStream interface',

  methods: [
    {
      name: 'head',
      returns: 'Char'
    },
    {
      name: 'valid',
      returns: 'Boolean'
    },
    {
      name: 'tail',
      returns: 'foam.lib.parse.PStream'
    },
    {
      name: 'value',
      returns: 'Any'
    },
    {
      name: 'setValue',
      returns: 'foam.lib.parse.PStream',
      args: [
        {
          name: 'value',
          type: 'Any'
        }
      ]
    },
    {
      name: 'substring',
      returns: 'String',
      args: [
        {
          name: 'end',
          type: 'foam.lib.parse.PStream'
        }
      ]
    },
    {
      name: 'apply',
      returns: 'foam.lib.parse.PStream',
      args: [
        {
          name: 'ps',
          type: 'foam.lib.parse.Parser'
        },
        {
          name: 'x',
          javaType: 'foam.lib.parse.ParserContext'
        }
      ]
    }
  ]
});
