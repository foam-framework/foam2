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
    'foam.dao.ReadOnlyDAO',
    'foam.dao.RelationshipDAO'
  ],

  properties: [
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
      name: 'targetDAOKey',
      expression: function(targetModel) {
        var targetName = targetModel.substring(targetModel.lastIndexOf('.') + 1);
        return foam.String.daoize(targetName);
      }
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
      name: 'initialized',
      value: false,
      transient: true
    },
    'order'
    /* FUTURE:
    {
      name: 'deleteStrategy'
      // prevent, cascade, orphan
    }
    */
  ],

  methods: [
    function initRelationship(x) {
      console.log("Initializing", this.id);
      if ( this.initialized ) return;
      this.initialized = true;

      var context = x || this.__context__;

      var sourceProp;
      var targetProp;
      var cardinality   = this.cardinality;
      var forwardName   = this.forwardName;
      var inverseName   = this.inverseName;
      var sourceModel   = this.sourceModel;
      var targetModel   = this.targetModel;
      var junctionModel = this.junctionModel;
      var source        = context.lookup(sourceModel);
      var target        = context.lookup(targetModel);
      var junction      = context.lookup(junctionModel, true);
      var sourceDAOKey  = this.sourceDAOKey;
      var targetDAOKey  = this.targetDAOKey;

      // Add Relationship to axioms lists for each model, for reference
      source.axiomMap_[this.id] = this;
      // Could be related to itself, so avoid adding twice
      if ( source !== target ) target.axiomMap_[this.id] = this;

      if ( cardinality === '1:*' ) {
        sourceProp = foam.dao.OneToManyRelationshipAxiom.create({
          propertyName: forwardName,
          target: target,
          targetPropertyName: inverseName,
          targetDAOKey: targetDAOKey,
          propertyOverrides: this.sourceProperty,
          methodOverrides: this.sourceMethod,
        });

        targetProp = foam.core.Reference.create({
          name: inverseName,
          of: sourceModel,
          targetDAOKey: sourceDAOKey
        }).copyFrom(this.targetProperty);
      } else {/* cardinality === '*.*' */
        if ( ! junction ) {
          var name = this.junctionModel.substring(
            this.junctionModel.lastIndexOf('.') + 1);
          foam.CLASS({
            package: this.package,
            name: name,
            ids: ['sourceId', 'targetId'],
            properties: [
              {
                class: 'Reference',
                name: 'sourceId',
                shortName: 's',
                of: source,
              },
              {
                class: 'Reference',
                name: 'targetId',
                shortName: 't',
                of: target
              }
            ]
          });

          junction = context.lookup(this.junctionModel);
        }

        var junctionDAOKey = this.junctionDAOKey;

        sourceProp = foam.dao.ManyToManyRelationshipAxiom.create({
          propertyName: forwardName,
          junction: junction,
          junctionDAOKey: junctionDAOKey,
          targetDAOKey: targetDAOKey,
          targetProperty: junction.TARGET_ID,
          sourceProperty: junction.SOURCE_ID,
          propertyOverrides: this.sourceProperty,
          methodOverrides: this.sourceMethod,
        });

          // Same as sourceProp except we swap target/source so that this relationship
          // works in the opposite direction.
        targetProp = foam.dao.ManyToManyRelationshipAxiom.create({
          propertyName: inverseName,
          junction: junction,
          junctionDAOKey: junctionDAOKey,
          targetDAOKey: sourceDAOKey,
          targetProperty: junction.SOURCE_ID,
          sourceProperty: junction.TARGET_ID,
          propertyOverrides: this.targetProperty,
          methodOverrides: this.targetMethod,
        });
      }

      source.installAxiom(sourceProp);

      if ( ! this.oneWay && ! target.getAxiomByName(targetProp.name) ) {
        target.installAxiom(targetProp);
      }

      /*
      if ( ! this.oneWay ) {
        sourceProperty.preSet = function(_, newValue) {
          if ( newValue ) {
            for ( var i = 0 ; i < sourceProps.length ; i++ ) {
              newValue[targetProps[i].name] = this[sourceProps[i]];
            }
          }
          return newValue;
        };
      }
      */
      foam.package.registerClass(this);
      return this;
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

      function trigger(s) {
        console.log("Trigger", r.id);
        s && s.detach();

        r.validate && r.validate();
        r.initRelationship();
      }

      if ( foam.__context__.isDefined(r.sourceModel) ||
           foam.__context__.isDefined(r.targetModel) ) trigger();
      else {
        foam.pubsub.sub("defineClass", r.sourceModel, trigger);
        foam.pubsub.sub("defineClass", r.targetModel, trigger);
      }
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
      returns: 'foam.dao.DAO'
    },
    {
      name: 'getJunctionDAO',
      returns: 'foam.dao.DAO'
    },
    {
      name: 'getTargetDAO',
      returns: 'foam.dao.DAO'
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
        return foam.dao.ReadOnlyDAO.create({
          delegate: foam.dao.ManyToManyRelationshipDAO.create({
            relationship: this,
            delegate: this.__context__[this.targetDAOKey]
          }, this)
        }, this);
      },
      javaFactory: `return new foam.dao.ReadOnlyDAO.Builder(getX()).
  setDelegate(new foam.dao.ManyToManyRelationshipDAO.Builder(getX()).
    setRelationship(this).
    setDelegate((foam.dao.DAO)getX().get(getTargetDAOKey())).
    build()).
  build();`,

      swiftFactory:
`return __context__.create(foam_dao_ReadOnlyDAO.self, args: [
  "delegate": __context__.create(foam_dao_ManyToManyRelationshipDAO.self, args: [
    "relationship": self,
    "delegate": __context__[targetDAOKey]
  ])
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
        return this.__context__[this.targetDAOKey];
      },
      javaFactory: 'return (foam.dao.DAO)getX().get(getTargetDAOKey());',
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
      returns: 'foam.core.FObject',
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
          addEnabled: false,
          relationship: this,
          data: dao
        }, x);

        controller.sub('select', function(s, _, id) {
          dao.find(id).then(function(obj) { self.add(obj); });
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
          addEnabled: false,
          relationship: this,
          data: dao
        }, x);

        controller.sub('select', function(s, _, id) {
          dao.find(id).then(function(obj) { self.remove(obj); });
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
    ['cloneProperty', function(value, map) {}],
    ['javaCloneProperty', '//noop'],
    ['javaDiffProperty', '//noop'],
    ['generateJava', false],
    {
      class: 'String',
      name: 'targetPropertyName',
      documentation: 'We don\'t just use targetProperty here because at the time that this axiom is created, the target property may not even be installed yet on the target.  So instead we use a combination of targetPropertyName and target class and get the actual property when needed.'
    },
    {
      class: 'Class',
      name: 'target'
    },
    {
      class: 'String',
      name: 'targetDAOKey'
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
    'target',
    'targetPropertyName',
    'targetDAOKey',
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
      name: 'returns',
      value: 'foam.dao.DAO',
    },
    {
      name: 'code',
      expression: function(target, targetDAOKey, targetPropertyName) {
        return function(x) {
          return foam.dao.RelationshipDAO.create({
            sourceId: this.id,
            targetProperty: target.getAxiomByName(targetPropertyName),
            targetDAOKey: targetDAOKey
          }, x);
        }
      },
    },
    {
      name: 'swiftCode',
      flags: ['swift'],
      expression: function(target, targetPropertyName, targetDAOKey) {
        return `
          return x.create(foam_dao_RelationshipDAO.self, args: [
            "sourceId": self.id,
            "targetProperty": ${target.model_.swiftName}.${foam.String.constantize(targetPropertyName)}(),
            "targetDAOKey": "${targetDAOKey}",
          ])!;
        `
      },
    },
    {
      name: 'javaCode',
      expression: function(target, targetPropertyName, targetDAOKey) {
        return `
          return new foam.dao.RelationshipDAO.Builder(x)
              .setSourceId(getId())
              .setTargetProperty(${target.id}.${foam.String.constantize(targetPropertyName)})
              .setTargetDAOKey("${targetDAOKey}")
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
    ['cloneProperty', function(value, map) {}],
    ['javaCloneProperty', '//noop'],
    ['javaDiffProperty', '//noop'],
    ['generateJava', false],
    ['view', { class: 'foam.u2.DetailView', showActions: true }],
    {
      class: 'Class',
      name: 'junction'
    },
    {
      class: 'Class',
      name: 'target'
    },
    'sourceProperty',
    {
      class: 'String',
      name: 'junctionDAOKey'
    },
    {
      class: 'String',
      name: 'targetDAOKey'
    },
    'targetProperty',
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
    'sourceProperty',
    'targetProperty',
    'targetDAOKey',
    'junctionDAOKey',
    'junction',
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
      name: 'returns',
      value: 'foam.dao.ManyToManyRelationship',
    },
    {
      name: 'code',
      factory: function() {
        var self = this;
        return function(x) {
          return foam.dao.ManyToManyRelationshipImpl.create({
            sourceId: this.id,
            sourceProperty: self.sourceProperty,
            targetProperty: self.targetProperty,
            targetDAOKey: self.targetDAOKey,
            junctionDAOKey: self.junctionDAOKey,
            junction: self.junction
          }, x);
        }
      },
    },
    {
      name: 'swiftCode',
      flags: ['swift'],
      expression: function(sourceProperty, targetProperty, targetDAOKey, junctionDAOKey, junction) {
        return `
          return x.create(foam_dao_ManyToManyRelationshipImpl.self, args: [
            "sourceId": self.id,
            "sourceProperty": ${sourceProperty.sourceCls_.model_.swiftName}.${ foam.String.constantize(sourceProperty.name) }(),
            "targetProperty": ${targetProperty.sourceCls_.model_.swiftName}.${ foam.String.constantize(targetProperty.name) }(),
            "targetDAOKey": "${targetDAOKey}",
            "junctionDAOKey": "${junctionDAOKey}",
            "junction": ${junction.model_.swiftName}.classInfo()
          ])!;
        `
      },
    },
    {
      name: 'javaCode',
      expression: function(sourceProperty, targetProperty, targetDAOKey, junctionDAOKey, junction) {
        return `
          return new foam.dao.ManyToManyRelationshipImpl.Builder(x)
              .setSourceId(getId())
              .setSourceProperty(${sourceProperty.forClass_}.${foam.String.constantize(sourceProperty.name)})
              .setTargetProperty(${targetProperty.forClass_}.${foam.String.constantize(targetProperty.name)})
              .setTargetDAOKey("${targetDAOKey}")
              .setJunctionDAOKey("${junctionDAOKey}")
              .setJunction(${junction.id}.getOwnClassInfo())
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
  ],
});
