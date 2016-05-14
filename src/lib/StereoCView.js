foam.CLASS({
  package: 'foam.graphics',
  name: 'StereoCView',
  extends: 'foam.graphics.CView',

  methods: [
    function paintChildren(x) {
      for ( var i = 0 ; i < this.children.length ; i++ ) {
        var c = this.children[i];
        c.x += 20;
        c.paint(x);
      }
      
      x.translate(500, 0);

      for ( var i = 0 ; i < this.children.length ; i++ ) {
        var c = this.children[i];
        c.x -= 20;
        c.paint(x);
        c.x += 20;
      }
    }
  ]

});