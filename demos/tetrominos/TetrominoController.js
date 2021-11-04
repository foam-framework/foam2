foam.CLASS({
  package: 'foam.demos.tetrominos',
  name: 'TetrominoController',
  documentation: `
    Controls a layer representing a tetromino.
  `,

  requires: [
    'foam.demos.tetrominos.GridLayer',
    'foam.demos.tetrominos.GridSquare',
    'foam.demos.tetrominos.GridLocation'
  ],

  properties: [
    { name: 'checkCollision', class: 'Function' },
    { name: 'rotationFunction', class: 'Function', value: false },
    { name: 'layer', class: 'FObjectProperty', of: 'foam.demos.tetrominos.GridLayer' },
    { name: 'rotationState', class: 'Int' },
  ],

  methods: [
    function rotate() {
      if ( this.rotationFunction ) {
        this.rotationFunction(this.layer)
      } else {
        // By default, use the simplest rotation algorithm
        let newHeight = this.layer.width;
        let newWidth = this.layer.height;

        let newSquares = [];

        this.layer.squares.forEach(square => {
          newSquares.push(this.GridSquare.create({
            hue: square.hue,
            location: this.GridLocation.create({
              x: newWidth-1 - square.location.y,
              y: square.location.x
            })
          }));
        });

        this.layer.squares = newSquares;
      }
    },
    function l() {
      let testLayer = this.layer.clone();
      testLayer.location.x--;
      if ( ! this.checkCollision(testLayer, [this.layer]) ) {
        this.layer.location = testLayer.location;
      }
    },
    function r() {
      let testLayer = this.layer.clone();
      testLayer.location.x++;
      if ( ! this.checkCollision(testLayer, [this.layer]) ) {
        this.layer.location = testLayer.location;
      }
    },
    function down() {
      let testLayer = this.layer.clone();
      testLayer.location.y++;
      if ( ! this.checkCollision(testLayer, [this.layer]) ) {
        this.layer.location = testLayer.location;
      }
    }
  ]
});