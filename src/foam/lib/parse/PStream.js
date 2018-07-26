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
      javaReturns: 'char',
    },
    {
      name: 'valid',
      javaReturns: 'boolean'
    },
    {
      name: 'tail',
      javaReturns: 'foam.lib.parse.PStream'
    },
    {
      name: 'value',
      javaReturns: 'Object'
    },
    {
      name: 'setValue',
      javaReturns: 'foam.lib.parse.PStream',
      args: [
        {
          name: 'value',
          javaType: 'Object'
        }
      ]
    },
    {
      name: 'substring',
      javaReturns: 'String',
      args: [
        {
          name: 'end',
          javaType: 'foam.lib.parse.PStream'
        }
      ]
    },
    {
      name: 'apply',
      javaReturns: 'foam.lib.parse.PStream',
      args: [
        {
          name: 'ps',
          javaType: 'foam.lib.parse.Parser'
        },
        {
          name: 'x',
          javaType: 'foam.lib.parse.ParserContext'
        }
      ]
    }
  ]
});
