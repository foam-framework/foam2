/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ReplayDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Response to ReplayCmd`,

  javaImports: [
    'foam.dao.DAO',
    'static foam.mlang.MLang.GTE',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger'
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
      if ( ! ( obj instanceof ReplayCmd ) ) {
        return getDelegate().cmd_(x, obj);
      }
      ReplayCmd cmd = (ReplayCmd) obj;
      getLogger().debug(cmd);
      DAO dao = getDelegate(); //(DAO) x.get("medusaEntryDAO");
      dao.where(
        GTE(MedusaEntry.INDEX, cmd.getFromIndex())
      )
      .orderBy(MedusaEntry.INDEX)
      .select(new ReplaySink(
        x,
        cmd.getRequester(),
        cmd.getServiceName()
      ));
      return cmd;
      `
    }
  ]
});
