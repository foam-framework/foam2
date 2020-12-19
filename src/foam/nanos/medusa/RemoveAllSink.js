/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'RemoveAllSink',
  extends: 'foam.dao.AbstractSink',

  javaImports: [
    'foam.core.FObject',
    'foam.nanos.logger.Logger'
  ],

  properties: [
    {
      name: 'dao',
      class: 'foam.dao.DAOProperty'
    }
  ],

  methods: [
    {
      name: 'put',
      args: [
        {
          name: 'obj',
          type: 'Object'
        },
        {
          name: 'sub',
          type: 'foam.core.Detachable'
        }
      ],
      javaCode: `
      getDao().remove_(getX(), (FObject) obj);
      `
    },
    {
      // avoid null pointer on ProxySink.eof()
      name: 'eof',
      javaCode: `//nop`
    }
  ]
});
