foam.CLASS({
  package: 'foam.nanos.session',
  name: 'LocalSettingSessionDAO',
  extends: 'foam.dao.ProxyDAO',
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
        foam.dao.DAO dao = (foam.dao.DAO)x.get("localLocalSettingDAO");
        return dao.put(obj);
      `
    }
  ]
});