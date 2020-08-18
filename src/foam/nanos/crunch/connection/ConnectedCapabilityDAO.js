/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.connection',
  name: 'ConnectedCapabilityDAO',
  extends: 'foam.dao.ProxyDAO',
  flags: ['java'],

  javaImports: [
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CrunchService',
    'foam.core.ClassInfo',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'java.util.List'
  ],

  documentation: `
    Connect inbound capability payloads to associated flat capabilities.
  `,

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public ConnectedCapabilityDAO(X x, DAO delegate) {
            setX(x);
            setDelegate(delegate);
          } 
        `);
      }
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        DAO capabilityDAO = (DAO) x.get("capabilityDAO");
        ConnectedCapability sentCap = (ConnectedCapability) obj;
        FlatCapability flatCap = (FlatCapability)
          capabilityDAO.find(sentCap.getFlatCapabilityId());

        String[] classes = flatCap.getClasses();
        String[] capabilities = flatCap.getCapabilities();

        Object[] flatData = sentCap.getData();

        // First pass: validate types provided
        for ( int i = 0 ; i < classes.length ; i++ ) {
          FObject dataObj = (FObject) flatData[i];
          ClassInfo clsInfo = dataObj.getClassInfo();
          if ( clsInfo.getId() != classes[i] ) {
            throw new RuntimeException(String.format(
              "Recieved incorrect type at index %d: "
              + "found '%s', but expected '%s'."
            ));
          }
        }

        CrunchService crunchService = (CrunchService) x.get("crunchService");

        // Second pass: store UCJs
        for ( int i = 0 ; i < classes.length ; i++ ) {
          FObject dataObj = (FObject) flatData[i];
          String targetId = capabilities[i];
          crunchService.updateJunction(x, targetId, dataObj);
        }

        return getDelegate().put_(x, obj);
      `
    }
  ],
});
