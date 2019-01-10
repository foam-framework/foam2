/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.build.output',
  name: 'CodeSerializer',
  methods: [
    {
      name: 'getString',
      type: 'String'
    },
    {
      name: 'output',
      args: [
        {
          name: 'x',
          // type: Context.
        },
        {
          name: 'v',
        },
      ],
    },
    {
      name: 'getOutputter',
      type: 'foam.json2.Outputter',
    },
  ]
});
