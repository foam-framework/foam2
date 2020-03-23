/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ReplayDetailsDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `return ledger details`,

  javaImports: [
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
  ],

  properties: [
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      javaFactory: `
        Logger logger = (Logger) getX().get("logger");
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, logger);
      `
    }
  ],

  methods: [
    {
      name: 'cmd_',
      javaCode: `
      if ( ! ( obj instanceof ReplayDetailsCmd ) ) {
        return getDelegate().cmd_(x, obj);
      }
      ReplayDetailsCmd cmd = (ReplayDetailsCmd) ((foam.core.FObject)obj).fclone();
      // set maxIndex, minIndex, ...
      return cmd;
      `
    }
  ]
});
