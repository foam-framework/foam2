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

  properties: [
    'name',
    'inverseName',
    {
      // TODO: Support many to many relationships (cardinality of '*:*')
      name: 'cardinality',
      assertValue: function(value) {
        this.assert(value == '1:1' || value == '1:*' || value == '*:1',
          'Current supported cardinalities are 1:1 1:* and *:1');
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
    /*
      // Not used yet.
    {
      name: 'sourceDAOKey',
      expression: function(sourceModel) {
        return sourceModel.id + 'DAO';
      }
    },
    */
    {
      name: 'targetModel'
    },
    {
      name: 'targetDAOKey',
      expression: function(targetModel) {
        return targetModel + 'DAO';
      }
    },
    {
      name: 'sourceDAOKey',
      expression: function(sourceModel) {
        return sourceModel + 'DAO';
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
      var sourceProps = this.sourceProperties || [];
      var targetProps = this.targetProperties || [];

      var cardinality = this.cardinality.split(":");

      var name = this.name;
      var inverseName = this.inverseName;
      var relationship = this;

      if ( ! sourceProps.length ) {
        if ( cardinality[1] == '*' ) {
          sourceProps = [
            foam.core.Property.create({
              name: name,
              transient: true,
              setter: function() {},
              getter: function() {
                return this.instance_[name] ?
                  this.instance_[name] :
                  this.instance_[name] = foam.dao.RelationshipDAO.create({
                    obj: this,
                    relationship: relationship
                  }, this)
              }
            })
          ];
        } else {
          sourceProps = [
            foam.core.Reference.create({
              name: this.name,
              of: this.targetModel,
              targetDAOKey: this.targetDAOKey
            })
          ];
        }
      }

      if ( ! targetProps.length ) {
        if ( cardinality[0] == '*' ) {
          targetProps = [
            foam.core.Property.create({
              name: name,
              transient: true,
              setter: function() {},
              getter: function() {
                return this.instance_[name] ?
                  this.instance_[name] :
                  this.instance_[name] = foam.dao.RelationshipDAO.create({
                    obj: this,
                    forward: false,
                    relationship: relationship
                  }, this)
              }
            })
          ];
        } else {
          targetProps = [
            foam.core.Reference.create({
              name: inverseName,
              of: this.sourceModel,
              targetDAOKey: this.sourceDAOKey
            })
          ];
        }
      }

      this.assert(
          sourceProps.length === targetProps.length,
          'Relationship source/target property list length mismatch.');

      var source = this.lookup(this.sourceModel);
      var target = this.lookup(this.targetModel);

      this.assert(source, 'Unknown sourceModel: ', this.sourceModel);
      this.assert(target, 'Unknown targetModel: ', this.targetModel);

      for ( var i = 0 ; i < sourceProps.length ; i++ ) {
        var sp = sourceProps[i];
        var tp = targetProps[i];

        if ( ! source.getAxiomByName(sp.name) ) source.installAxiom(sp);
        if ( ! this.oneWay && ! target.getAxiomByName(tp.name) ) target.installAxiom(tp);
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
      var targetProp  = targetClass[foam.String.constantize(forward ? this.inverseName : this.name)];
      return this.EQ(targetProp, obj.id);
    },

    function adaptTarget(source, target, forward) {
      if ( forward ) target[this.inverseName] = source.id;
      else source[this.name] = target.id;
    }
  ]
});


foam.LIB({
  name: 'foam',
  methods: [
    function RELATIONSHIP(m) {
      var r = foam.dao.Relationship.create(m);
      r.validate && r.validate();
      return r;
    }
  ]
});
