/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.theme',
  name: 'ThemeService',

  methods: [
    {
      name: 'getTheme',
      async: true,
      type: 'foam.nanos.theme.Theme',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'appName',
          type: 'String'
        }
      ]
    }
  ]
});
