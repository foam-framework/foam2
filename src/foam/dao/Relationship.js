/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'Relationship',
  implements: [{ path: 'foam.mlang.Expressions', java: false }],

  documentation: 'An Axiom for defining Relationships between models.',

  requires: [
    'foam.dao.ManyToManyRelationshipAxiom',
    'foam.dao.ManyToManyRelationshipDAO',
    'foam.dao.OneToManyRelationshipAxiom',
    'foam.dao.RelationshipDAO'
  ],

  properties: [
    'flags',
    {
      name: 'id',
      hidden: true,
      transient: true,
      getter: function() {
        return this.package ? this.package + '.' + this.name : this.name;
      }
    },
    {
      name: 'package',
      // Default to sourceModel's package if not specified.
      factory: function() {
        var i = this.sourceModel.lastIndexOf('.')
        return i == -1 ? '' : this.sourceModel.substring(0, i)
      }
    },
    {
      name: 'name',
      class: 'String',
      transient: true,
      hidden: true,
      getter: function() {
        var s = this.sourceModel;
        var t = this.targetModel;
        return s.substring(s.lastIndexOf('.') + 1) +
          t.substring(t.lastIndexOf('.') + 1) +
          foam.String.capitalize(this.forwardName) +
          'Relationship';
      }
    },
    'forwardName',
    {
      name: 'inverseName',
      class: 'String'
    },
    {
      name: 'cardinality',
      assertValue: function(value) {
        foam.assert(value === '1:*' || value === '*:*',
          'Supported cardinalities are 1:* and *:*');
      },
      value: '1:*'
    },
    {
      class: 'String',
      name: 'sourceModel'
    },
    {
      class: 'String',
      name: 'targetModel'
    },
    {
      class: 'String',
      name: 'junctionModel',
      expression: function(sourceModel, targetModel) {
        var source = sourceModel.substring(sourceModel.lastIndexOf('.') + 1);
        var target = targetModel.substring(targetModel.lastIndexOf('.') + 1);

        return (this.package ? this.package + '.' : '') +
          source + target + 'Junction';
    }
    },
    {
      class: 'String',
      name: 'sourceDAOKey',
      expression: function(sourceModel) {
        var sourceName = sourceModel.substring(sourceModel.lastIndexOf('.') + 1);
        return foam.String.daoize(sourceName);
      }
    },
    {
      class: 'String',
      name: 'unauthorizedSourceDAOKey',
    },
    {
      class: 'String',
      name: 'targetDAOKey',
      expression: function(targetModel) {
        var targetName = targetModel.substring(targetModel.lastIndexOf('.') + 1);
        return foam.String.daoize(targetName);
      }
    },
    {
      class: 'String',
      name: 'unauthorizedTargetDAOKey',
    },
    {
      class: 'String',
      name: 'junctionDAOKey',
      expression: function(junctionModel) {
        var junctionName = junctionModel.substring(junctionModel.lastIndexOf('.') + 1);
        return foam.String.daoize(junctionName);
      }
    },
    {
      name: 'adaptTarget',
      factory: function() {
        var inverseName = this.inverseName;

        return function(source, target) {
          target[inverseName] = source.id;

          return target;
        };
        }
    },
    {
      class: 'Boolean',
      name: 'oneWay'
    },
    {
      class: 'Map',
      name: 'sourceProperty'
    },
    {
      class: 'Map',
      name: 'sourceMethod'
    },
    {
      class: 'Map',
      name: 'targetProperty'
    },
    {
      class: 'Map',
      name: 'targetMethod'
    },
    {
      class: 'Boolean',
      name: 'sourceInitialized',
      value: false,
      transient: true
    },
    {
      class: 'Boolean',
      name: 'targetInitialized',
      value: false,
      transient: true
    },
    {
      class: 'Boolean',
      name: 'junctionInitialized',
      value: false,
      transient: true
    },
    'order',
    {
      class: 'Boolean',
      name: 'enabled',
      expression: function(flags) {
        var enabledFlags = Object.keys(global.FOAM_FLAGS)
          .filter(f => global.FOAM_FLAGS[f]);
        return foam.util.flagFilter(enabledFlags)(this);
      }
    },
    {
      class: 'String',
      name: 'extends',
      value: 'FObject',
      documentation: `
        Only used for many to many relationships.
        Name of the class that this junction class should inherit from.
      `
    }
    /* FUTURE:
    {
      name: 'deleteStrategy'
      // prevent, cascade, orphan
    }
    */
  ],

  methods: [
    function initSource(x) {
      if ( this.sourceInitialized ) return;
      this.sourceInitialized = true;
      if ( ! this.enabled ) return;

      var context = x || this.__context__;

      var source = context.lookup(this.sourceModel);

      // Add relationship to the axiom map so it can be found later.
      source.installAxiom(this);

      var prop;

      if ( this.cardinality === '1:*' ) {
        prop = foam.dao.OneToManyRelationshipAxiom.create({
          propertyName: this.forwardName,
          target: this.targetModel,
          targetPropertyName: this.inverseName,
          targetDAOKey: this.targetDAOKey,
          unauthorizedTargetDAOKey: this.unauthorizedTargetDAOKey,
          propertyOverrides: this.sourceProperty,
          methodOverrides: this.sourceMethod,
        });
      } else if ( this.cardinality === '*:*' ) {
        this.initJunction(x);

        prop = foam.dao.ManyToManyRelationshipAxiom.create({
          propertyName: this.forwardName,
          junction: this.junctionModel,
          junctionDAOKey: this.junctionDAOKey,
          targetDAOKey: this.targetDAOKey,
          unauthorizedTargetDAOKey: this.unauthorizedTargetDAOKey,
          targetProperty: 'targetId',
          sourceProperty: 'sourceId',
          propertyOverrides: this.sourceProperty,
          methodOverrides: this.sourceMethod,
        });
      } else {
        foam.assert(false, 'Unknown relationship cardinality.');
      }

      source.installAxiom(prop);
    },
    function initTarget(x) {
      if ( this.oneWay ) return;
      if ( this.targetInitialized ) return;
      this.targetInitialized = true;
      if ( ! this.enabled ) return;

      var context = x || this.__context__;

      var target = context.lookup(this.targetModel);

      // Add relationship to the axiom map so it can be found later.
      target.installAxiom(this);

      var prop;

      if ( this.cardinality === '1:*' ) {
        prop = foam.core.Reference.create({
          name: this.inverseName,
          of: this.sourceModel,
          targetDAOKey: this.sourceDAOKey,
          unauthorizedTargetDAOKey: this.unauthorizedSourceDAOKey
        }).copyFrom(this.targetProperty);
      } else if ( this.cardinality === '*:*' ) {
        this.initJunction(x);

        // works in the opposite direction.
        prop = foam.dao.ManyToManyRelationshipAxiom.create({
          propertyName: this.inverseName,
          junction: this.junctionModel,
          junctionDAOKey: this.junctionDAOKey,
          targetDAOKey: this.sourceDAOKey,
          unauthorizedTargetDAOKey: this.unauthorizedSourceDAOKey,
          targetProperty: 'sourceId',
          sourceProperty: 'targetId',
          propertyOverrides: this.targetProperty,
          methodOverrides: this.targetMethod,
        });
      } else {
        foam.assert(false, 'Unknown relationship cardinality.');
      }

      target.installAxiom(prop);
    },
    function initJunction(x) {
      if ( this.junctionInitialized ) return;
      this.junctionInitialized = true;
      if ( ! this.enabled ) return;

      // Only need a junction class if this is a Many to Many
      // relationship.
      if ( this.cardinality !== '*:*' )
        return;

      // No need to register junction again.
      if ( foam.isRegistered(this.junctionModel) )
        return;

      var name = this.junctionModel.substring(
        this.junctionModel.lastIndexOf('.') + 1);

      foam.CLASS({
        package: this.package,
        name: name,
        extends: this.extends,
        ids: ['sourceId', 'targetId'],
        properties: [
          {
            class: 'Reference',
            name: 'sourceId',
            shortName: 's',
            of: this.sourceModel,
          },
          {
            class: 'Reference',
            name: 'targetId',
            shortName: 't',
            of: this.targetModel
          }
        ]
      });
    }
  ]
});


