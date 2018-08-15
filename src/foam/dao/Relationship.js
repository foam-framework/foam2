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
    'foam.dao.RelationshipDAO',
    'foam.dao.ManyToManyRelationshipDAO',
    'foam.dao.ReadOnlyDAO',
    'foam.dao.OneToManyRelationshipAxiom',
    'foam.dao.ManyToManyRelationshipAxiom'
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
        return this.lookup(this.sourceModel).package;
      }
    },
    {
      name: 'name',
      class: 'String',
      transient: true,
      hidden: true,
      getter: function() {
        return this.lookup(this.sourceModel).name +
          this.lookup(this.targetModel).name + 'Relationship';
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
        return (this.package ? this.package + '.' : '') +
          this.lookup(sourceModel).name +
          this.lookup(targetModel).name + 'Junction';
    }
    },
    {
      class: 'String',
      name: 'sourceDAOKey',
      expression: function(sourceModel) {
        return foam.String.daoize(this.lookup(sourceModel).name);
      }
    },
    {
      class: 'String',
      name: 'targetDAOKey',
      expression: function(targetModel) {
        return foam.String.daoize(this.lookup(targetModel).name);
      }
    },
    {
      class: 'String',
      name: 'junctionDAOKey',
      expression: function(junctionModel) {
        return foam.String.daoize(this.lookup(junctionModel).name);
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
    /* FUTURE:
    {
      name: 'deleteStrategy'
      // prevent, cascade, orphan
    }
    */
  ],

  methods: [
    function initRelationship() {
      var sourceProp;
      var targetProp;
      var cardinality   = this.cardinality;
      var forwardName   = this.forwardName;
      var inverseName   = this.inverseName;
      var sourceModel   = this.sourceModel;
      var targetModel   = this.targetModel;
      var junctionModel = this.junctionModel;
      var source        = this.lookup(sourceModel);
      var target        = this.lookup(targetModel);
      var junction      = this.lookup(junctionModel, true);
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

          junction = this.lookup(this.junctionModel);
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
      var r = foam.dao.Relationship.create(m, opt_ctx);
      r.validate && r.validate();
      r.initRelationship();
      return r;
    }
  ]
});

foam.INTERFACE({
  package: 'foam.dao',
  name: 'ManyToManyRelationship',
  methods: [
    {
      name: 'add',
      returns: 'Promise',
      javaReturns: 'void',
      swiftReturns: 'Void',
      swiftThrows: true,
      args: [
        { name: 'target', of: 'foam.core.FObject' }
      ]
    },
    {
      name: 'remove',
      returns: 'Promise',
      javaReturns: 'void',
      swiftReturns: 'Void',
      swiftThrows: true,
      args: [
        { name: 'target', of: 'foam.core.FObject' }
      ]
    },
    // TODO: These should really be properties.
    {
      name: 'getDAO',
      javaReturns: 'foam.dao.DAO',
      swiftReturns: 'foam_dao_DAO'
    },
    {
      name: 'getJunctionDAO',
      javaReturns: 'foam.dao.DAO',
      swiftReturns: 'foam_dao_DAO'
    },
    {
      name: 'getTargetDAO',
      javaReturns: 'foam.dao.DAO',
      swiftReturns: 'foam_dao_DAO'
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
      args: [{ name: 'target', of: 'foam.core.FObject' }],
      javaCode: `getJunctionDAO()
              .put(createJunction(((foam.core.Identifiable)target)
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
              .remove(createJunction(((foam.core.Identifiable)target)
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
      args: [{ name: 'targetId', javaType: 'Object' }],
      returns: 'foam.core.FObject',
      javaReturns: 'foam.core.FObject',
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
      // TODO: Should we remove this, or maybe just the java portion?
      name: 'getDAO',
      returns: 'foam.dao.DAO',
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
            javaType: 'foam.core.X',
            swiftType: 'Context',
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
            javaType: 'foam.core.X',
            swiftType: 'Context',
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
      expression: function(methodName) {
        return `return ${methodName}(__context__)`
      },
    },
    {
      name: 'swiftSetter',
      value: '// NOOP',
    },
  ],
});
