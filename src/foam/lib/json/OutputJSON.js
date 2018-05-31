/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.INTERFACE({
  package: 'foam.lib.json',
  name: 'OutputJSON',

  documentation: 'define interface for Json output',

  methods: [
    {
      name: 'outputJSON',
      args: [
        {
          name: 'outputter',
          javaType: 'foam.lib.json.Outputter'
        }
      ]
    }  
  ]
});
