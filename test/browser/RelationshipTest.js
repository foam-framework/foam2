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

foam.RELATIONSHIP({
  sourceModel: 'Parent1',
  targetModel: 'Child1',
  forwardName: 'children',
  inverseName: 'parent'
});

foam.CLASS({
  name: 'MythologicalWorld',
  requires: [ 'Parent1', 'Child1' ],

  exports: [
    'parents as parent1DAO',
    'children as child1DAO'
  ],

  properties: [
    {
      name: 'parents',
      factory: function() { return foam.dao.MDAO.create({of: 'Parent1'}); }
    },
    {
      name: 'children',
      factory: function() { return foam.dao.MDAO.create({of: 'Child1'}); }
    }
  ],

  methods: [
    function init() {
      var parents = this.parents, children = this.children;
      var odin, zeus;

      parents.put(odin = this.Parent1.create({name: 'Odin'}));
      children.put(this.Child1.create({name: 'Thor', parent: 'Odin'}));
      children.put(this.Child1.create({name: 'Loki', parent: 'Odin'}));

      parents.put(zeus = this.Parent1.create({name: 'Zeus'}));
      children.put(this.Child1.create({name: 'Ares',   parent: 'Zeus'}));
      children.put(this.Child1.create({name: 'Athena', parent: 'Zeus'}));

      console.log('Parents:');
      parents.select({put: function(o) { console.log(o.stringify()); }});

      console.log('Children:');
      children.select({put: function(o) { console.log(o.stringify()); }});

      console.log('Odin\'s Children:');
      odin.children.select({put: function(o) { console.log(o.stringify()); }});

      console.log('Zeus\'s Children:');
      zeus.children.select({put: function(o) { console.log(o.stringify()); }});

      zeus.children.put(this.Child1.create({name: 'Apollo'}));
      console.log('Zeus\'s Children (after adding Apollo):');
      zeus.children.select({put: function(o) { console.log(o.stringify()); }});
    }
  ]
});

var mythos = MythologicalWorld.create();

foam.CLASS({
  name: 'RealWorld',
  requires: [ 'Parent1', 'Child1' ],

  methods: [
    function init() {

      var joe = this.Parent1.create({name: 'Joe'});
      // Real world has no parent/child DAOs, so the relationships won't work yet
      mythos.parents.put(joe);
      mythos.children.put(this.Child1.create({name: 'Larry', parent: 'Joe'}));
      mythos.children.put(this.Child1.create({name: 'Edna', parent: 'Joe'}));

      // clone joe to the mythological context to access the right DAOs
      var mythoJoe = this.Parent1.create(joe, mythos);
      console.log("Joe's children:");
      mythoJoe.children.select({put: function(o) { console.log(o.stringify()); }});
    }
  ]
});

RealWorld.create();

foam.CLASS({
  package: 'com.acme',
  name: 'Parent1',
  ids: [ 'name' ],
  properties: [ 'name' ]
});
foam.CLASS({
  package: 'com.acme',
  name: 'Child1',
  ids: [ 'name' ],
  properties: [ 'name' ]
});

foam.RELATIONSHIP({
  sourceModel: 'com.acme.Parent1',
  targetModel: 'com.acme.Child1',
  forwardName: 'children',
  inverseName: 'parent',
  sourceProperty: { hidden: true },
  targetProperty: { hidden: true }
});

foam.u2.DetailView.create({data: com.acme.Parent1.create()}).write();
foam.u2.DetailView.create({data: com.acme.Child1.create()}).write();


foam.CLASS({
  name: 'A',
  ids: [ 'name' ],
  properties: [ 'name' ]
});
foam.CLASS({
  name: 'B',
  ids: [ 'name' ],
  properties: [ 'name' ]
});

var r = foam.RELATIONSHIP({
  sourceModel: 'A',
  targetModel: 'B',
  forwardName: 'bs',
  inverseName: 'as',
  cardinality: '*:*'
});

ABJunction.describe();

foam.CLASS({
  name: 'ManyToManyTest',
  requires: [ 'A', 'B' ],

  exports: [
    'aDAO',
    'bDAO',
    'ABJunctionDAO as aBJunctionDAO' // TODO: naming is wrong
  ],

  properties: [
    {
      name: 'aDAO',
      factory: function() { return foam.dao.MDAO.create({of: 'A'}); }
    },
    {
      name: 'bDAO',
      factory: function() { return foam.dao.MDAO.create({of: 'B'}); }
    },
    {
      name: 'ABJunctionDAO',
      factory: function() { return foam.dao.MDAO.create({of: 'ABJunction'}); }
    }
  ],

  methods: [
    function init() {

      var b1, b2, b3, i1, i2, i3;
      this.aDAO.put(b1 = this.A.create({name: 'Chrome'}));
      this.aDAO.put(b2 = this.A.create({name: 'Firefox'}));
      this.aDAO.put(b3 = this.A.create({name: 'IE'}));

      this.bDAO.put(i1 = this.B.create({name: 'I1'}));
      this.bDAO.put(i2 = this.B.create({name: 'I2'}));
      this.bDAO.put(i3 = this.B.create({name: 'I3'}));

      b1.bs.put(i1);
      b2.bs.put(i2);

      b3.bs.put(i1);
      b3.bs.put(i2);

      // Or, go the other way:
      i3.as.put(b3);

      this.ABJunctionDAO.select({
        put: function(o) { console.log('***: ', o.sourceId, o.targetId); },
        eof: function() {}
      });

      b3.bs.select({put: function(i) { console.log(i.id); }});
      i3.as.select({put: function(i) { console.log(i.id); }});
    }
  ]
});

ManyToManyTest.create();
