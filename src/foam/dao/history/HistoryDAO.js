/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao.history',
  name: 'HistoryDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'java.util.Date',
    'java.util.Iterator',
    'java.util.Map',
    'static foam.mlang.MLang.EQ'
  ],

  messages: [
    { name: 'CREATE_ERROR_MSG', message: 'Unexpected error creating history record for' }
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'historyDAO'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(
          `
            public HistoryDAO(X x, String historyDAO, DAO delegate) {
              this(x, (DAO) x.get(historyDAO), delegate);
            }
          
            public HistoryDAO(X x, DAO historyDAO, DAO delegate) {
              super(x, delegate);
              setHistoryDAO(historyDAO);
            } 
          `
        );
      }
    }
  ],

  methods: [
    {
      name: 'formatUserName',
      visibility: 'protected',
      type: 'String',
      args: [
        { type: 'User', name: 'user ' }
      ],
      documentation: 'Formats a User record to the following string: LastName, FirstName (ID)',
      javaCode: `
        if ( user == null ) return "";
        return user.getLastName() +", " +
            user.getFirstName() +
            "(" + user.getId() + ")";
      `
    },
    {
      name: 'getUpdatedProperties',
      visibility: 'protected',
      type: 'PropertyUpdate[]',
      args: [
        { type: 'FObject', name: 'currentValue' },
        { type: 'FObject', name: 'newValue' }
      ],
      documentation: 'Returns an array of updated properties',
      javaCode: `
        Map diff = currentValue.diff(newValue);
        Iterator i = diff.keySet().iterator();

        int index = 0;
        PropertyUpdate[] updates = new PropertyUpdate[diff.keySet().size()];
        while ( i.hasNext() ) {
          String key = (String) i.next();
          PropertyInfo prop = (PropertyInfo) currentValue.getClassInfo().getAxiomByName(key);
          updates[index++] = new PropertyUpdate(key, prop.f(currentValue), diff.get(key));
        }

        return updates;
      `
    },
    {
      name: 'put_',
      javaCode: `
        Subject subject = (Subject) x.get("subject");
        User user = subject.getUser();
        User agent = subject.getRealUser();
        FObject current = this.find_(x, obj);
    
        try {
          // add new history record
          Object objectId = ((PropertyInfo) obj.getClassInfo().getAxiomByName("id")).f(obj);
          HistoryRecord historyRecord = new HistoryRecord();
          historyRecord.setObjectId(objectId);
          historyRecord.setUser(formatUserName(user));
          historyRecord.setAgent(formatUserName(agent));
          historyRecord.setTimestamp(new Date());
          if ( current != null ) {
            historyRecord.setUpdates(getUpdatedProperties(current, obj));
          }
    
          getHistoryDAO().put_(x, historyRecord);
        } catch (Throwable t) {
          Logger l = (Logger) x.get("logger");
          l.error(CREATE_ERROR_MSG, obj.getClassInfo().getId(), t);
        }
    
        return super.put_(x, obj);
      `
    },
    {
      name: 'remove_',
      javaCode: `
        Object objectId = ((PropertyInfo) obj.getClassInfo().getAxiomByName("id")).f(obj);
        getHistoryDAO().where(EQ(HistoryRecord.OBJECT_ID, objectId)).removeAll();
        return super.remove_(x, obj);
      `
    }
  ]
});
