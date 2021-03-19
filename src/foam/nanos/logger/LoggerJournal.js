/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.logger',
  name: 'LoggerJournal',
  extends: 'foam.dao.WriteOnlyF3FileJournal',

  documentation: `Only write to underlying JDAO if not PRODUCTION mode`,
  
  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.app.Mode'
  ],

  methods: [
    {
      name: 'replay',
      javaCode: `
        return;
      `
    },
    {
      name: 'put',
      type: 'FObject',
      args: [ 'Context x', 'String prefix', 'DAO dao', 'foam.core.FObject obj' ],
      javaCode: `
      AppConfig appConfig = (AppConfig) x.get("appConfig");
      if ( appConfig == null ||
           appConfig.getMode() != Mode.PRODUCTION ) {
        return super.put(x, prefix, dao, obj);
      }
      return dao.put_(x, obj);
      `
    }
  ]
});
