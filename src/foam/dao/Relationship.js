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
        foam.assert(value === '1:1' || value === '1:*' || value === '*:1' || value === '*:*',
          'Current supported cardinalities are 1:1 1:* *:1 and *:*');
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
      var cardinality  = this.cardinality.split(':');
      var forwardName  = this.forwardName;
      var inverseName  = this.inverseName;
      var relationship = this;

      if ( this.cardinality === '*:*' ) {

        return;
      }

      if ( ! sourceProps.length ) {
        if ( cardinality[1] === '*' ) {
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
        } else {
          sourceProps = [
            foam.core.Reference.create({
              name: forwardName,
              of: this.targetModel,
              targetDAOKey: this.targetDAOKey
            }).copyFrom(this.sourceProperty)
          ];
        }
      }

      if ( ! targetProps.length ) {
        if ( cardinality[0] == '*' ) {
          targetProps = [
            foam.core.Property.create({
              name: forwardName,
              transient: true,
              setter: function() {},
              getter: function() {
                return this.instance_[forwardName] ?
                  this.instance_[forwardName] :
                  this.instance_[forwardName] = foam.dao.RelationshipDAO.create({
                    obj: this,
                    forward: false,
                    relationship: relationship
                  }, this)
              }
            }).copyFrom(this.targetProperty)
          ];
        } else {
          targetProps = [
            foam.core.Reference.create({
              name: inverseName,
              of: this.sourceModel,
              targetDAOKey: this.sourceDAOKey
            }).copyFrom(this.targetProperty)
          ];
        }
      }

      foam.assert(
          sourceProps.length === targetProps.length,
          'Relationship source/target property list length mismatch.');

      var source = this.lookup(this.sourceModel);
      var target = this.lookup(this.targetModel);

      foam.assert(source, 'Unknown sourceModel: ', this.sourceModel);
      foam.assert(target, 'Unknown targetModel: ', this.targetModel);

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

    function targetQueryFromSource(obj, forward) {
      var targetClass = this.lookup(forward ? this.targetModel : this.sourceModel);
      var name        = forward ? this.inverseName : this.forwardName;
      var targetProp  = targetClass[foam.String.constantize(name)];
      return this.EQ(targetProp, obj.id);
    },

    function adaptTarget(source, target, forward) {
      if ( forward ) {
        target[this.inverseName] = source.id;
      } else {
        source[this.forwardName] = target.id;
      }
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
