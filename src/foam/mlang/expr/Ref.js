/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang.expr',
  name: 'Ref',
  extends: 'foam.mlang.AbstractExpr',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'An Unary Expression which returns reference property object',

  javaImports: [
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.StdoutLogger',
    'foam.util.StringUtil'
  ],

  properties: [
    {
      class: 'foam.mlang.ExprProperty',
      name: 'arg1'
    }
  ],

  methods: [
    {
      name: 'f',
      code: function(o) {
        //throw new Error('Ref is not supported');
        return null;
      },
      javaCode: `
        PropertyInfo p1 = (PropertyInfo) getArg1();
        FObject refObj = null;
        try {
          refObj = (FObject)obj.getClass().getMethod("find" + StringUtil.capitalize(p1.getName()), foam.core.X.class)
            .invoke(obj, ((FObject)obj).getX());
        } catch ( Throwable t ) {
          Logger logger = (Logger) getX().get("logger");
          if ( logger == null ) {
            logger = new StdoutLogger();
          }
          logger.error(t);
        }
        return refObj;
      `
    },

    function comparePropertyValues(o1, o2) {
      return this.arg1.comparePropertyValues(o1, o2);
    }
  ]
});