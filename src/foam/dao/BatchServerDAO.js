/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'BatchServerDAO',
  extends: 'foam.dao.ProxyDAO',

  documenation: 'Unpack BatchCmd List and issue individual dao operations',

  javaImports: [
    'foam.core.FObject',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'java.util.List',
  ],

  properties: [
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      javaFactory: `
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, (Logger) getX().get("logger"));
      `
    }
  ],

  methods: [
    {
      // TODO: support remove
      name: 'cmd_',
      javaCode: `
      if ( obj instanceof BatchCmd ) {
        BatchCmd cmd = (BatchCmd) obj;
        getLogger().debug("cmd", "BatchCmd");

        List<FObject> list = cmd.getBatch();
        for (FObject fobject : list) {
          getDelegate().put_(x, fobject);
        }
        return cmd;
      }
      return getDelegate().cmd_(x, obj);
      `
    }
  ]
});
