foam.CLASS({
  package: 'foam.java',
  name: 'Argument',

  properties: [
    'type',
    'name'
  ],

  methods: [
    function outputJava(o) {
      o.out(this.type, ' ', this.name);
    }
  ]
});
