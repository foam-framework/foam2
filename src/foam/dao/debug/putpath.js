foam.CLASS({
  package: 'foam.dao.debug',
  name: 'PutPathElement',
  documentation: `
    Interface for objects that can store a path of operations they
    encountered during a put operation.
  `,

  properties: [
    {
      name: 'origin',
      class: 'String'
    },
    {
      name: 'description',
      class: 'String'
    },
    {
      name: 'historyRecord',
      class: 'FObjectProperty',
      of: 'foam.dao.history.HistoryRecord',
    },
    {
      name: 'snapshot',
      class: 'FObjectProperty'
    }
  ]
});

foam.INTERFACE({
  package: 'foam.dao.debug',
  name: 'PutPathAware',
  documentation: `
    Interface for objects that can store a path of operations they
    encountered during a put operation.
  `,

  methods: [
    {
      name: 'describePut',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'origin', type: 'String' },
        { name: 'description', type: 'String' }
      ],
    }
  ]
});

foam.CLASS({
  package: 'foam.dao.debug',
  name: 'PutPathTracking',
  implements: ['foam.dao.debug.PutPathAware'],
  documentation: `
    Interface for objects that can store a path of operations they
    encountered during a put operation.
  `,

  javaImports: [
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'foam.core.X',
    'foam.lib.PropertyPredicate',
    'foam.lib.StorageOptionalPropertyPredicate',
    'foam.lib.StoragePropertyPredicate',
    'foam.dao.history.HistoryRecord',
    'foam.dao.history.PropertyUpdate',
    'foam.dao.debug.PutPathElement',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'java.util.ArrayList',
    'java.util.Date',
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(
          `
            private static final PropertyPredicate PROPERTY_PREDICATE = new StoragePropertyPredicate();
            private static final PropertyPredicate OPTIONAL_PREDICATE = new StorageOptionalPropertyPredicate();
          `
        );
      }
    }
  ],

  properties: [
    {
      name: 'updateHistory',
      class: 'FObjectArray',
      of: 'foam.dao.debug.PutPathElement',
      javaFactory: `
        return new PutPathElement[0];
      `
    },
    {
      name: 'lastUpdateSnapshot',
      class: 'FObjectProperty',
    },
  ],

  methods: [
    {
      // TODO: DRY with mixin
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
      // TODO: DRY with mixin
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
          if ( prop.getName().equals("updateHistory")
            || prop.getName().equals("lastUpdateSnapshot")
          ) continue;
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
      name: 'describePut',
      args: [
        { type: 'Context', name: 'x' },
        { name: 'origin', type: 'String' },
        { name: 'description', type: 'String' }
      ],
      javaCode: `
        var arry = new PutPathElement[getUpdateHistory().length + 1];

        Subject subject = (Subject) x.get("subject");
        User user = subject.getUser();
        User agent = subject.getRealUser();

        var last = getLastUpdateSnapshot();

        var historyRecord = new HistoryRecord();

        historyRecord.setObjectId(getProperty("id"));
        historyRecord.setUser(formatUserName(user));
        historyRecord.setAgent(formatUserName(agent));
        historyRecord.setTimestamp(new Date());
        if ( last != null )
          historyRecord.setUpdates(getUpdatedProperties(x, last, this));

        setLastUpdateSnapshot(((FObject) this).fclone());

        for ( var i = 0 ; i < getUpdateHistory().length; i++ ) {
          arry[i] = getUpdateHistory()[i];
        }
        arry[getUpdateHistory().length] = new PutPathElement.Builder(x)
          .setOrigin(origin)
          .setDescription(description)
          .setHistoryRecord(historyRecord)
          .build();
        setUpdateHistory(arry);
      `
    }
  ]
});
