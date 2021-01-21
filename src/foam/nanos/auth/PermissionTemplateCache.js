/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'PermissionTemplateCache',

  properties: [
    {
      class: 'Map',
      name: 'cache',
      documentation: `Key represents DAOKey and value represents list of permissions applicable to the service.`,
      javaFactory: `
        return new ConcurrentHashMap<String, List>();
      `
    }
  ],

  methods: [
    {
      name: 'getPermissionListOf',
      type: 'List',
      args: [ { class: 'String', name: 'DAOKey' } ],
      javaCode: `
        return ((Map<String, List>) getCache()).get(DAOKey);
      `
    }
  ]
});
