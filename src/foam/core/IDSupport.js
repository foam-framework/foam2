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
  package: 'foam.core',
  name: 'IDAlias',
  extends: 'foam.core.Object',

  properties: [
    ['name', 'id'],
    {
      class: 'String',
      name: 'propName'
    },
    ['hidden', true],
    {
      name: 'targetProperty',
      transient: true
    },
    ['getter', function() {
      return this.cls_.ID.targetProperty.f(this);
    }],
    ['setter', function(v) {
      this.cls_.ID.targetProperty.set(this, v);
    }],
    'value'
  ],

  methods: [
    function installInClass(c) {
      var prop = c.getAxiomByName(this.propName);
      foam.assert(foam.core.Property.isInstance(prop), 'Ids property: ' + c.id + '.' + this.propName, 'is not a Property');
      this.targetProperty = prop;
      this.value = prop.value;
      this.SUPER(c);
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'MultiPartID',
  extends: 'foam.core.FObjectProperty',

  documentation: function() {/*
  An Identity Axiom which installs a psedo-property to use as an id.

  Use when you want a multi-part primary-key.
  <pre>
  Ex.
  foam.CLASS({
    name: 'Person',
    ids: [ 'firstName', 'lastName' ],
    properties: [ 'firstName', 'lastName', 'age', 'sex' ]
  });

  > var p = Person.create({firstName: 'Kevin', lastName: 'Greer'});
  > p.id.cls_.id;
  "PersonId"
  > p.id.toString();
  "{firstName:\"Kevin\",lastName:\"Greer\"}"
  </pre>
  */},

  properties: [
    [ 'name', 'id' ],
    [ 'transient', true ],
    [ 'hidden', true ],
    {
      class: 'Class',
      name: 'of',
      transient: true,
      required: false,
      value: null
    },
    {
      class: 'StringArray',
      name: 'propNames',
      required: true
    },
    [ 'getter', function multiPartGetter() {
      return this.cls_.ID.of.create(this);
    }],
    [ 'setter', function multiPartSetter(a) {
      if ( ! foam.Array.isInstance(a) ) {
        this.copyFrom(a);
        return;
      }

      // TODO(markdittmer): Should not assume this property is named "id".
      var names = this.cls_.ID.propNames;
      foam.assert(names.length === a.length,
                  `Improperly sized array for ${this.cls_.id} array value`);
      for ( var i = 0; i < names.length; i++ ) {
        this[names[i]] = a[i];
      }
    }]
  ],

  methods: [
    function installInClass(c) {
      var generatedId = c.package ?
          c.package + '.' + c.name + 'Id' :
          c.name + 'Id';

      var arr = [];
      for ( var i = 0 ; i < this.propNames.length ; i++ ) {
        var name = foam.String.capitalize(this.propNames[i]);
        arr.push(`get${name}()`);
      }
      var javaToStringMethod = 'return ' + arr.join(' + "-" + ') + ';';

      foam.CLASS({
        package: c.package,
        name: c.name + 'Id',
        properties: this.propNames.map(function(n) {
          var prop = c.getAxiomByName(n);
          foam.assert(prop, 'Unknown ids property:', c.id + '.' + n);
          foam.assert(foam.core.Property.isInstance(prop), 'Ids property:', c.id + '.' + n, 'is not a Property.');
          return prop.clone();
        }),
        methods: [
          {
            name: 'toString',
            code: function() {
              var arr = [];
              for ( var prop in this.instance_ ) {
                arr.push( this[prop] ? this[prop].toString() : '' );
              }
              return arr.join('-');
            },
            javaCode: javaToStringMethod
          }
        ]
      });

      c.installAxiom(foam.core.Requires.create({
        name: c.name + 'Id',
        path: generatedId
      }));

      this.of = foam.lookup(generatedId);

      // Extends Property, so actually gets installed in SUPER call
      this.SUPER(c);
    }
  ]
});

foam.CLASS({
  package: 'foam.core',
  name: 'ModelIDRefine',
  refines: 'foam.core.Model',
  requires: [
    'foam.core.IDAlias',
    'foam.core.MultiPartID',
  ],
  properties: [
    {
      name: 'ids',
      postSet: function(_, ids) {
        foam.assert(foam.Array.isInstance(ids), 'Ids must be an array.');
        foam.assert(ids.length, 'Ids must contain at least one property.');

        // Don't build MultiPartID property if the id is not multi part.
        if ( ids.length == 1 )
          this.axioms_.push(foam.core.IDAlias.create({ propName: ids[0] }));
        else
          this.axioms_.push(foam.core.MultiPartID.create({propNames: ids}));
      }
    }
  ]
});
