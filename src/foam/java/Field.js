foam.CLASS({
  package: 'foam.java',
  name: 'Field',

  properties: [
    'name',
    { class: 'String', name: 'visibility' },
    'static',
    'type',
    'final',
    {
      class: 'Int',
      name: 'order',
      value: 0
    },
    { class: 'foam.java.CodeProperty', name: 'initializer' }
  ],

  methods: [
    function outputJava(o) {
      o.indent();
      o.out(this.visibility, this.visibility ? ' ' : '',
        this.static ? 'static ' : '',
        this.final ? 'final ' : '',
        this.type, ' ', this.name);
      if ( this.initializer ) {
        o.increaseIndent();
        o.out(' = ', this.initializer);
        o.decreaseIndent();
      }
      o.out(';');
    }
  ]
});
