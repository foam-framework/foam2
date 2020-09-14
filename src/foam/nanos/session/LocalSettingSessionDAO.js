/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.session',
  name: 'LocalSettingSessionDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: 'LocalSettingSessionDAO is decorator for writting to localLocalSettingDAO, which is Session Context MDAO',
  javaImports: [
    'foam.core.X',
    'foam.dao.DAO'
  ],
  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(
          `
            public LocalSettingSessionDAO(X x, DAO delegate) {
              setX(x);
              setDelegate(delegate);
            } 
          `
        );
      }
    }
  ],
  methods: [
    {
      name: 'put_',
      javaCode: `
        DAO dao = (DAO)x.get(Session.class).getContext().get("localLocalSettingDAO");
        if ( dao == null )
          return null;
        return dao.put(obj);
      `
    },
    {
      name: 'remove_',
      javaCode: `
        DAO dao = (DAO)x.get(Session.class).getContext().get("localLocalSettingDAO");
        if ( dao == null )
          return null;
        return dao.remove_(x, obj);
      `
    }
  ]
});