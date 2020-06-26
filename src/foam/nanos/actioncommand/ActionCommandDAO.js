/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.actioncommand',
  name: 'ActionCommandDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.ClassInfo',
    'foam.core.FObject',
    'foam.core.X',
    'foam.nanos.actioncommand.ActionCommand',
    'java.lang.IllegalAccessException',
    'java.lang.NoSuchMethodException',
    'java.lang.SecurityException',
    'java.lang.reflect.InvocationTargetException',
    'java.lang.reflect.Method'
  ],

  methods: [
    {
      name: 'cmd_',
      javaCode: `
        if ( obj instanceof ActionCommand ) {
          String objID      = ((ActionCommand)obj).getObjectID();
          FObject actionObj = super.find_(x, objID);
    
          try {
            // Calling method
            Method action = actionObj.getClass().getDeclaredMethod(((ActionCommand)obj).getActionName());
            action.invoke(actionObj);
          } catch ( SecurityException | NoSuchMethodException | IllegalAccessException | InvocationTargetException e) {
          }
    
          return true;
        }
    
        return super.cmd(obj);
      `
    }
  ]
});
