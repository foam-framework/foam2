foam.CLASS({
  package: 'foam.swift',
  name: 'Protocol',

  requires: [
    'foam.swift.Outputter'
  ],

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'visibility',
      value: 'public'
    },
    {
      class: 'FObjectArray',
      of: 'foam.swift.ProtocolMethod',
      name: 'methods',
      factory: function() { return []; }
    }
  ],

  methods: [
    function method(m) {
      this.methods.push(m);
      return this;
    },

    function toSwiftSource() {
      var output = this.Outputter.create({outputMethod: 'outputSwift'});
      output.out(this);
      return output.buf_;
    },

    function outputSwift(o) {
      o.indent();
      o.out('// GENERATED CODE. DO NOT MODIFY BY HAND.\n');
      o.out(
        this.visibility,
        this.visibility ? ' ' : '',
        'protocol ',
        this.name);

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
