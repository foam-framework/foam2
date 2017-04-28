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
      name: 'sourceModel'
    },
    {
      class: 'FObjectArray',
      name: 'sourceProperties',
      of: 'Property',
      adaptArrayElement: foam.core.Model.PROPERTIES.adaptArrayElement
    },
    {
      name: 'targetModel'
    },
    {
      name: 'junctionModel',
      factory: function() { return this.sourceModel + this.targetModel + 'Junction'; }
    },
    {
      name: 'targetDAOKey',
      expression: function(targetModel) {
        return foam.String.daoize(foam.lookup(targetModel).name);
      }
    },
    {
      name: 'junctionDAOKey',
    },
    {
      name: 'sourceDAOKey',
      expression: function(sourceModel) {
        return foam.String.daoize(foam.lookup(sourceModel).name);
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
    /*
    {
      name: 'adaptSource',
      factory: function() {
        var forwardName = this.forwardName;

        return function(target, source) {
          source[forwardName] = target.id;
        }
      }
    },*/
    {
      class: 'FObjectArray',
      name: 'targetProperties',
      of: 'Property',
      adaptArrayElement: foam.core.Model.PROPERTIES.adaptArrayElement
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
    {
      name: 'relationshipDAOFactory',
      value: function(source) {
        return this.RelationshipDAO.create({
          obj: source,
          relationship: this
        }, source);
      }
    },
    {
      name: 'targetDAOFactory',
      value: function(source) {
        return source.__context__[this.targetDAOKey];
      }
    },
    {
      name: 'junctionDAOFactory',
      value: function(source) {},
    },
    {
      name: 'relationshipDAOInstances_',
      factory: function() { return {} },
    },
    {
      name: 'relationshipPropertyValueFactory',
      value: function(source) {
        var self = this;
        return foam.dao.RelationshipPropertyValue.create({
          daoGetter: function() {
            if (!self.relationshipDAOInstances_[source.id]) {
              self.relationshipDAOInstances_[source.id] =
                  self.relationshipDAOFactory(source);
            }
            return self.relationshipDAOInstances_[source.id];
          },
          targetDAO: this.targetDAOFactory(source),
          junctionDAO: this.junctionDAOFactory(source),
        });
      }
    }
    /* FUTURE:
    {
      name: 'deleteStrategy'
      // prevent, cascade, orphan
    }
    */
  ],

  methods: [
    function init() {
      var sourceProps  = this.sourceProperties || [];
      var targetProps  = this.targetProperties || [];
      var cardinality  = this.cardinality;
      var forwardName  = this.forwardName;
      var inverseName  = this.inverseName;
      var relationship = this;
      var source       = this.lookup(this.sourceModel);
      var target       = this.lookup(this.targetModel);

      foam.assert(source, 'Unknown sourceModel: ', this.sourceModel);
      foam.assert(target, 'Unknown targetModel: ', this.targetModel);

      if ( cardinality === '1:*' ) {
        if ( ! sourceProps.length ) {
          sourceProps = [
            foam.dao.RelationshipProperty.create({
              name: forwardName,
              cloneProperty: function(value, map) {},
              transient: true,
              expression: function(id) {
                return relationship.relationshipPropertyValueFactory(this);
              },
            }).copyFrom(this.sourceProperty)
          ];
        }

        if ( ! targetProps.length ) {
          targetProps = [
            foam.core.Reference.create({
              name: inverseName,
              of: this.sourceModel,
              targetDAOKey: this.sourceDAOKey
            }).copyFrom(this.targetProperty)
          ];
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
      } else { /* cardinality === '*.*' */
        var name   = source.name + target.name + 'Junction';
        var id     = source.package ? source.package + '.' + name : name;
        var jModel = foam.lookup(id, true);

        if ( ! jModel ) {
          foam.CLASS({
            package: source.package,
            name: name,
            ids: [ 'sourceId', 'targetId' ],
            properties: [
              { name: 'sourceId', shortName: 's' },
              { name: 'targetId', shortName: 't' }
            ]
          });

          jModel = foam.lookup(id);
        }

        // forward
        foam.RELATIONSHIP({
          sourceModel: this.sourceModel,
          sourceProperty: this.sourceProperty,
          targetModel: id,
          forwardName: this.forwardName,
          inverseName: 'sourceId',
          sourceDAOKey: this.sourceDAOKey,
          targetDAOKey: this.junctionDAOKey,
          relationshipDAOFactory: function(source) {
            return foam.dao.ManyToManyRelationshipDAO.create({
              junctionCls: jModel,
              obj: source,
              of: target.id,
              relationship: this,
              joinDAOKey: relationship.targetDAOKey,
              junctionProperty: jModel.TARGET_ID,
              targetProperty: target.ID
            }, source);
          },
          targetDAOFactory: function(source) {
            return source.__context__[relationship.targetDAOKey];
          },
          junctionDAOFactory: function(source) {
            return source.__context__[relationship.junctionDAOKey];
          },
          adaptTarget: function(s, t) {
            if ( target.isInstance(t) ) {
              t = jModel.create({targetId: t.id});
            }

            t.sourceId = s.id;

            return t;
          }
        }, this.__subContext__);

        // inverse
        foam.RELATIONSHIP({
          sourceModel: this.targetModel,
          targetModel: id,
          sourceProperty: this.targetProperty,
          forwardName: this.inverseName,
          inverseName: 'targetId',
          sourceDAOKey: this.targetDAOKey,
          targetDAOKey: this.junctionDAOKey,
          relationshipDAOFactory: function(s) {
            return foam.dao.ManyToManyRelationshipDAO.create({
              junctionCls: jModel,
              obj: s,
              of: source.id,
              relationship: this,
              joinDAOKey: relationship.sourceDAOKey,
              junctionProperty: jModel.SOURCE_ID,
              targetProperty: source.ID
            }, s);
          },
          targetDAOFactory: function(source) {
            return source.__context__[relationship.sourceDAOKey];
          },
          junctionDAOFactory: function(source) {
            return source.__context__[relationship.junctionDAOKey];
          },
          adaptTarget: function(s, t) {
            if ( source.isInstance(t) ) {
              t = jModel.create({sourceId: t.id});
            }

            t.targetId = s.id;

            return t;
          }
        }, this.__subContext__);
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
    {
      name: 'daoGetter',
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      getter: function() { return this.daoGetter() },
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'junctionDAO',
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'targetDAO',
    },
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
