foam.CLASS({
    package: 'foam.u2',
    name: 'PrecisionFloatView',
    extends: 'foam.u2.FloatView',
    
    documentation: 'Float view that limits input length based on precision.',
    
    methods: [
      function link() {
        this.SUPER();
    
        if ( this.precision !== undefined ) {
          this.data$.sub(function() {
            var text = this.data.toString();
            if ( text.indexOf('.') > 0 && text.length - text.indexOf('.') - 1 > this.precision ) {
              this.attrSlot(null, this.onKey ? 'input' : null).set(text.substring(0, text.indexOf('.') + this.precision + 1));
            }
          }.bind(this));
        }
      }
    ]
  });
    
  