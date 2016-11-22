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
  > p.id;
  ["Kevin", "Greer"]
</pre>
*/
foam.CLASS({
  package: 'foam.core',
  name: 'MultiPartID',
  extends: 'foam.core.Property',

  properties: [
    [ 'name', 'id' ],
    [ 'transient', true ],
    [ 'hidden', true ],
    'propNames',
    'props',
    [ 'getter', function multiPartGetter() {
      var props = this.cls_.ID.props;

      if ( props.length === 1 ) return props[0].get(this);

      var a = new Array(props.length);
      for ( var i = 0 ; i < props.length ; i++ ) a[i] = props[i].get(this);
      return a;
    }],
    [ 'setter', function multiPartSetter(a) {
      var props = this.cls_.ID.props;

      if ( props.length === 1 ) {
        props[0].set(this, a);
      } else {
        for ( var i = 0 ; i < props.length ; i++ ) props[i].set(this, a[i]);
      }
    }],
    {
      name: 'compare',
      value: function multiPartCompare(o1, o2) {
        var props = this.props;
        if ( props.length === 1 ) return props[0].compare(o1, o2);

        for ( var i = 0 ; i < props.length ; i++ ) {
          var c = props[i].compare(o1, o2);
          if ( c ) return c;
        }
        return 0;
      }
    }
  ],

  methods: [
    function installInClass(c) {
      this.props = this.propNames.map(function(n) {
        var prop = c.getAxiomByName(n);
        foam.__context__.assert(prop, 'Unknown ids property:', c.id + '.' + n);
        foam.__context__.assert(foam.core.Property.isInstance(prop), 'Ids property:', c.id + '.' + n, 'is not a Property.');
        return prop;
      });

      this.SUPER(c);
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Model',
  properties: [
    {
      name: 'ids',
      postSet: function(_, ids) {
        this.assert(Array.isArray(ids), 'Ids must be an array.');
        this.assert(ids.length, 'Ids must contain at least one property.');

        this.axioms_.push(foam.core.MultiPartID.create({propNames: ids}));
      }
    }
  ]
});
