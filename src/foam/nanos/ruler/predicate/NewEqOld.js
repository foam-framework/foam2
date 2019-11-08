/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler.predicate',
  name: 'NewEqOld',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: 'Returns true if NEW_OBJ equals OLD_OBJ.',

  javaImports: [
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'static foam.mlang.MLang.*',
  ],

  properties: [
    {
      name: 'ignores',
      class: 'String',
      documentation: 'Ignored properties separated by comma.',
      value: 'lastModified, lastModifiedBy'
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        FObject nu  = (FObject) NEW_OBJ.f(obj);  
        FObject old = (FObject) OLD_OBJ.f(obj);
        if ( old == null ) {
          return nu == null;
        }

        // clear ignored properties on NEW and OLD objects before comparing
        nu  = nu.fclone();
        old = old.fclone();
        for ( String propName : getIgnores().split("\\\\s*,\\\\s*") ) {
          PropertyInfo prop = (PropertyInfo) nu.getClassInfo().getAxiomByName(propName);
          if ( prop != null ) {
            prop.clear(nu);
            prop.clear(old);
          }
        }
        return nu.equals(old);
      `
    }
  ]
});
