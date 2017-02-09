foam.CLASS({
  package: 'foam.swift',
  name: 'Field',

  properties: [
    'name',
    'type',
    'static',
    'final',
    'lazy',
    'defaultValue',
    'initializer',
  ],

  methods: [
    function outputSwift(o) {
      o.indent();
      o.out(
        this.static ? 'static ' : '',
        this.lazy ? 'lazy ' : '',
        this.final ? 'let ' : 'var ',
        this.name,
        ': ',
        this.type);
      if (this.initializer) {
        o.out(' = {\n');
        o.increaseIndent();
        o.indent();
        o.out(this.initializer, '\n');
        o.decreaseIndent();
        o.indent();
        o.out('}()');
      } else if (this.defaultValue) {
        o.out(' = ', this.defaultValue);
      }
    }
  ]
});
