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
    'foam.lib.PropertyPredicate',
    'foam.lib.StorageOptionalPropertyPredicate',
    'foam.lib.StoragePropertyPredicate',
    'foam.lib.formatter.FObjectFormatter',
    'foam.lib.formatter.JSONFObjectFormatter',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.session.Session',
    'java.util.ArrayList',
    'java.util.Date',
    'static foam.mlang.MLang.EQ',
    'foam.util.SafetyUtil'
  ],

  messages: [
    { name: 'CREATE_ERROR_MSG', message: 'Unexpected error creating history record for' }
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'historyDAO'
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'putPredicate',
      factory: function () {
        return foam.mlang.predicate.True.create();
      },
      javaFactory: `
        return foam.mlang.MLang.TRUE;
      `,
      documentation: `
        The condition under which a history record should be added
      `
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(
          `
            private static final PropertyPredicate PROPERTY_PREDICATE = new StoragePropertyPredicate();
            private static final PropertyPredicate OPTIONAL_PREDICATE = new StorageOptionalPropertyPredicate();

            protected static final ThreadLocal<FObjectFormatter> formatter__ = new ThreadLocal<FObjectFormatter>() {
              @Override
              protected JSONFObjectFormatter initialValue() {
                JSONFObjectFormatter formatter = new JSONFObjectFormatter();
                formatter.setPropertyPredicate(PROPERTY_PREDICATE);
                return formatter;
              }
              
              @Override
              public FObjectFormatter get() {
                FObjectFormatter formatter = super.get();
                formatter.reset();
                return formatter;
              }
            };

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
      name: 'getUpdatedProperties',
      visibility: 'protected',
      type: 'PropertyUpdate[]',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'FObject', name: 'currentValue' },
        { type: 'FObject', name: 'newValue' }
      ],
      documentation: 'Returns an array of updated properties',
      javaCode: `
        var updates = new ArrayList<PropertyUpdate>();
        var info = newValue.getClassInfo();
        var of = info.getObjClass().getSimpleName().toLowerCase();
        var props = info.getAxiomsByClass(PropertyInfo.class);

        for ( var prop : props ) {
          if ( PROPERTY_PREDICATE.propertyPredicateCheck(x, of, prop)
            && ! OPTIONAL_PREDICATE.propertyPredicateCheck(x, of, prop)
            && prop.compare(currentValue, newValue) != 0
          ) {
            updates.add(new PropertyUpdate(
              prop.getName(),
              prop.f(currentValue),
              prop.f(newValue)
            ));
          }
        }

        return updates.toArray(new PropertyUpdate[updates.size()]);
      `
    },
    {
      name: 'put_',
      javaCode: `
      if ( ! getPutPredicate().f(x.put("NEW", obj)) ) return super.put_(x, obj);
      Subject subject = (Subject) ((Session) x.get(Session.class)).getContext().get("subject");

      FObject current = this.find_(x, obj);
      Object objectId = obj.getProperty("id");

      if ( current == null ) {
        // do "put" first if it is "create" action.
        FObject persistObject = super.put_(x, obj);
        objectId = persistObject.getProperty("id");
        HistoryRecord historyRecord = new HistoryRecord();
        historyRecord.setObjectId(objectId);
        historyRecord.setTimestamp(new Date());
        historyRecord.setSubject(subject);
        getHistoryDAO().put_(x, historyRecord);
        return persistObject;
      } else {
        try {
          // add new history record
          HistoryRecord historyRecord = new HistoryRecord();
          historyRecord.setObjectId(objectId);
          historyRecord.setTimestamp(new Date());
          historyRecord.setSubject(subject);
          FObjectFormatter formatter = formatter__.get();
          if ( ! formatter.maybeOutputDelta(current, obj) ) {
            return super.put_(x, obj);
          }
          historyRecord.setUpdates(getUpdatedProperties(x, current, obj));
          getHistoryDAO().put_(x, historyRecord);
        } catch (Throwable t) {
          Logger l = (Logger) x.get("logger");
          l.error(CREATE_ERROR_MSG, obj.getClassInfo().getId(), t);
        }
        return super.put_(x, obj);
      }
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
