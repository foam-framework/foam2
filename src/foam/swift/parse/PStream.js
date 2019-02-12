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
      type: 'Char',
    },
    {
      name: 'valid',
      type: 'Boolean',
    },
    {
      name: 'tail',
      type: 'foam.swift.parse.PStream',
    },
    {
      name: 'substring',
      type: 'String',
      args: [
        {
          name: 'end',
          type: 'foam.swift.parse.PStream',
        },
      ],
    },
    {
      name: 'value',
      type: 'Any',
    },
    {
      name: 'setValue',
      type: 'foam.swift.parse.PStream',
      args: [
        {
          name: 'value',
        },
      ],
    },
  ]
});
