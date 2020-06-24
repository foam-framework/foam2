/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'BatchServerDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Unpack BatchCmd List and issue individual dao operations',

  javaImports: [
    'foam.core.Agency',
    'foam.core.ContextAgent',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DOP',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'java.util.Map',
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
      // TODO: remove - temporary - just for development troubleshooting
      name: 'put_',
      javaCode: `
      if ( obj instanceof MedusaEntry ) {
        MedusaEntry entry = (MedusaEntry) obj;
        getLogger().debug("put_", entry.getIndex(), entry.getNode());
      }
      return getDelegate().put_(x, obj);
      `
    },
    {
      name: 'cmd_',
      javaCode: `
      if ( obj instanceof BatchCmd ) {
        BatchCmd cmd = (BatchCmd) obj;
        getLogger().debug("cmd", "BatchCmd", cmd.getHostname(), cmd.getDop().getLabel(), cmd.getBatch().size());

        if ( DOP.PUT == cmd.getDop() ) {
          Map<Object, Object> map = cmd.getBatch();
          Agency agency = (Agency) x.get("threadPool");
          for (Map.Entry<Object, Object> entry : map.entrySet()) {
            agency.submit(x, new ContextAgent() {
              public void execute(X x) {
                try {
                  FObject o = (FObject) entry.getValue();
        getLogger().debug("cmd", "BatchCmd", cmd.getHostname(), o.toString());
                  getDelegate().put_(x, (FObject) entry.getValue());
                } catch ( Throwable t ) {
                  getLogger().error(t);
                }
              }
            }, this.getClass().getSimpleName());
          }
          BatchCmd.BATCH.clear(cmd);
          return cmd;
        }
        if ( DOP.REMOVE == cmd.getDop() ) {
          Map<Object, Object> map = cmd.getBatch();
          Agency agency = (Agency) x.get("threadPool");
          for (Map.Entry<Object, Object> entry : map.entrySet()) {
            agency.submit(x, new ContextAgent() {
              public void execute(X x) {
                try {
                  getDelegate().remove_(x, (FObject) entry.getValue());
                } catch (Throwable t ) {
                  getLogger().error(t);
                }
              }
            }, this.getClass().getSimpleName());
          }
          BatchCmd.BATCH.clear(cmd);
          return cmd;
        }
        throw new UnsupportedOperationException(cmd.getDop().getLabel());
      }
      return getDelegate().cmd_(x, obj);
      `
    }
  ]
});
