/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.ruler',
  name: 'IsDataUpdate',
  
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],
  
  documentation: `Returns true if ucj data has been updated`,
  
  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.nanos.crunch.UserCapabilityJunction',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        X x = (X) obj;
        UserCapabilityJunction old = (UserCapabilityJunction) x.get("OLD");
        UserCapabilityJunction ucj = (UserCapabilityJunction) x.get("NEW");
        FObject oldData = old.getData();
        FObject newData = ucj.getData();

        if ( oldData == null && newData == null ) return false;
        if ( ( oldData == null && newData != null ) || ( oldData != null && newData == null ) ) {
          return true;
        } else {
          java.util.List<foam.core.PropertyInfo> props = oldData.getClassInfo().getAxiomsByClass(foam.core.PropertyInfo.class);
          for ( foam.core.PropertyInfo prop : props ) {
            if ( prop.getStorageTransient() ) 
              continue;
            Object newProp = prop.f(newData);
            Object oldProp = prop.f(oldData);
            if ( newProp == null && oldProp == null ) continue;
            if ( newProp == null || oldProp == null || ! oldProp.equals(newProp) ) 
              return true;
          }
        }

        return false;
      `
    }
  ]
});
  
  