/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaRoutingDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Consensus has been reached for an object, put it into it's MDAO. Also generate a notification to wake any blocked Primary puts.`,

  javaImports: [
    'foam.core.FObject',
    'foam.dao.DAO',
    'foam.dao.DOP',
    'foam.lib.json.JSONParser',
    'foam.util.SafetyUtil',
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
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, (Logger) getX().get("logger"));
      `
    }
  ],
  
  methods: [
    {
      name: 'put_',
      javaCode: `
      MedusaEntry entry = (MedusaEntry) getDelegate().put_(x, obj);

      if ( ! entry.getHasConsensus() ) {
        getLogger().debug("put", entry.getIndex(), "consensus", false);
        return entry;
      }
      getLogger().debug("put", entry.getIndex(), "consensus", "TRUE");

      try {
        String data = entry.getData();
        getLogger().debug("put", entry.getIndex(), "mdao", entry.getDop().getLabel(), data);
        if ( ! SafetyUtil.isEmpty(data) ) {
          ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
          FObject nu = x.create(JSONParser.class).parseString(entry.getData());
          if ( nu == null ) {
            getLogger().error("Failed to parse", entry.getData());
            throw new RuntimeException("Error parsing data.");
          }

          DAO dao = support.getMdao(x, entry);
          FObject old = dao.find_(x, nu.getProperty("id"));
          if (  old != null ) {
            nu = old.fclone().copyFrom(nu);
          }

          if ( DOP.PUT == entry.getDop() ) {
            dao.put_(x, nu);
          } else if ( DOP.REMOVE == entry.getDop() ) {
            dao.remove_(x, nu);
          } else {
            getLogger().warning("Unsupported operation", entry.getDop().getLabel());
            throw new UnsupportedOperationException(entry.getDop().getLabel());
          }
        }
        // Notify any blocked Primary puts
        getLogger().debug("put", entry.getIndex(), "notify");
        ((DAO) x.get("localMedusaEntryDAO")).cmd_(x, entry);
        getLogger().debug("put", entry.getIndex(), "notified");

      } catch (Throwable t) {
        getLogger().error(t);
        // TODO: Alarm
      }
      return entry;
      `
    }
  ]
});
