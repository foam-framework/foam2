/*
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
  package: 'foam.core',
  name: 'Relationship',

  properties: [
    {
      name: 'cardinality',
      value: '0:1' // '1:*', '*:1', '*:*'
    },
    {
      name: 'sourceModel'
    },
    {
      name: 'sourceProperties',
      class: 'FObjectArray',
      of: 'Property',
      adaptArrayElement: foam.core.Model.PROPERTIES.adaptArrayElement
    },
    {
      name: 'targetModel'
    },
    {
      name: 'targetProperties',
      class: 'FObjectArray',
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
      // TODO: move to validate method
      this.assert(
          this.sourceProperties.length === this.targetProperties.length,
          'Relationship source/target property list length mismatch.');

      var source      = this.lookup(this.sourceModel);
      var target      = this.lookup(this.targetModel);
      var sourceProps = this.sourceProperties;
      var targetProps = this.targetProperties;

      this.assert(source, 'Unknown sourceModel: ', this.sourceModel);
      this.assert(target, 'Unknown targetModel: ', this.targetModel);

      if ( ! this.sourceProperties.length ) {
        sourceProps = [ foam.core.Property.create({name: this.name}) ];
        targetProps = [ foam.core.Property.create({name: this.inverseName}) ];
      }

      source.installAxiom(this.sourceProperty);

      if ( ! this.oneWay ) {
        sourceProperty.preSet = function(_, newValue) {
          if ( newValue ) {
            for ( var i = 0 ; i < sourceProps.length ; i++ ) {
              newValue[targetProps[i].name] = this[sourceProps[i]];
            }
          }
          return newValue;
        };

        target.installAxiom(this.targetProperty);
      }
    }
  ]
});


// Relationship Test
foam.CLASS({
  name: 'Parent1'
});
foam.CLASS({
  name: 'Child1'
});
foam.core.Relationship.create({
  sourceModel: 'Parent1',
  targetModel: 'Child1',
  name: 'child',
  inverseName: 'parent'
});
