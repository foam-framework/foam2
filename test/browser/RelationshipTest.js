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

foam.CLASS({
  name: 'MythologicalWorld',
  requires: [ 'Parent1', 'Child1' ],

  exports: [
    'parents as Parent1DAO',
    'children as Child1DAO'
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

MythologicalWorld.create();
