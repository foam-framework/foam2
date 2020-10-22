foam.CLASS({
  package: 'foam.demos.tetrominos',
  name: 'GridLocation',

  properties: [
    {
      name: 'x',
      class: 'Int'
    },
    {
      name: 'y',
      class: 'Int'
    }
  ]
})

foam.CLASS({
  package: 'foam.demos.tetrominos',
  name: 'GridSquare',

  properties: [
    {
      name: 'hue',
      class: 'Int'
    },
    {
      name: 'location',
      class: 'FObjectProperty',
      of: 'foam.demos.tetrominos.GridLocation'
    }
  ]
})

foam.CLASS({
  package: 'foam.demos.tetrominos',
  name: 'GridLayer',

  properties: [
    {
      name: 'squares',
      class: 'FObjectArray',
      of: 'foam.demos.tetrominos.GridSquare'
    },
    {
      name: 'location',
      class: 'FObjectProperty',
      of: 'foam.demos.tetrominos.GridLocation'
    },
    {
      name: 'width',
      class: 'Int',
      expression: function (squares) {
        var w = 0;
        squares.forEach(square => {
          if ( square.location.x > w ) w = square.location.x;
        })
        return w + 1;
      }
    },
    {
      name: 'height',
      class: 'Int',
      expression: function (squares) {
        var h = 0;
        squares.forEach(square => {
          if ( square.location.y > h ) h = square.location.y;
        })
        return h + 1;
      }
    }
  ],

  methods: [
    function checkCollision(other) {
      var collision = false;
      this.squares.forEach(s1 => {
        other.squares.forEach(s2 => {
          var x1 = this.location.x + s1.location.x;
          var y1 = this.location.y + s1.location.y;
          var x2 = other.location.x + s2.location.x;
          var y2 = other.location.y + s2.location.y;
          if ( x1 == x2 && y1 == y2 ) {
            collision = true;
            return false;
          }
        })
      })
      return collision;
    }
  ]
})

foam.CLASS({
  package: 'foam.demos.tetrominos',
  name: 'Grid',

  properties: [
    {
      name: 'width',
      class: 'Int',
      value: 10
    },
    {
      name: 'height',
      class: 'Int',
      value: 22
    },
    {
      name: 'layers',
      class: 'FObjectArray',
      of: 'foam.demos.tetrominos.GridLayer',
    },
    {
      name: 'updates',
      value: 0
    }
  ],

  methods: [
    function addLayer(layer) {
      this.layers.push(layer);
      this.layers = this.layers;
    },
    function clear() {
      this.layers = [];
    },
    function checkCollision(layer, ignoreList) {
      // "reference location"
      var ref = layer.location;

      // Check for wall collisions
      let wallCollision = false;
      layer.squares.forEach(square => {
        if (
          square.location.x + ref.x < 0 ||
          square.location.y + ref.y < 0 ||
          square.location.x + ref.x >= this.width ||
          square.location.y + ref.y >= this.height
        ) {
          wallCollision = true;
          return false;
        }
      });

      if ( wallCollision ) return 'wall';

      // Check for layer collisions
      let layerCollision = false;
      this.layers.forEach(otherLayer => {
        var ignore = false;
        ignoreList.forEach(ignLayer => {
          if ( otherLayer === ignLayer ) {
            ignore = true;
            return false;
          }
        });
        if ( ignore ) return;
        if ( layer.checkCollision(otherLayer) ) {
          layerCollision = true;
          return false;
        }
      });

      if ( layerCollision ) return 'layer';
      
      return false;
    }
  ]
})