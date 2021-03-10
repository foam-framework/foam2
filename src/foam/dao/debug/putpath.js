foam.CLASS({
  package: 'foam.dao.debug',
  name: 'PutPathDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.FObject',
    'foam.dao.debug.PutPathAware',
    'java.util.Arrays'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        var obj_ = (PutPathAware) obj;
        var oldObj = (PutPathAware) this.find_(x, obj);
        if ( oldObj == null ) {
          obj_.describePut(x, "NEW", obj.toSummary());
          return super.put_(x, obj);
        }

        var oldHistory = oldObj.getUpdateHistory();
        var newHistory = obj_.getUpdateHistory();
        var i = oldHistory.length;
        var compatibleHistories =
          newHistory.length >= oldHistory.length &&
          oldHistory[i-1].getObjHash() == newHistory[i-1].getObjHash();

        if ( ! compatibleHistories ) {
          var newNewHistory = Arrays.copyOf(oldHistory,
            oldHistory.length + newHistory.length);
          System.arraycopy(
            newHistory, 0,
            newNewHistory, oldHistory.length,
            newHistory.length
          );
          newHistory = newNewHistory;
        }

        obj_.describePut(x, "PutPathDAO",
          compatibleHistories
            ? "Histories were compatible"
            : "Histories were merged");

        return super.put_(x, obj);
      `
    }
  ]
});

foam.CLASS({
  package: 'foam.dao.debug',
  name: 'PutPathElement',
  extends: 'foam.dao.history.HistoryRecord',
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
      name: 'objHash',
      class: 'Int'
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
    },
    {
      name: 'getUpdateHistory',
      type: 'foam.dao.debug.PutPathElement[]'
    },
    {
      name: 'setUpdateHistory',
      args: [
        {
          name: 'v',
          type: 'foam.dao.debug.PutPathElement[]'
        }
      ]
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
    'foam.dao.history.HistoryRecord',
    'foam.dao.history.PropertyUpdate',
    'foam.dao.debug.PutPathElement',
    'foam.lib.PropertyPredicate',
    'foam.lib.StorageOptionalPropertyPredicate',
    'foam.lib.StoragePropertyPredicate',
    'foam.nanos.app.AppConfig',
    'foam.nanos.app.Mode',
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
      hidden: true
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
        if ( ! checkDebugInfoEnabled(x) ) return;

        Subject subject = (Subject) x.get("subject");
        User user = subject.getUser();
        User agent = subject.getRealUser();

        var last = getLastUpdateSnapshot();

        var el = new PutPathElement.Builder(x)
          .setOrigin(origin)
          .setDescription(description)
          .setObjectId(getProperty("id"))
          .setUser(formatUserName(user))
          .setAgent(formatUserName(agent))
          .setTimestamp(new Date())
          .setObjHash(hashCode())
          .build();

        if ( last != null )
          el.setUpdates(getUpdatedProperties(x, last, this));

        setLastUpdateSnapshot(((FObject) this).fclone());

        addPutPathElement(el);
      `
    },
    {
      name: 'addPutPathElement',
      args: [
        { type: 'PutPathElement', name: 'el' },
      ],
      javaCode: `
        var arry = new PutPathElement[getUpdateHistory().length + 1];
        for ( var i = 0 ; i < getUpdateHistory().length; i++ ) {
          arry[i] = getUpdateHistory()[i];
        }
        arry[getUpdateHistory().length] = el;
        setUpdateHistory(arry);
      `
    },
    {
      name: 'checkDebugInfoEnabled',
      args: [
        { type: 'Context', name: 'x' },
      ],
      type: 'Boolean',
      javaCode: `
        AppConfig app = (AppConfig) x.get("appConfig");
        return app.getMode() != Mode.PRODUCTION;
      `
    }
  ]
});