foam.LIB({
  name: 'foam',
  methods: [
    function RELATIONSHIP(m, opt_ctx) {
      foam.__RELATIONSHIPS__ = foam.__RELATIONSHIPS__ || [];
      foam.__RELATIONSHIPS__.push(m);

      m.order = foam.__count++;

      var r = foam.dao.Relationship.create(m, opt_ctx);
      foam.package.registerClass(r);

      // Latch the junction right away, we have no idea when source or
      // model will be initialized but someone may want the junction
      // class first for some reason.
      r.initJunction();

      if ( foam.isDefined(r.sourceModel) ) r.initSource();
      else
        foam.pubsub.sub("defineClass", r.sourceModel, function(s) {
          s && s.detach();

          r.initSource();
        });

      if ( foam.isDefined(r.targetModel) ) r.initTarget();
      else
        foam.pubsub.sub("defineClass", r.targetModel, function(s) {
          s && s.detach();

          r.initTarget();
        });
    }
  ]
});

foam.INTERFACE({
  package: 'foam.dao',
  name: 'ManyToManyRelationship',
  methods: [
    {
      name: 'add',
      async: true,
      swiftThrows: true,
      args: [
        { name: 'target', type: 'FObject' }
      ]
    },
    {
      name: 'remove',
      async: true,
      swiftThrows: true,
      args: [
        { name: 'target', type: 'FObject' }
      ]
    },
    // TODO: Make these readOnly properties when we have that support.
    {
      name: 'getDAO',
      type: 'foam.dao.DAO'
    },
    {
      name: 'getJunctionDAO',
      type: 'foam.dao.DAO'
    },
    {
      name: 'getTargetDAO',
      type: 'foam.dao.DAO'
    },
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'ManyToManyRelationshipImpl',
  implements: ['foam.dao.ManyToManyRelationship'],
  properties: [
    {
      class: 'Class',
      name: 'junction',
      hidden: true
    },
    {
      class: 'Object',
      name: 'sourceId',
      hidden: true
    },
    {
      class: 'String',
      name: 'targetDAOKey',
      hidden: true
    },
    {
      class: 'String',
      name: 'unauthorizedTargetDAOKey',
      hidden: true
    },
    {
      class: 'String',
      name: 'junctionDAOKey',
      hidden: true
    },
    {
      class: 'Object',
      javaType: 'foam.core.PropertyInfo',
      swiftType: 'PropertyInfo',
      name: 'targetProperty',
      hidden: true
    },
    {
      class: 'Object',
      javaType: 'foam.core.PropertyInfo',
      swiftType: 'PropertyInfo',
      name: 'sourceProperty',
      hidden: true
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      label: '',
      factory: function() {
        var targetDAO = this.__context__[this.targetDAOKey];
        foam.assert(targetDAO, 'Missing DAO for targetDAOKey', this.targetDAOKey);

        return foam.dao.ManyToManyRelationshipDAO.create({
          relationship: this,
          delegate: targetDAO
        }, this);
      },
      javaFactory: `
        try {
          return new foam.dao.ManyToManyRelationshipDAO.Builder(getX()).
            setRelationship(this).
            setTargetDAOKey(getTargetDAOKey()).
            setUnauthorizedTargetDAOKey(getUnauthorizedTargetDAOKey()).
            setDelegate((foam.dao.DAO)getX().get(getTargetDAOKey())).
            build();
        } catch ( NullPointerException e ) {
          foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) getX().get("logger");
          logger.error("TargetDAOKey", getTargetDAOKey(), "not found.", e);
          throw e;
        }
        `
  ,
      swiftFactory:
`return __context__.create(foam_dao_ManyToManyRelationshipDAO.self, args: [
  "relationship": self,
  "delegate": __context__[targetDAOKey]
])`
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'junctionDAO',
      hidden: true,
      factory: function() {
        return this.__context__[this.junctionDAOKey];
      },
      javaFactory: 'return (foam.dao.DAO)getX().get(getJunctionDAOKey());',
      swiftFactory: 'return __context__[junctionDAOKey] as? (foam_dao_DAO & foam_core_FObject)'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'targetDAO',
      hidden: true,
      factory: function() {
        var targetDAO = this.__context__[this.targetDAOKey];
        foam.assert(targetDAO, 'Missing DAO for targetDAOKey', this.targetDAOKey);

        return targetDAO;
      },
      javaFactory: `
        try {
          return (foam.dao.DAO)getX().get(getTargetDAOKey());
        } catch ( NullPointerException e ) {
          foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) getX().get("logger");
          logger.error("TargetDAOKey", getTargetDAOKey(), "not found.", e);
          throw e;
        }
      `,
      swiftFactory: 'return __context__[targetDAOKey] as? (foam_dao_DAO & foam_core_FObject)'
    }
  ],

  methods: [
    {
      name: 'add',
      args: [{ name: 'target', type: 'FObject' }],
      javaCode: `getJunctionDAO()
              .put_(getX(), createJunction(((foam.core.Identifiable)target)
              .getPrimaryKey()));`,
      swiftCode: `_ = try junctionDAO!
              .put(createJunction((target as? foam_core_Identifiable)?
              .getPrimaryKey()))`,
      code: function add(target) {
        return this.junctionDAO.put(this.createJunction(target.id));
      }
    },
    {
      name: 'remove',
      javaCode: `getJunctionDAO()
              .remove_(getX(), createJunction(((foam.core.Identifiable)target)
              .getPrimaryKey()));`,
      swiftCode: `_ = try junctionDAO!
              .remove(createJunction((target as? foam_core_Identifiable)?
              .getPrimaryKey()))`,
      code: function remove(target) {
        return this.junctionDAO.remove(this.createJunction(target.id));
      }
    },
    {
      name: 'createJunction',
      args: [{ name: 'targetId', type: 'Any' }],
      type: 'foam.core.FObject',
      code: function createJunction(targetId) {
        foam.assert( ( ! foam.Undefined.isInstance(this.sourceId) ) &&
                     ( ! foam.Undefined.isInstance(targetId) ),
                    'Cannot create an association with an object that isn\'t stored in a DAO yet.');
        var junction = this.junction.create(null, this);
        this.targetProperty.set(junction, targetId);
        this.sourceProperty.set(junction, this.sourceId);
        return junction;
      },
      javaCode: `foam.core.FObject junction = (foam.core.FObject)getX().create(getJunction().getObjClass());
getTargetProperty().set(junction, targetId);
getSourceProperty().set(junction, getSourceId());
return junction;`,

      swiftCode: `let junction: foam_core_FObject = self.junction.create(x: __context__) as! foam_core_FObject
targetProperty.set(junction, value: targetId)
sourceProperty.set(junction, value: sourceId)
return junction`
    },
    {
      name: 'getJunctionDAO',
      swiftCode: 'return junctionDAO!',
      code: function() { return this.junctionDAO; }
    },
    {
      name: 'getTargetDAO',
      swiftCode: 'return targetDAO!',
      code: function() { return this.targetDAO; }
    },
    {
      name: 'getDAO',
      javaCode: 'return getDao();',
      swiftCode: 'return dao!',
      code: function getDAO() { return this.dao; }
    }
  ],
  actions: [
    {
      name: 'addItem',
      label: 'Add',
      code: function(x) {
        var self = this;
        var dao = x[self.targetDAOKey];

        var controller = foam.comics.DAOController.create({
          createEnabled: false,
          editEnabled: false,
          selectEnabled: true,
          exportEnabled: false,
          relationship: this,
          data: dao,
          createLabel: 'Add',
          title: `Add ${dao.of.model_.plural}`,
          subtitle: `Select ${dao.of.model_.plural} from the table and click "Add" to add them.`
        }, x);

        controller.sub('select', function(s, _, selectedObjects) {
          Object.values(selectedObjects).forEach((obj) => {
            self.add(obj);
          });
        });

        x.stack.push({
          class: 'foam.comics.DAOControllerView',
          data: controller
        });
      }
    },
    {
      name: 'removeItem',
      label: 'Remove',
      code: function(x) {
        var self = this;
        var dao = self.dao;

        var controller = foam.comics.DAOController.create({
          createEnabled: false,
          editEnabled: false,
          selectEnabled: true,
          relationship: this,
          data: dao,
          createLabel: 'Remove',
          title: `Remove ${dao.of.model_.plural}`,
          subtitle: `Select ${dao.of.model_.plural} from the table and click "Remove" to remove them.`
        }, x);

        controller.sub('select', function(s, _, selectedObjects) {
          Object.values(selectedObjects).forEach((obj) => {
            self.remove(obj);
          });
        });

        x.stack.push({
          class: 'foam.comics.DAOControllerView',
          data: controller
        });
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'OneToManyRelationshipAxiom',
  requires: [
    'foam.dao.OneToManyRelationshipMethod',
    'foam.dao.OneToManyRelationshipProperty',
  ],
  properties: [
    {
      name: 'name',
      expression: function(propertyName) {
        return propertyName + 'Axiom';
      },
    },
    'propertyName',
    {
      name: 'methodName',
      expression: function(propertyName) {
        return 'get' + foam.String.capitalize(propertyName);
      },
    },
    ['transient', true],
    ['tableCellFormatter', null],
    ['cloneProperty', function() {}],
    ['javaCloneProperty', '//noop'],
    ['javaDiffProperty', '//noop'],
    ['generateJava', false],
    {
      class: 'String',
      name: 'targetPropertyName',
      documentation: 'We don\'t just use targetProperty here because at the time that this axiom is created, the target property may not even be installed yet on the target.  So instead we use a combination of targetPropertyName and target class and get the actual property when needed.'
    },
    {
      class: 'String',
      name: 'target'
    },
    {
      class: 'String',
      name: 'targetDAOKey'
    },
    {
      class: 'String',
      name: 'unauthorizedTargetDAOKey'
    },
    {
      class: 'Map',
      name: 'propertyOverrides'
    },
    {
      class: 'Map',
      name: 'methodOverrides'
    },
  ],
  methods: [
    function installInClass(cls) {
      cls.installAxiom(this.OneToManyRelationshipMethod.create({
        name: this.methodName,
        target: this.target,
        targetPropertyName: this.targetPropertyName,
        targetDAOKey: this.targetDAOKey,
        unauthorizedTargetDAOKey: this.unauthorizedTargetDAOKey
      }).copyFrom(this.methodOverrides));

      cls.installAxiom(this.OneToManyRelationshipProperty.create({
        name: this.propertyName,
        methodName: this.methodName,
      }).copyFrom(this.propertyOverrides));
    },
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'OneToManyRelationshipProperty',
  extends: 'foam.dao.DAOProperty',
  properties: [
    {
      name: 'visibility',
      value: function(id) {
        return !! id ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      name: 'flags',
      value: ['swift', 'js'],
    },
    {
      name: 'methodName',
    },
    {
      name: 'getter',
      expression: function(methodName) {
        return function() {
          return this[methodName](this.__context__);
        };
      },
    },
    {
      name: 'swiftGetter',
      flags: ['swift'],
      expression: function(methodName) {
        return `return ${methodName}(__context__) as? (foam_dao_DAO & foam_core_FObject)`
      },
    },
  ],
});

foam.CLASS({
  package: 'foam.dao',
  name: 'OneToManyRelationshipMethod',
  extends: 'foam.core.Method',
  properties: [
    {
      class: 'String',
      name: 'target',
    },
    {
      class: 'String',
      name: 'targetPropertyName',
    },
    {
      class: 'String',
      name: 'targetDAOKey'
    },
    {
      class: 'String',
      name: 'unauthorizedTargetDAOKey'
    },
    {
      name: 'args',
      factory: function() {
        return [
          {
            name: 'x',
            type: 'Context'
          }
        ];
      },
    },
    {
      name: 'type',
      value: 'foam.dao.DAO',
    },
    {
      name: 'code',
      expression: function(target, targetDAOKey, targetPropertyName) {
        return function(x) {
          return foam.dao.RelationshipDAO.create({
            sourceId: this.id,
            targetProperty: x.lookup(target).getAxiomByName(targetPropertyName),
            targetDAOKey: targetDAOKey,
            unauthorizedTargetDAOKey: this.unauthorizedTargetDAOKey
          }, x);
        }
      },
    },
    {
      name: 'swiftCode',
      flags: ['swift'],
      expression: function(target, targetPropertyName, targetDAOKey, unauthorizedTargetDAOKey) {
        return `
          return x?.create(foam_dao_RelationshipDAO.self, args: [
            "sourceId": self.id,
            "targetProperty": ${foam.swift.toSwiftName(target)}.${foam.String.constantize(targetPropertyName)}(),
            "targetDAOKey": "${targetDAOKey}",
            "unauthorizedTargetDAOKey": "${unauthorizedTargetDAOKey}"
          ])!;
        `
      },
    },
    {
      name: 'javaCode',
      flags: ['java'],
      expression: function(target, targetPropertyName, targetDAOKey, unauthorizedTargetDAOKey) {
        return `
          return new foam.dao.RelationshipDAO.Builder(x)
              .setSourceId(getId())
              .setTargetProperty(${target}.${foam.String.constantize(targetPropertyName)})
              .setTargetDAOKey("${targetDAOKey}")
              .setUnauthorizedTargetDAOKey("${unauthorizedTargetDAOKey}")
              .build();
        `
      },
    },
  ],
});

foam.CLASS({
  package: 'foam.dao',
  name: 'ManyToManyRelationshipAxiom',
  requires: [
    'foam.dao.ManyToManyRelationshipProperty',
    'foam.dao.ManyToManyRelationshipMethod',
  ],
  properties: [
    {
      name: 'name',
      expression: function(propertyName) {
        return propertyName + 'Axiom';
      },
    },
    'propertyName',
    {
      name: 'methodName',
      expression: function(propertyName) {
        return 'get' + foam.String.capitalize(propertyName);
      },
    },
    ['of', 'foam.dao.ManyToManyRelationship'],
    ['transient', true],
    ['javaInfoType', 'foam.core.AbstractFObjectRelationshipPropertyInfo'],
    ['tableCellFormatter', null],
    ['cloneProperty', function() {}],
    ['javaCloneProperty', '//noop'],
    ['javaDiffProperty', '//noop'],
    ['generateJava', false],
    ['view', { class: 'foam.u2.DetailView', showActions: true }],
    {
      class: 'String',
      name: 'junction'
    },
    {
      class: 'String',
      name: 'sourceProperty',
    },
    {
      class: 'String',
      name: 'junctionDAOKey'
    },
    {
      class: 'String',
      name: 'targetDAOKey'
    },
    {
      class: 'String',
      name: 'unauthorizedTargetDAOKey'
    },
    {
      class: 'String',
      name: 'targetProperty'
    },
    {
      class: 'Map',
      name: 'propertyOverrides'
    },
    {
      class: 'Map',
      name: 'methodOverrides'
    },
  ],

  methods: [
    function installInClass(cls) {
      cls.installAxiom(this.ManyToManyRelationshipMethod.create({
        sourceProperty: this.sourceProperty,
        targetProperty: this.targetProperty,
        targetDAOKey: this.targetDAOKey,
        unauthorizedTargetDAOKey: this.unauthorizedTargetDAOKey,
        junctionDAOKey: this.junctionDAOKey,
        junction: this.junction,
        name: this.methodName,
      }).copyFrom(this.methodOverrides));
      cls.installAxiom(this.ManyToManyRelationshipProperty.create({
        name: this.propertyName,
        methodName: this.methodName,
      }).copyFrom(this.propertyOverrides));
    },
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'ManyToManyRelationshipMethod',
  extends: 'foam.core.Method',
  properties: [
    {
      class: 'String',
      name: 'sourceProperty'
    },
    {
      class: 'String',
      name: 'targetProperty'
    },
    {
      class: 'String',
      name: 'targetDAOKey'
    },
    {
      class: 'String',
      name: 'unauthorizedTargetDAOKey'
    },
    {
      class: 'String',
      name: 'junctionDAOKey'
    },
    {
      class: 'String',
      name: 'junction'
    },
    {
      name: 'args',
      factory: function() {
        return [
          {
            name: 'x',
            type: 'Context'
          }
        ];
      },
    },
    {
      name: 'type',
      value: 'foam.dao.ManyToManyRelationship',
    },
    {
      name: 'code',
      factory: function() {
        var self = this;
        return function(x) {
          return foam.dao.ManyToManyRelationshipImpl.create({
            sourceId: this.id,
            sourceProperty: x.lookup(self.junction).getAxiomByName(self.sourceProperty),
            targetProperty: x.lookup(self.junction).getAxiomByName(self.targetProperty),
            targetDAOKey: self.targetDAOKey,
            unauthorizedTargetDAOKey: self.unauthorizedTargetDAOKey,
            junctionDAOKey: self.junctionDAOKey,
            junction: x.lookup(self.junction)
          }, x);
        };
      },
    },
    {
      name: 'swiftCode',
      flags: ['swift'],
      expression: function(junction, sourceProperty, targetProperty, targetDAOKey, junctionDAOKey, unauthorizedTargetDAOKey) {
        return `
          return x!.create(foam_dao_ManyToManyRelationshipImpl.self, args: [
            "sourceId": self.id,
            "sourceProperty": ${foam.swift.toSwiftName(junction)}.${foam.String.constantize(sourceProperty)}(),
            "targetProperty": ${foam.swift.toSwiftName(junction)}.${foam.String.constantize(targetProperty)}(),
            "targetDAOKey": "${targetDAOKey}",
            "unauthorizedTargetDAOKey": "${unauthorizedTargetDAOKey}",
            "junctionDAOKey": "${junctionDAOKey}",
            "junction": ${foam.swift.toSwiftName(junction)}.classInfo()
          ])!;
        `
      },
    },
    {
      name: 'javaCode',
      flags: ['java'],
      expression: function(junction, sourceProperty, targetProperty, targetDAOKey, unauthorizedTargetDAOKey, junctionDAOKey) {
        return `
          return new foam.dao.ManyToManyRelationshipImpl.Builder(x)
              .setSourceId(getId())
              .setSourceProperty(${junction}.${foam.String.constantize(sourceProperty)})
              .setTargetProperty(${junction}.${foam.String.constantize(targetProperty)})
              .setTargetDAOKey("${targetDAOKey}")
              .setUnauthorizedTargetDAOKey("${unauthorizedTargetDAOKey}")
              .setJunctionDAOKey("${junctionDAOKey}")
              .setJunction(${junction}.getOwnClassInfo())
              .build();
        `
      },
    },
  ],
});

foam.CLASS({
  package: 'foam.dao',
  name: 'ManyToManyRelationshipProperty',
  extends: 'FObjectProperty',
  properties: [
    {
      name: 'flags',
      value: ['swift', 'js'],
    },
    {
      name: 'of',
      value: 'foam.dao.ManyToManyRelationship',
    },
    {
      name: 'transient',
      value: true,
    },
    {
      name: 'methodName',
    },
    {
      name: 'getter',
      expression: function(methodName) {
        return function() {
          return this[methodName](this.__context__);
        };
      },
    },
    {
      name: 'setter',
      value: function() {},
    },
    {
      name: 'swiftGetter',
      flags: ['swift'],
      expression: function(methodName) {
        return `return ${methodName}(__context__)`
      },
    },
    {
      name: 'swiftSetter',
      flags: ['swift'],
      value: '// NOOP',
    },
    {
      name: 'createVisibility',
      value: 'HIDDEN'
    },
    {
      name: 'view',
      value: {
        class: 'foam.u2.view.FObjectPropertyView',
        readView: { class: 'foam.u2.view.ReadManyToManyRelationshipPropertyView' }
      }
    }
  ],
});
