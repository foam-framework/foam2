foam.CLASS({
  package: 'foam.demos.tetrominos',
  name: 'GameController',

  requires: [
    'foam.core.Action',
    'foam.demos.tetrominos.Grid',
    'foam.demos.tetrominos.GridLayer',
    'foam.demos.tetrominos.GridSquare',
    'foam.demos.tetrominos.GridLocation',
    'foam.demos.tetrominos.TetrominoLayerFactory',
    'foam.demos.tetrominos.TetrominoFactory',
    'foam.util.Timer',
    'foam.u2.dialog.Popup',
    'foam.u2.dialog.SimpleActionDialog',
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
        var t = this.Timer.create({ interval: 20 });
        this.tick$ = t.time$.map(function(t) { return Math.floor(t / 200); });
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
      name: 'view',
      visibility: 'HIDDEN'
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
      visibility: 'HIDDEN',
      class: 'FObjectProperty',
      of: 'foam.demos.tetrominos.ControllerE'
    },
    {
      name: 'tetrominoFactory',
      class: 'FObjectProperty',
      of: 'foam.demos.tetrominos.TetrominoFactory',
      visibility: 'HIDDEN',
      factory: function () {
        return foam.demos.tetrominos.TetrominoFactory.create();
      }
    },
    {
      name: 'rowLayers',
      class: 'FObjectArray',
      of: 'foam.demos.tetrominos.GridLayer',
    },
    {
      name: 'state',
      visibility: 'HIDDEN',
      factory: function () {
        return this.State.INTRO;
      }
    }
  ],

  enums: [
    {
      name: 'State',
      values: [
        'INTRO',
        'PLAY',
        'PAUSED',
        'GAMEOVER',
      ],
    },
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
      setTimeout(() => {
        this.showInit();
      }, 500);
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
        if ( this.state != this.State.PLAY ) return;
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
            if ( layer.location.y == 0 ) this.gameOver();
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
        y: 0,
      })
      this.data.layers =
        this.data.layers.concat(t.layer);
      this.view.reallyInvalidate();
      this.control(t);
    },
    function showInit() {
      var prompt = this.Popup.create().tag(this.SimpleActionDialog, {
        title: 'Welcome to FOAM Tetrominos!',
        actions: [
          this.Action.create({
            name: 'start',
            label: 'Start Game',
            code: () => {
              prompt.close();
              setTimeout(() => {
                this.state = this.State.PLAY;
              }, 1000)
            }
          }),
        ]
      });
      ctrl.add(prompt);
    },
    function gameOver() {
      this.state = this.State.GAMEOVER;
      var prompt = this.Popup.create().tag(this.SimpleActionDialog, {
        title: 'Game Over',
        actions: [
          this.Action.create({
            name: 'start',
            label: 'Play Again',
            code: () => {
              prompt.close();
              setTimeout(() => {
                this.data.clear();
                this.state = this.State.PLAY;
              }, 1000)
            }
          }),
        ]
      });
      ctrl.add(prompt);
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

        // Apply squares to row layers
        layer.squares.forEach(square => {
          var row = this.data.height
            - ( layer.location.y + square.location.y )
            - 1
            ;
          while ( this.rowLayers.length <= row ) {
            var rowLayer = this.GridLayer.create({
              location: this.GridLocation.create({
                x: 0,
                y: this.data.height - this.rowLayers.length - 1
              })
            });
            this.rowLayers$push(rowLayer);
            this.data.layers$push(rowLayer);
          }
          var rowLayer = this.rowLayers[row];
          rowLayer.squares$push(this.GridSquare.create({
            hue: square.hue,
            location: this.GridLocation.create({
              x: layer.location.x + square.location.x,
              y: 0
            })
          }))
        })

        // Remove tetromino layer from board
        var i = this.data.layers.indexOf(layer);
        this.data.layers.splice(i, 1);

        // Clear row
        for ( let i = 0 ; i < this.rowLayers.length ; i++ ) {
          if ( this.rowLayers[i].squares.length >= this.data.width ) {
            var iGlobal = this.data.layers.indexOf(this.rowLayers[i]);
            this.data.layers.splice(iGlobal, 1);
            this.rowLayers.splice(i, 1);
            for ( let j = i ; j < this.rowLayers.length ; j++ ) {
              this.rowLayers[j].location.y++;
            }
            i--;
          }
        }

        /*
          ROW 3 :  OO     <-- row = 3 ; y = height - 4
          ROW 2 :   O
          ROW 1 : ##O####
          ROW 0 : #######
        */
      }
    }
  ],
});