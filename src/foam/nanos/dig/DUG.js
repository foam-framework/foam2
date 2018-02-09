/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.nanos.dig',
  name: 'Format',

  documentation: 'DUG formats: JSON/XML.',

  values: [
    { name: 'JSON', label: 'JSON' },
    { name: 'XML',  label: 'XML'  }
  ]
});

foam.CLASS({
  package: 'foam.nanos.dig',
  name: 'DUG',

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.HTTPSink',
    'foam.lib.json.Outputter',
    'static foam.lib.json.OutputterMode.NETWORK'
  ],

  searchColumns: [],

  properties: [
    { class: 'String', name: 'id' },
    { class: 'String', name: 'daoKey' },
    { class: 'String', name: 'url' },
    { class: 'Enum', of: 'foam.nanos.dig.Format', name: 'format' },
    { class: 'Reference', of: 'foam.nanos.auth.User', name: 'owner' }
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
      javaCode:
`try {
  DAO dao = (DAO) x.get(getDaoKey());
  // TODO: choose outputter based on format
  dao.listen(new HTTPSink(getUrl(), new Outputter(NETWORK)), null);
} catch (Throwable t) {
  t.printStackTrace();
  throw new RuntimeException(t);
}`
    }
  ]
});
