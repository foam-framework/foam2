foam.CLASS({
  package: 'foam.graphics',
  name: 'StereoCView',
  extends: 'foam.graphics.CView',

  methods: [
    function paintChildren(x) {
      this.children.sort(function(o1, o2) { return o2.z - o1.z; });

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
      }
    }
  ]

});