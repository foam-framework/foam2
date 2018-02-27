/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig',
  name: 'DUG',

  documentation: 'Data Update Gateway - DAO subscription notifcation service',

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.HTTPSink',
    'foam.lib.json.Outputter',
    'foam.nanos.logger.Logger',
    'static foam.lib.json.OutputterMode.NETWORK'
  ],

  tableColumns: [
    'id',
    'daoKey',
    'format',
    'owner',
    'url'
  ],

  searchColumns: [],

  properties: [
    {
        class: 'String',
        name: 'id',
        displayWidth: 40
    },
    {
      class: 'String',
      name: 'daoKey',
      label: 'DAO'
      // TODO: make keyView
    },
    {
      class: 'Enum',
      of: 'foam.nanos.dig.Format',
      name: 'format',
      // format hidden until implemented
      hidden: true
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'owner',
      hidden: true
      // TODO: set tableCellRenderer
    },
    {
      class: 'URL',
      name: 'url',
      label: 'URL',
      displayWidth: 100
    }
  ],

  methods: [
    {
      name: 'execute',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        }
      ],
      javaReturns: 'void',
      javaCode: `
        try {
          DAO dao = (DAO) x.get(getDaoKey());
          // TODO: choose outputter based on format
          dao.listen(new HTTPSink(getUrl(), foam.nanos.dig.Format.JSON), null);
        } catch (Throwable t) {
          ((Logger) x.get("logger")).error("DUG", "error executing DUG", t);
        }
      `
    }
  ]
});
