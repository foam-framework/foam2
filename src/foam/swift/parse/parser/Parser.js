/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.swift.parse.parser',
  name: 'Parser',
  methods: [
    {
      name: 'parse',
      type: 'foam.swift.parse.PStream',
      args: [
        {
          type: 'foam.swift.parse.PStream',
          name: 'ps',
        },
        {
          swiftType: 'ParserContext',
          name: 'x',
        },
      ],
    },
  ]
});
