foam.CLASS({
  package: 'foam.java',
  name: 'Interface',

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'package'
    },
    {
      class: 'StringArray',
      name: 'extends'
    },
    {
      class: 'String',
      name: 'visibility',
      value: 'public'
    },
    {
      class: 'FObjectArray',
      of: 'foam.java.InterfaceMethod',
      name: 'methods',
      factory: function() { return []; }
    }
  ],

  methods: [
    function method(m) {
      this.methods.push(foam.java.InterfaceMethod.create(m));
      return this;
    },

    function getMethod(name) {
      return this.methods.find(function(m) { return m.name == name; });
    },

    function field() {
    },

    function toJavaSource() {
      var output = foam.java.Outputter.create();
      output.out(this);
      return output.buf_;
    },

    function outputJava(o) {
      if ( this.package ) { o.out('package ', this.package, ';\n\n'); }

      o.out(this.visibility, this.visibility ? ' ' : '',
        'interface ', this.name);

      if ( this.extends.length > 0 ) {
        o.out(' extends ');
        for ( var i = 0 ; i < this.extends.length ; i++ ) {
          o.out(this.extends[i]);
          if ( i != this.extends.length - 1 ) o.out(', ');
        }
      }

      o.out(' {\n');

      o.increaseIndent();
      for ( var i = 0 ; i < this.methods.length ; i++ ) {
        o.indent();
        o.out(this.methods[i]);
        o.out('\n');
      }

      o.decreaseIndent();
      o.out('}');
    }
  ]
});
