foam.CLASS({
  package: 'foam.demos.tetrominos',
  name: 'GridView',
  extends: 'foam.graphics.Box',

  requires: [
    'foam.demos.tetrominos.BevelSquare'
  ],

  properties: [
    [ 'autoRepaint', true ],
    'data',
    {
      name: 'size',
      class: 'Int',
      value: 25
    },
    {
      name: 'width',
      expression: function(data, size) {
        if ( ! data ) return this.size;
        return size * data.width;
      }
    },
    {
      name: 'height',
      expression: function(data, size) {
        if ( ! data ) return this.size;
        return size * data.height;
      }
    }
  ],

  methods: [
    function initCView() {
      this.SUPER();

      var grid = this.data;
      for ( let y = 0 ; y < grid.height ; y++ )
      for ( let x = 0 ; x < grid.width ; x++ )
      {
        this.add(
          this.BevelSquare.create({
            x: x*this.size,
            y: y*this.size,
            size: this.size,
            hue: 0,
            sat: 0,
            inverted: true,
            lightness: 20
          })
        );
      }

      grid.layers.forEach(layer => {
        let x0 = layer.location.x;
        let y0 = layer.location.y;


        /* debug: render layer size
        for (let j=0;j<layer.width;j++)
        for (let k=0;k<layer.height;k++) {
          this.add(
            this.BevelSquare.create({
              x: (x0 + j) * this.size,
              y: (y0 + k) * this.size,
              size: this.size,
              hue: 210,
              inverted: true,
              lightness: 80,
            })
          );
        }
        */

        layer.squares.forEach(square => {
          this.add(
            this.BevelSquare.create({
              x: ( x0 + square.location.x ) * this.size,
              y: ( y0 + square.location.y ) * this.size,
              size: this.size,
              hue: square.hue
            })
          );
        })
      });
    },
    function reallyInvalidate() {
      this.children = [];
      this.initCView();
    }
  ]
})