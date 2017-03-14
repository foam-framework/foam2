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
      class: 'FObjectProperty',
      of: 'Property',
      name: 'sourceProperty'
    },
    {
      class: 'FObjectProperty',
      of: 'Property',
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
            foam.core.Property.create({
              name: forwardName,
              transient: true,
              setter: function() {},
              getter: function() {
                return this.instance_[forwardName] ?
                  this.instance_[forwardName] :
                  this.instance_[forwardName] = foam.dao.RelationshipDAO.create({
                    obj: this,
                    relationship: relationship
                  }, this)
              }
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
            properties: [ 'sourceId', 'targetId' ]
          });

          jModel = foam.lookup(id);
        }

        foam.RELATIONSHIP({
          sourceModel: this.sourceModel,
          targetModel: id,
          forwardName: this.forwardName,
          inverseName: 'sourceId',
          sourceDAOKey: this.sourceDAOKey,
          targetDAOKey: this.junctionDAOKey
        });

        // reverse
        foam.RELATIONSHIP({
          sourceModel: this.targetModel,
          targetModel: id,
          forwardName: this.inverseName,
          inverseName: 'targetId',
          sourceDAOKey: this.targetDAOKey,
          targetDAOKey: this.junctionDAOKey
        });
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

    function targetQueryFromSource(obj, forward) {
      var targetClass = this.lookup(forward ? this.targetModel : this.sourceModel);
      var name        = forward ? this.inverseName : this.forwardName;
      var targetProp  = targetClass[foam.String.constantize(name)];
      return this.EQ(targetProp, obj.id);
    }
  ]
});


foam.LIB({
  name: 'foam',
  methods: [
    function RELATIONSHIP(m) {
      var r = foam.dao.Relationship.create(m);

      r.validate && r.validate();
      foam.package.registerClass(r);

      return r;
    }
  ]
});
