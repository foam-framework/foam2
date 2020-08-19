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
    'foam.util.SafetyUtil',
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
        ConnectedCapability sentCap = (ConnectedCapability) obj;
        FlatCapability flatCap = sentCap.findFlatCapability(x);

        String[] classes = flatCap.getClasses();
        String[] capabilities = flatCap.getCapabilities();

        Object[] flatData = sentCap.getData();

        // First pass: validate types provided
        int index = 0;
        for ( var data : flatData ) {
          // Skip capability where 'of' property is empty
          while ( index < classes.length && SafetyUtil.isEmpty(classes[index]) ) {
            index++;
          }

          if ( index >= classes.length ) {
            throw new RuntimeException("Unexpected data provided: " + data);
          }

          FObject dataObj = (FObject) data;
          ClassInfo clsInfo = dataObj.getClassInfo();
          if ( !SafetyUtil.equals(clsInfo.getId(), classes[index]) ) {
            throw new RuntimeException(String.format(
              "Recieved incorrect type at index %d: "
              + "found '%s', but expected '%s'.", 
              index, clsInfo.getId(), classes[index]
            ));
          }

          // increment the index
          index++;
        }

        CrunchService crunchService = (CrunchService) x.get("crunchService");

        // Second pass: store UCJs
        int flatDataIndex = 0;
        for ( int i = 0 ; i < classes.length ; i++ ) {
          FObject dataObj = null;
          if ( !SafetyUtil.isEmpty(classes[i]) ) {
            dataObj = (FObject) flatData[flatDataIndex++];
          }
          String targetId = capabilities[i];
          crunchService.updateJunction(x, targetId, dataObj);
        }

        return getDelegate().put_(x, obj);
      `
    }
  ],
});
