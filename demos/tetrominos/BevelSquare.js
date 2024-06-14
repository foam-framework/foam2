foam.CLASS({
  package: 'foam.demos.tetrominos',
  name: 'BevelSquare',
  extends: 'foam.graphics.Box', // ?

  requires: [
    'foam.graphics.Polygon'
  ],

  properties: [
    // CView
    [ 'autoRepaint', true ],
    [ 'lineWidth', 0 ],
    {
      name: 'width',
      expression: function (size) {
        return size;
      }
    },
    {
      name: 'height',
      expression: function (size) {
        return size;
      }
    },
    // BevelSquare
    {
      name: 'size',
      class: 'Int',
      value: 100
    },
    {
      name: 'hue',
      class: 'Int',
      value: 40
    },
    {
      name: 'sat',
      class: 'Int',
      value: 100
    },
    {
      name: 'bevelRatio',
      value: 0.2
    },
    {
      name: 'lightness',
      class: 'Int',
      value: 60
    },
    {
      name: 'inverted',
      class: 'Boolean',
      value: false
    }
  ],

  methods: [
    function initCView() {
      this.SUPER();

      ratioOp = (op, subj, base, amt) => {
        let part = (subj * amt) / base;
        return ( op == 'add' ) ? subj + part : subj - part;
      }

      var satify = input => input * (this.sat / 100);

      var colLight = `hsl(${this.hue}, ${satify(70)}%, ${ratioOp('add',this.lightness,60,10)}%)`;
      var colNorm = `hsl(${this.hue}, ${satify(90)}%, ${this.lightness}%)`;
      var colDark = `hsl(${this.hue}, ${satify(60)}%, ${ratioOp('sub',this.lightness,60,40)}%)`

      if ( this.inverted ) {
        colLight = `hsl(${this.hue}, ${satify(70)}%, ${ratioOp('sub',this.lightness,60,20)}%)`;
        colNorm = `hsl(${this.hue}, ${satify(90)}%, ${ratioOp('sub',this.lightness,60,30)}%)`;
        colDark = `hsl(${this.hue}, ${satify(60)}%, ${ratioOp('add',this.lightness,60,10)}%)`
      }

      let bevelSize = 0.5 * this.size * this.bevelRatio;

      var scale;
      scale = input => Array.isArray(input)
        ? input.map(scale)
        : ((input) => {
          switch ( input ) {
          case 0:
            return 0;
          case 10:
            return bevelSize;
          case 40:
            return this.size - bevelSize;
          case 50:
            return this.size;
          }
        })(input)
        ;

      this
        .add(this.Polygon.create({
          xCoordinates: scale([0, 50, 50, 0]),
          yCoordinates: scale([0, 0, 50, 50]),
          color: colNorm,
          lineWidth: 0,
        }))
        .add(this.Polygon.create({
          xCoordinates: scale([0, 10, 40, 50]),
          yCoordinates: scale([0, 10, 10,  0]),
          color: colLight,
          lineWidth: 0,
        }))
        .add(this.Polygon.create({
          xCoordinates: scale([0, 10, 10, 0]),
          yCoordinates: scale([0, 10, 40, 50]),
          color: colLight,
          lineWidth: 0,
        }))
        .add(this.Polygon.create({
          xCoordinates: scale([50, 40, 40, 50]),
          yCoordinates: scale([0, 10, 40, 50]),
          color: colDark,
          lineWidth: 0,
        }))
        .add(this.Polygon.create({
          xCoordinates: scale([0, 10, 40, 50]),
          yCoordinates: scale([50, 40, 40, 50]),
          color: colDark,
          lineWidth: 0,
        }))
        ;
    }
  ]
});