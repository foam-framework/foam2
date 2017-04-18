foam.CLASS({
  package: 'foam.java',
  name: 'Outputter',

  properties: [
    {
      name: 'indentLevel_',
      value: 0
    },
    {
      name: 'indentStr',
      value: '  '
    },
    {
      class: 'String',
      name: 'buf_'
    }
  ],

  methods: [
    function indent() {
      for ( var i = 0 ; i < this.indentLevel_ ; i++ ) this.buf_ += this.indentStr;
      return this;
    },

    function out() {
      for ( var i = 0 ; i < arguments.length ; i++ ) {
        if ( arguments[i] != null && arguments[i].outputJava ) { arguments[i].outputJava(this); }
        else this.buf_ += arguments[i];
      }
      return this;
    },

    function increaseIndent() {
      this.indentLevel_++;
    },

    function decreaseIndent() {
      this.indentLevel_--;
    }
  ]
});
