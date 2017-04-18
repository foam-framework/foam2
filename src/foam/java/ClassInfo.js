foam.CLASS({
  package: 'foam.java',
  name: 'ClassInfo',

  properties: [
    {
      name: 'name',
      value: 'classInfo_'
    },
    {
      name: 'id'
    },
    {
      name: 'properties',
      factory: function() { return []; }
    },
    {
      name: 'order',
      value: 1
    }
  ],

  methods: [
    function addProperty(id) {
      this.properties.push(id);
    },

    function outputJava(o) {
      o.indent();
      o.out('private static final foam.core.ClassInfo classInfo_ = new foam.core.ClassInfoImpl()\n')
      o.increaseIndent();
      o.indent();
      o.out('.setId("', this.id, '")');
      for ( var i = 0 ; i < this.properties.length ; i++ ) {
        o.out('\n');
        o.indent();
        o.out('.addProperty(', this.properties[i], ')');
      }
      o.decreaseIndent()
      o.out(';');
    }
  ]
});
