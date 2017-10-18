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
      swiftReturns: 'Character',
    },
    {
      name: 'valid',
      swiftReturns: 'Bool',
    },
    {
      name: 'tail',
      swiftReturns: 'PStream',
    },
    {
      name: 'substring',
      swiftReturns: 'String',
      args: [
        {
          name: 'end',
          swiftType: 'PStream',
        },
      ],
    },
    {
      name: 'value',
      swiftReturns: 'Any?',
    },
    {
      name: 'setValue',
      swiftReturns: 'PStream',
      args: [
        {
          name: 'value',
          swiftType: 'Any?',
        },
      ],
    },
  ]
});
