foam.CLASS({
  package: 'foam.demos.tetrominos',
  name: 'TetrominoFactory',

  requires: [
    'foam.demos.tetrominos.TetrominoLayerFactory',
    'foam.demos.tetrominos.TetrominoController'
  ],

  properties: [
    {
      name: 'layerFactory',
      class: 'FObjectProperty',
      of: 'foam.demos.tetrominos.TetrominoLayerFactory',
      factory: function () {
        return this.TetrominoLayerFactory.create();
      }
    },
    {
      name: 'enabledTypes',
      value: [
        'I', 'J', 'L', 'O', 'S', 'T', 'Z'
      ]
    }
  ],

  methods: [
    function makeTetromino(type) {
      var layer = this.layerFactory.makeTetromino(type);
      var controller = this.TetrominoController.create({ layer: layer });
      return controller;
    },
    function randomTetromino() {
      return this.makeTetromino(this.enabledTypes[
        Math.floor(Math.random()*this.enabledTypes.length)
      ]);
    }
  ]
});