foam.CLASS({
  package: 'foam.swift',
  name: 'SwiftClass',

  requires: [
    'foam.swift.Outputter'
  ],

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'FObjectArray',
      of: 'foam.swift.Field',
      name: 'fields',
      factory: function() { return []; }
    },
  ],

  methods: [
    function outputSwift(o) {
      o.out('// GENERATED CODE. DO NOT MODIFY BY HAND.\n');
      o.out('class ', this.name, ' {\n');
      o.increaseIndent();

      this.fields.forEach(function(f) { o.out(f, '\n'); });

      o.decreaseIndent();
      o.out('}');
    },
    function toSwiftSource() {
      var output = this.Outputter.create({outputMethod: 'outputSwift'});
      output.out(this);
      return output.buf_;
    }
  ]
});

