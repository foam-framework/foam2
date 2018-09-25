foam.CLASS({
  package: 'foam.dao',
  name: 'RoutingJournal',
  extends: 'foam.dao.ProxyJournal',

  documentation: 'DAO that routes objects read from journal to other DAO\'s',

  properties: [
    {
      class: 'Map',
      name: 'router',
      javaType: 'java.util.Map<Class<? extends foam.core.FObject>, foam.dao.DAO>'
    }
  ],

  methods: [
    {
      name: 'replay',
      javaCode: `
        super.replay(x, new foam.dao.ProxyDAO() {

          @Override
          public foam.core.FObject put_(foam.core.X x, foam.core.FObject obj) {
            return getDAO(obj).put_(x, obj);
          }

          @Override
          public foam.core.FObject remove_(foam.core.X x, foam.core.FObject obj) {
            return getDAO(obj).remove_(x, obj);
          }

          /**
           * Given an FObject, finds the DAO that the FObject should be stored in
           *
           * @param obj FObject to find the DAO for
           * @return the DAO to store the object in
           */
          protected foam.dao.DAO getDAO(foam.core.FObject obj) {
            DAO dao;
            Class cls = obj.getClass();

            // find the DAO by the class, if DAO not found for given class,
            // check the parent class until no more parent classes.
            while ( ( dao = getRouter().get(cls) ) == null && cls != null ) {
              cls = cls.getSuperclass();
            }

            if ( dao == null ) {
              throw new RuntimeException("DAO not found for class: " + obj.getClass().getName());
            }

            return dao;
          }
        });
      `
    }
  ]
});
