foam.CLASS({
  package: 'foam.demos.tetrominos',
  name: 'GameController',

  requires: [
    'foam.demos.tetrominos.Grid',
    'foam.demos.tetrominos.GridLayer',
    'foam.demos.tetrominos.GridSquare',
    'foam.demos.tetrominos.GridLocation',
    'foam.demos.tetrominos.TetrominoLayerFactory',
    'foam.demos.tetrominos.TetrominoFactory',
    'foam.util.Timer',
    'foam.audio.Beep',
  ],

  properties: [
    {
      name: 'tick',
      class: 'Int'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.util.Timer',
      name: 'timer',
      required: true,
      hidden: true,
      factory: function() {
        var t = this.Timer.create();
        this.tick$ = t.time$.map(function(t) { return Math.floor(t / 800); });
        return t;
      },
    },
    {
      name: 'data',
      class: 'FObjectProperty',
      of: 'foam.demos.tetrominos.Grid',
      factory: function() {
        return foam.demos.tetrominos.Grid.create();
      }
    },
    {
      name: 'view'
    },
    {
      name: 'tickBeep',
      class: 'FObjectProperty',
      of: 'foam.audio.Beep',
      factory: () => {
        return foam.audio.Beep.create({
          duration: 40,
          frequency: 300,
          type: 'sine',
          gain: 0.4,
        });
      }
    },
    {
      name: 'dropBeep',
      class: 'FObjectProperty',
      of: 'foam.audio.Beep',
      factory: () => {
        return foam.audio.Beep.create({
          duration: 40,
          frequency: 220,
          type: 'sine',
          gain: 0.6,
        });
      }
    },
    {
      name: 'rotoBeep',
      class: 'FObjectProperty',
      of: 'foam.audio.Beep',
      factory: () => {
        return foam.audio.Beep.create({
          duration: 80,
          frequency: 400,
          type: 'sine',
          gain: 0.6,
        });
      }
    },
    {
      name: 'downBeep',
      class: 'FObjectProperty',
      of: 'foam.audio.Beep',
      factory: () => {
        return foam.audio.Beep.create({
          duration: 40,
          frequency: 500,
          type: 'square',
          gain: 0.3,
        });
      }
    },
    {
      name: 'currentTetromino',
      class: 'FObjectProperty',
      of: 'foam.demos.tetrominos.TetrominoController',
      value: null
    },
    {
      name: 'element',
      class: 'FObjectProperty',
      of: 'foam.demos.tetrominos.ControllerE'
    },
    {
      name: 'tetrominoFactory',
      class: 'FObjectProperty',
      of: 'foam.demos.tetrominos.TetrominoFactory',
      factory: function () {
        return foam.demos.tetrominos.TetrominoFactory.create();
      }
    },
    {
      name: 'rowLayers',
      class: 'FObjectArray',
    }
  ],

  methods: [
    function ready() {
      this.element.left.sub(() => {
        this.currentTetromino.l();
        this.view.reallyInvalidate();
      })
      this.element.right.sub(() => {
        this.currentTetromino.r();
        this.view.reallyInvalidate();
      })
      this.element.up.sub(() => {
        this.currentTetromino.rotate();
        this.view.reallyInvalidate();
        this.rotoBeep.play();
      })
      this.element.down.sub(() => {
        this.currentTetromino.down();
        this.view.reallyInvalidate();
        this.downBeep.play();
      })
    },
    function start() {
      this.timer.start();

      this.controlNewTetromino();
    },
    function control(tetromino) {
      // Connect TetrominoController to game state
      tetromino.checkCollision = this.data.checkCollision.bind(this.data);

      // Bind gravity to the Tetromino layer
      // (gravity is a fact of the environment, but hypothetically
      //  a tetromino controller could "resist" it by moving upward)
      var layer = tetromino.layer;
      this.tick$.sub((sub) => {
        let end = () => {
          sub.detach();
          this.mergeLayerIntoRows(layer);
          this.controlNewTetromino();
          this.dropBeep.play();
        }
        if ( layer.location.y + layer.height < 22 ) {
          let testLayer = layer.clone();
          testLayer.location = this.GridLocation.create({
            x: layer.location.x,
            y: layer.location.y + 1,
          });
          if ( this.data.checkCollision(testLayer, [layer]) ) {
            end()
          } else {
            layer.location = testLayer.location;
            this.view.reallyInvalidate();
            this.tickBeep.play();
          }
        } else {
          end();
        }
      });

      // Make this the active piece
      this.currentTetromino = tetromino;
    },
    function controlNewTetromino() {
      var t = this.tetrominoFactory.randomTetromino();
      t.layer.location = this.GridLocation.create({
        x: 2,
        y: 2,
      })
      this.data.layers =
        this.data.layers.concat(t.layer);
      console.log('layers?', this.data.layers);
      this.view.reallyInvalidate();
      console.log(t);
      this.control(t);
    },
    {
      name: 'mergeLayerIntoRows',
      documentation: `
        This method takes a layer object and merges it into layers that
        represent rows. Some rows may have already been started, and some
        new rows may need to be created. This allows the game controller
        to check only one layer to see if a row is complete, which
        improves efficiency over iterating over tetromino layers.

        Also, the original tetromino layer is removed from the grid.
      `,
      code: function (layer) {
        //
      }
    }
  ],
});