foam.CLASS({
  package: 'foam.demos.tetrominos',
  name: 'TetrominoLayerFactory',

  properties: [
    {
      name: 'hueMap',
      value: {
        'I': 180, // cyan
        'J': 210, // blue
        'L': 30,  // orange
        'O': 60,  // yellow
        'S': 120, // green
        'T': 290, // magenta
        'Z': 0,   // red
      }
    }
  ],

  methods: [
    function makeTetromino(type) {
      let hue = this.hueMap[type];
      let pkg = foam.demos.tetrominos;
      switch ( type ) {
      case 'I':
        return pkg.GridLayer.create({
          location: null,
          squares: [
            pkg.GridSquare.create({
              hue: hue,
              location: pkg.GridLocation.create({ x: 0, y: 0 })
            }),
            pkg.GridSquare.create({
              hue: hue,
              location: pkg.GridLocation.create({ x: 0, y: 1 })
            }),
            pkg.GridSquare.create({
              hue: hue,
              location: pkg.GridLocation.create({ x: 0, y: 2 })
            }),
            pkg.GridSquare.create({
              hue: hue,
              location: pkg.GridLocation.create({ x: 0, y: 3 })
            })
          ]
        })
      case 'J':
        return pkg.GridLayer.create({
          location: null,
          squares: [
            pkg.GridSquare.create({
              hue: hue,
              location: pkg.GridLocation.create({ x: 1, y: 0 })
            }),
            pkg.GridSquare.create({
              hue: hue,
              location: pkg.GridLocation.create({ x: 1, y: 1 })
            }),
            pkg.GridSquare.create({
              hue: hue,
              location: pkg.GridLocation.create({ x: 1, y: 2 })
            }),
            pkg.GridSquare.create({
              hue: hue,
              location: pkg.GridLocation.create({ x: 0, y: 2 })
            })
          ]
        })
      case 'L':
        return pkg.GridLayer.create({
          location: null,
          squares: [
            pkg.GridSquare.create({
              hue: hue,
              location: pkg.GridLocation.create({ x: 0, y: 0 })
            }),
            pkg.GridSquare.create({
              hue: hue,
              location: pkg.GridLocation.create({ x: 0, y: 1 })
            }),
            pkg.GridSquare.create({
              hue: hue,
              location: pkg.GridLocation.create({ x: 0, y: 2 })
            }),
            pkg.GridSquare.create({
              hue: hue,
              location: pkg.GridLocation.create({ x: 1, y: 2 })
            })
          ]
        })
      case 'O':
        return pkg.GridLayer.create({
          location: null,
          squares: [
            pkg.GridSquare.create({
              hue: hue,
              location: pkg.GridLocation.create({ x: 0, y: 0 })
            }),
            pkg.GridSquare.create({
              hue: hue,
              location: pkg.GridLocation.create({ x: 0, y: 1 })
            }),
            pkg.GridSquare.create({
              hue: hue,
              location: pkg.GridLocation.create({ x: 1, y: 0 })
            }),
            pkg.GridSquare.create({
              hue: hue,
              location: pkg.GridLocation.create({ x: 1, y: 1 })
            })
          ]
        })
      case 'S':
        return pkg.GridLayer.create({
          location: null,
          squares: [
            pkg.GridSquare.create({
              hue: hue,
              location: pkg.GridLocation.create({ x: 0, y: 0 })
            }),
            pkg.GridSquare.create({
              hue: hue,
              location: pkg.GridLocation.create({ x: 1, y: 0 })
            }),
            pkg.GridSquare.create({
              hue: hue,
              location: pkg.GridLocation.create({ x: 1, y: 1 })
            }),
            pkg.GridSquare.create({
              hue: hue,
              location: pkg.GridLocation.create({ x: 2, y: 1 })
            })
          ]
        })
      case 'Z':
        return pkg.GridLayer.create({
          location: null,
          squares: [
            pkg.GridSquare.create({
              hue: hue,
              location: pkg.GridLocation.create({ x: 0, y: 1 })
            }),
            pkg.GridSquare.create({
              hue: hue,
              location: pkg.GridLocation.create({ x: 1, y: 1 })
            }),
            pkg.GridSquare.create({
              hue: hue,
              location: pkg.GridLocation.create({ x: 1, y: 0 })
            }),
            pkg.GridSquare.create({
              hue: hue,
              location: pkg.GridLocation.create({ x: 2, y: 0 })
            })
          ]
        })
      case 'T':
        return pkg.GridLayer.create({
          location: null,
          squares: [
            pkg.GridSquare.create({
              hue: hue,
              location: pkg.GridLocation.create({ x: 0, y: 0 })
            }),
            pkg.GridSquare.create({
              hue: hue,
              location: pkg.GridLocation.create({ x: 1, y: 0 })
            }),
            pkg.GridSquare.create({
              hue: hue,
              location: pkg.GridLocation.create({ x: 1, y: 1 })
            }),
            pkg.GridSquare.create({
              hue: hue,
              location: pkg.GridLocation.create({ x: 2, y: 0 })
            })
          ]
        })
      }
    }
  ]
});