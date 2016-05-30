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
    'name',
    'inverseName',
    {
      name: 'cardinality',
      value: '0:1' // '1:*', '*:1', '*:*'
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

      if ( ! sourceProps.length ) {
        sourceProps = [ foam.core.Property.create({name: this.name}) ];
      }

      if ( ! targetProps.length ) {
        targetProps = [ foam.core.Property.create({name: this.inverseName}) ];
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

        source.installAxiom(sp);
        if ( ! this.oneWay ) target.installAxiom(tp);
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
    }
  ]
});


// Relationship Test
foam.CLASS({
  name: 'Parent1',
  ids: [ 'name' ],
  properties: [ 'name' ]
});
foam.CLASS({
  name: 'Child1',
  ids: [ 'name' ],
  properties: [ 'name' ]
});
foam.core.Relationship.create({
  sourceModel: 'Parent1',
  targetModel: 'Child1',
  name: 'children',
  inverseName: 'parent'
});

var parents  = foam.dao.MDAO.create({of: 'Parent1'});
var children = foam.dao.MDAO.create({of: 'Child1'});

parents.put(Parent1.create({name: 'Odin'}));
children.put(Child1.create({name: 'Thor', parent: 'Odin'}));
children.put(Child1.create({name: 'Loki', parent: 'Odin'}));

parents.select({put: function(o) { console.log(o.stringify()); }});
console.log('Children:');
children.select({put: function(o) { console.log(o.stringify()); }});
