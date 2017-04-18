foam.CLASS({
  package: 'foam.java',
  name: 'Code',

  properties: [
    {
      class: 'String',
      name: 'data'
    }
  ],

  methods: [
    function outputJava(o) {
      var lines = this.data.split('\n');
      for ( var i = 0 ; i < lines.length ; i++ ) {
        o.indent();
        o.out(lines[i], '\n');
      }
    }
  ]
});
