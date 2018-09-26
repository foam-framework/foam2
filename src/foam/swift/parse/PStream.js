/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.swift.parse',
  name: 'PStream',
  methods: [
    {
      name: 'head',
      returns: 'Char',
    },
    {
      name: 'valid',
      returns: 'Boolean',
    },
    {
      name: 'tail',
      returns: 'foam.swift.parse.PStream',
    },
    {
      name: 'substring',
      returns: 'String',
      args: [
        {
          name: 'end',
          type: 'foam.swift.parse.PStream',
        },
      ],
    },
    {
      name: 'value',
      returns: 'Any',
    },
    {
      name: 'setValue',
      returns: 'foam.swift.parse.PStream',
      args: [
        {
          name: 'value',
        },
      ],
    },
  ]
});
