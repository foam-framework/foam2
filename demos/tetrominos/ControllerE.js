foam.CLASS({
  package: 'foam.demos.tetrominos',
  name: 'ControllerE',
  extends: 'foam.u2.Element',

  topics: ['left', 'right', 'up', 'down'],

  requires: [
    'foam.demos.tetrominos.GridView',
    'foam.u2.DetailView',
  ],

  properties: [
    [ 'autoRepaint', true ],
    {
      name: 'delegate',
      class: 'FObjectProperty',
      of: 'foam.graphics.Box'
    },
  ],

  methods: [
    function initE() {
      this.SUPER();

      var myAudio = new Audio('tetrominos.mp3'); 

      myAudio.addEventListener('ended', function() {
          this.currentTime = 0;
          var p = this.play();
          if ( p ) p.catch(err => { console.error(err) });
      }, false);
      this.on('click', () => {
        var p = null;
        if ( myAudio.paused ) p = myAudio.play()
        else myAudio.pause();
        if ( p ) p.catch(err => { console.error(err) });
      });

let startPiece = null;
let pkg = foam.demos.tetrominos;
let tfac = pkg.TetrominoLayerFactory.create();
let game = pkg.GameController.create();
game.element = this;

let grid = pkg.Grid.create({
  layers: [
    /*
    ( () => {
      let block = tfac.makeTetromino('I');
      block.location = pkg.GridLocation.create({ x: 0, y: 0 });
      return block;
    })(),
    ( () => {
      let block = tfac.makeTetromino('J');
      block.location = pkg.GridLocation.create({ x: 1, y: 0 });
      return block;
    })(),
    ( () => {
      let block = tfac.makeTetromino('L');
      block.location = pkg.GridLocation.create({ x: 3, y: 0 });
      return block;
    })(),
    ( () => {
      let block = tfac.makeTetromino('O');
      block.location = pkg.GridLocation.create({ x: 5, y: 0 });
      return block;
    })(),
    ( () => {
      let block = tfac.makeTetromino('S');
      block.location = pkg.GridLocation.create({ x: 7, y: 0 });
      return block;
    })(),
    ( () => {
      let block = tfac.makeTetromino('Z');
      block.location = pkg.GridLocation.create({ x: 0, y: 4 });
      return block;
    })(),
    */
    // ( () => {
    //   let block = tfac.makeTetromino('T');
    //   block.location = pkg.GridLocation.create({ x: 3, y: 4 });
    //   startPiece = block;
    //   return block;
    // })(),
  ]
})
let view = pkg.GridView.create({ data: grid })
game.data = grid;
game.view = view;
this.add(game.view);
game.ready();
game.start();
// this.tag(this.DetailView, { data: game });
// game.control(pkg.TetrominoController.create({
//   layer: startPiece
// }));

    }
  ],

  actions: [
    {
      name: 'leftAction',
      keyboardShortcuts: [ 'h' ],
      code: function() {
        this.left.pub();
      }
    },
    {
      name: 'rightAction',
      keyboardShortcuts: [ 'l' ],
      code: function() {
        this.right.pub();
      }
    },
    {
      name: 'upAction',
      keyboardShortcuts: [ 'k' ],
      code: function() {
        this.up.pub();
      }
    },
    {
      name: 'downAction',
      keyboardShortcuts: [ 'j' ],
      code: function() {
        this.down.pub();
      }
    },
    {
      name: 'playAudio',
      code: function() {
        var myAudio = new Audio('tetris.wav'); 
        myAudio.addEventListener('ended', function() {
            this.currentTime = 0;
            var p = this.play();
            if ( p ) p.catch(err => { console.error(err) });
        }, false);
        var p = myAudio.play();
        if ( p ) p.catch(err => { console.error(err) });
      }
    }
  ]
})
