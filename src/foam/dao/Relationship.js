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

foam.CLASS({
  package: 'foam.dao',
  name: 'Relationship',
  implements: [ 'foam.mlang.Expressions' ],

  documentation: 'An Axiom for defining Relationships between models.',

  requires: [
    'foam.dao.RelationshipDAO',
    'foam.dao.ManyToManyRelationshipDAO',
    'foam.dao.ReadOnlyDAO',
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
      transient: true,
      hidden: true,
      getter: function() {
        return this.lookup(this.sourceModel).name +
          foam.String.capitalize(this.forwardName) + 'Relationship';
      }
    },
    'forwardName',
    'inverseName',
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
      class: 'FObjectArray',
      name: 'sourceProperties',
      of: 'Property',
      adaptArrayElement: foam.core.Model.PROPERTIES.adaptArrayElement
    },
    {
      class: 'FObjectArray',
      name: 'targetProperties',
      of: 'Property',
      adaptArrayElement: foam.core.Model.PROPERTIES.adaptArrayElement
    },
    {
      class: 'String',
      name: 'junctionModel',
      expression: function(sourceModel, targetModel) {
        return ( this.package ? this.package + '.' : '' ) + foam.lookup(sourceModel).name + foam.lookup(targetModel).name + 'Junction'; }
    },
    {
      class: 'String',
      name: 'sourceDAOKey',
      expression: function(sourceModel) {
        return foam.String.daoize(foam.lookup(sourceModel).name);
      }
    },
    {
      class: 'String',
      name: 'targetDAOKey',
      expression: function(targetModel) {
        return foam.String.daoize(foam.lookup(targetModel).name);
      }
    },
    {
      class: 'String',
      name: 'junctionDAOKey',
      expression: function(junctionModel) {
        return foam.String.daoize(foam.lookup(junctionModel).name);
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
    function init() {
      var sourceProps   = this.sourceProperties || [];
      var targetProps   = this.targetProperties || [];
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

      var sourceDAOKey   = this.sourceDAOKey;
      var targetDAOKey   = this.targetDAOKey;

      if ( cardinality === '1:*' ) {
        if ( ! sourceProps.length ) {
          sourceProps = [
            foam.dao.RelationshipProperty.create({
              name: forwardName,
              cloneProperty: function(value, map) {},
              transient: true,
              expression: function(id) {
                return foam.dao.RelationshipPropertyValue.create({
                  sourceId: id,
                  dao: foam.dao.RelationshipDAO.create({
                    obj: this,
                    relationship: relationship
                  }, this),
                  targetDAO: this.__context__[targetDAOKey]
                }, this);
              },
            }).copyFrom(this.sourceProperty)
          ];
        }

        if ( ! targetProps.length ) {
          targetProps = [
            foam.core.Reference.create({
              name: inverseName,
              of: sourceModel,
              targetDAOKey: sourceDAOKey
            }).copyFrom(this.targetProperty)
          ];
        }
      } else { /* cardinality === '*.*' */
        if ( ! junction ) {
          foam.CLASS({
            package: this.package,
            name: this.junctionModel.substring(this.junctionModel.lastIndexOf('.') + 1),
            ids: [ 'sourceId', 'targetId' ],
            properties: [
              { name: 'sourceId', shortName: 's' },
              { name: 'targetId', shortName: 't' }
            ]
          });

          junction = foam.lookup(id);
        }

        var junctionDAOKey = this.junctionDAOKey;


        if ( ! sourceProps.length ) {
          sourceProps = [
            foam.dao.RelationshipProperty.create({
              name: forwardName,
              cloneProperty: function(value, map) {},
              transient: true,
              expression: function(id) {
                return  foam.dao.RelationshipPropertyValue.create({
                  sourceId: id,
                  dao: foam.dao.ReadOnlyDAO.create({
                    delegate: foam.dao.ManyToManyRelationshipDAO.create({
                      delegate: this.__context__[targetDAOKey],
                      junctionProperty: junction.TARGET_ID,
                      junctionDAOKey: junctionDAOKey,
                      targetProperty: target.ID,
                      junctionCls: junction
                    }, this)
                  }, this),
                  targetDAO: this.__context__[targetDAOKey],
                  junctionDAO: this.__context__[junctionDAOKey]
                }, this);
              },
            }).copyFrom(this.sourceProperty)
          ];
        }

        if ( ! targetProps.length ) {
          targetProps = [
            foam.dao.RelationshipProperty.create({
              name: inverseName,
              cloneProperty: function(value, map) {},
              transient: true,
              expression: function(id) {
                return  foam.dao.RelationshipPropertyValue.create({
                  targetId: id,
                  dao: foam.dao.ReadOnlyDAO.create({
                    delegate: foam.dao.ManyToManyRelationshipDAO.create({
                      delegate: this.__context__[sourceDAOKey],
                      junctionProperty: junction.SOURCE_ID,
                      junctionDAOKey: junctionDAOKey,
                      targetProperty: source.ID,
                      junctionCls: junction
                    }, this)
                  }, this),
                  targetDAO: this.__context__[sourceDAOKey],
                  junctionDAO: this.__context__[junctionDAOKey]
                }, this);
              },
            }).copyFrom(this.targetProperty)
          ];
        }
      }


      foam.assert(
        sourceProps.length === targetProps.length,
        'Relationship source/target property list length mismatch.');

      for ( var i = 0 ; i < sourceProps.length ; i++ ) {
        var sp = sourceProps[i];
        var tp = targetProps[i];

        if ( ! source.getAxiomByName(sp.name) ) {
          source.installAxiom(sp);
        }

        if ( ! this.oneWay && ! target.getAxiomByName(tp.name) ) {
          target.installAxiom(tp);
        }
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
    },

    function targetQueryFromSource(obj) {
      var targetClass = this.lookup(this.targetModel);
      var name        = this.inverseName;
      var targetProp  = targetClass[foam.String.constantize(name)];

      if ( obj.id === undefined ) {
        this.warn('Attempted to read relationship from object with no id.');
        return this.FALSE;
      }

      return this.EQ(targetProp, obj.id);
    }
  ]
});


foam.LIB({
  name: 'foam',
  methods: [
    function RELATIONSHIP(m, opt_ctx) {
      var r = foam.dao.Relationship.create(m, opt_ctx);

      r.validate && r.validate();
      foam.package.registerClass(r);

      return r;
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'RelationshipPropertyValue',
  properties: [
    'sourceId',
    'targetId',
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'junctionDAO'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'targetDAO'
    },
  ],
  methods: [
    function add(obj) {
      var junction = this.junctionDAO.of.create({
        sourceId: this.sourceId || obj.id,
        targetId: this.targetId || obj.id
      });
      return this.junctionDAO.put(junction);
    },

    function remove(obj) {
      var junction = this.junctionDAO.of.create({
        sourceId: this.sourceId || obj.id,
        targetId: this.targetId || obj.id
      });
      return this.junctionDAO.remove(junction);
    }
  ],
});

foam.CLASS({
  package: 'foam.dao',
  name: 'RelationshipProperty',
  extends: 'foam.core.FObjectProperty',
  properties: [
    {
      name: 'of',
      value: 'foam.dao.RelationshipPropertyValue',
    },
    {
      name: 'view',
      value: { class: 'foam.comics.RelationshipView' },
    },
  ],
});
