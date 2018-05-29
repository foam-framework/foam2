/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'Relationship',
  implements: [ { path: 'foam.mlang.Expressions', java: false } ],

  documentation: 'An Axiom for defining Relationships between models.',

  requires: [
    'foam.dao.RelationshipDAO',
    'foam.dao.ManyToManyRelationshipDAO',
    'foam.dao.ReadOnlyDAO',
    'foam.dao.OneToManyRelationshipProperty',
    'foam.dao.ManyToManyRelationshipProperty'
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
        return ( this.package ? this.package + '.' : '' ) + this.lookup(sourceModel).name + this.lookup(targetModel).name + 'Junction'; }
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
        }
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
      name: 'targetProperty'
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
      var relationship  = this;
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
        sourceProp = foam.dao.OneToManyRelationshipProperty.create({
          name: forwardName,
          target: target,
          targetPropertyName: inverseName,
          targetDAOKey: targetDAOKey
        }).copyFrom(this.sourceProperty);

        targetProp = foam.core.Reference.create({
          name: inverseName,
          of: sourceModel,
          targetDAOKey: sourceDAOKey
        }).copyFrom(this.targetProperty);
      } else { /* cardinality === '*.*' */
        if ( ! junction ) {
          var name = this.junctionModel.substring(
            this.junctionModel.lastIndexOf('.') + 1);
          var id = this.package + '.' + name;

          foam.CLASS({
            package: this.package,
            name: name,
            ids: [ 'sourceId', 'targetId' ],
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

        sourceProp = foam.dao.ManyToManyRelationshipProperty.create({
          name: forwardName,
          junction: junction,
          junctionDAOKey: junctionDAOKey,
          targetDAOKey: targetDAOKey,
          targetProperty: junction.TARGET_ID,
          sourceProperty: junction.SOURCE_ID
        }).copyFrom(this.sourceProperty);

          // Same as sourceProp except we swap target/source so that this relationship
          // works in the opposite direction.
        targetProp = foam.dao.ManyToManyRelationshipProperty.create({
          name: inverseName,
          junction: junction,
          junctionDAOKey: junctionDAOKey,
          targetDAOKey: sourceDAOKey,
          targetProperty: junction.SOURCE_ID,
          sourceProperty: junction.TARGET_ID
        }).copyFrom(this.targetProperty);
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
      swiftReturns: 'DAO'
    },
    {
      name: 'getJunctionDAO',
      javaReturns: 'foam.dao.DAO',
      swiftReturns: 'DAO'
    },
    {
      name: 'getTargetDAO',
      javaReturns: 'foam.dao.DAO',
      swiftReturns: 'DAO'
    },
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'ManyToManyRelationshipImpl',
  implements: [ 'foam.dao.ManyToManyRelationship' ],
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
`return __context__.create(ReadOnlyDAO.self, args: [
  "delegate": __context__.create(ManyToManyRelationshipDAO.self, args: [
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
      swiftFactory: 'return __context__[junctionDAOKey] as? (DAO & FObject)'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'targetDAO',
      hidden: true,
      factory: function() {
        return this.__context__[this.targetDAOKey];
      },
      javaFactory: 'return (foam.dao.DAO)getX().get(getTargetDAOKey());',
      swiftFactory: 'return __context__[targetDAOKey] as? (DAO & FObject)'
    }
  ],
  methods: [
    {
      name: 'add',
      args: [ { name: 'target', of: 'foam.core.FObject' } ],
      javaCode: 'getJunctionDAO().put(createJunction(((foam.core.Identifiable)target).getPrimaryKey()));',
      swiftCode: 'try junctionDAO!.put(createJunction((target as? Identifiable)?.getPrimaryKey()))',
      code: function add(target) {
        return this.junctionDAO.put(this.createJunction(target.id));
      }
    },
    {
      name: 'remove',
      javaCode: 'getJunctionDAO().remove(createJunction(((foam.core.Identifiable)target).getPrimaryKey()));',
      swiftCode: 'try junctionDAO!.remove(createJunction((target as? Identifiable)?.getPrimaryKey()))',
      code: function remove(target) {
        return this.junctionDAO.remove(this.createJunction(target.id));
      }
    },
    {
      name: 'createJunction',
      args: [ { name: 'targetId', of: 'Object' } ],
      returns: 'foam.core.FObject',
      javaReturns: 'foam.core.FObject',
      code: function createJunction(targetId) {
        foam.assert( ( ! foam.Undefined.isInstance(this.sourceId) ) &&
                     ( ! foam.Undefined.isInstance(targetId) ),
                    "Cannot create an association with an object that isn't stored in a DAO yet.");
        var junction = this.junction.create(null, this);
        this.targetProperty.set(junction, targetId);
        this.sourceProperty.set(junction, this.sourceId);
        return junction;
      },
      javaCode: `foam.core.FObject junction = (foam.core.FObject)getX().create(getJunction().getObjClass());
getTargetProperty().set(junction, targetId);
getSourceProperty().set(junction, getSourceId());
return junction;`,

      swiftCode: `let junction: FObject = self.junction.create(x: __context__) as! FObject
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

        x.stack.push({ class: 'foam.comics.DAOControllerView', data: controller });
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

        x.stack.push({ class: 'foam.comics.DAOControllerView', data: controller });
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'OneToManyRelationshipProperty',
  extends: 'foam.dao.DAOProperty',
  properties: [
    ['transient', true],
    ['tableCellFormatter', null],
    ['cloneProperty', function(value, map){}],
    ['javaCloneProperty', '//noop'],
    ['javaDiffProperty', '//noop'],
    {
      class: 'String',
      name: 'targetPropertyName',
      documentation: "We don't just use targetProperty here because at the time that this axiom is created, the target property may not even be installed yet on the target.  So instead we use a combination of targetPropertyName and target class and get the actual property when needed."
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
      name: 'expression',
      factory: function() {
        // Again, delay resolving the target property until as late as
        // possible.  This factory gets triggered before RELATIONSHIP
        // has a chance to install the target property.
        var target = this.target;
        var targetPropertyName = this.targetPropertyName;
        var targetDAOKey = this.targetDAOKey;

        return function(id) {
          return foam.dao.RelationshipDAO.create({
            sourceId: id,
            targetProperty: target.getAxiomByName(targetPropertyName),
            targetDAOKey: targetDAOKey
          }, this);
        }
      }
    },
    {
      name: 'javaFactory',
      factory: function() {
        return `return new foam.dao.RelationshipDAO.Builder(getX()).
  setSourceId(getId()).
  setTargetProperty(${this.target.id}.${foam.String.constantize(this.targetPropertyName)}).
  setTargetDAOKey("${this.targetDAOKey}").
  build();`;
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'ManyToManyRelationshipProperty',
  extends: 'foam.core.FObjectProperty',
  properties: [
    ['of', 'foam.dao.ManyToManyRelationship'],
    ['transient', true],
    ['tableCellFormatter', null],
    ['cloneProperty', function(value, map) {}],
    ['javaCloneProperty', '//noop'],
    ['javaDiffProperty', '//noop'],
    ['view', { class: 'foam.u2.DetailView', showActions: true } ],
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
      name: 'expression',
      factory: function() {
        var sourceProperty = this.sourceProperty;
        var targetProperty = this.targetProperty;
        var targetDAOKey = this.targetDAOKey;
        var junctionDAOKey = this.junctionDAOKey;
        var junction = this.junction;

        return function(id) {
          return foam.dao.ManyToManyRelationshipImpl.create({
            sourceId: id,
            sourceProperty: sourceProperty,
            targetProperty: targetProperty,
            targetDAOKey: targetDAOKey,
            junctionDAOKey: junctionDAOKey,
            junction: junction
          }, this);
        };
      }
    },
    {
      name: 'javaFactory',
      factory: function() {
        return `return new foam.dao.ManyToManyRelationshipImpl.Builder(getX()).
  setSourceId(getId()).
  setSourceProperty(${this.sourceProperty.forClass_}.${foam.String.constantize(this.sourceProperty.name)}).
  setTargetProperty(${this.targetProperty.forClass_}.${foam.String.constantize(this.targetProperty.name)}).
  setTargetDAOKey("${this.targetDAOKey}").
  setJunctionDAOKey("${this.junctionDAOKey}").
  setJunction(${this.junction.id}.getOwnClassInfo()).
  build();
`;
      }
    },
    {
      name: 'swiftFactory',
      factory: function () {
        return `return __context__.create(ManyToManyRelationshipImpl.self, args: [
      "sourceId": id,
      "sourceProperty": ${this.sourceProperty.sourceCls_.name}.${foam.String.constantize(this.sourceProperty.name)}(),
      "targetProperty": ${this.sourceProperty.sourceCls_.name}.${foam.String.constantize(this.targetProperty.name)}(),
      "targetDAOKey": "${this.targetDAOKey}",
      "junctionDAOKey": "${this.junctionDAOKey}",
      "junction": ${this.sourceProperty.sourceCls_.name}.classInfo()
    ]);
`;
      }
    }
  ]
});
