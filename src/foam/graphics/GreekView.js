foam.CLASS({
  package: 'foam.graphics',
  name: 'GreekView',
  extends: 'foam.graphics.CView',
  requires: [
    'foam.graphics.CView',
    'foam.graphics.Box',
    'foam.graphics.Circle',
  ],
  properties: [
    {
      class: 'Color',
      name: 'navBorder',
      value: 'black'
    },
    {
      class: 'Color',
      name: 'viewBorder',
      value: 'white'
    },
    {
      class: 'Int',
      name: 'viewBorderWidth',
      value: 20
    },
    {
      class: 'Int',
      name: 'navBorderWidth',
      value: 20
    },
    {
      class: 'Map',
      name: 'viewPortPosition',
      value: { x: 0, y: 0 }
    },
    {
      class: 'Float',
      name: 'navSize',
      value: 0.2
    },
    {
      class: 'Float',
      name: 'scale',
      value: 1
    },
    {
      name: 'view',
      hidden: true,
      required: true
    }
  ],
  methods: [
    function initCView() {
      this.SUPER();

      var viewScale$ = this.slot(function(navSize, width, view$width, height, view$height) {
        return navSize * Math.min(width / view$width, height / view$height);
      });

      var navContainer = this.Box.create({
        borderWidth$: this.viewBorderWidth$,
        border$: this.navBorder$,
        clip: true,
        width$: this.view$.dot('width'),
        height$: this.view$.dot('height'),
        scaleX$: viewScale$,
        scaleY$: viewScale$,
      });

      var navViewPort = this.Box.create({
        borderWidth$: this.viewBorderWidth$,
        border$: this.viewBorder$,
        height$: this.slot(function(height, scale) { return height / scale }),
        width$: this.slot(function(width, scale) { return width / scale }),
      });
      navViewPort.x$ = this.slot(function(pos, viewScale, navViewPortWidth, viewWidth) {
        return Math.min(
          Math.max(0, pos.x / viewScale - navViewPortWidth / 2),
          viewWidth - navViewPortWidth
        )
      }, this.viewPortPosition$, viewScale$, navViewPort.width$, this.view$.dot('width'));
      navViewPort.y$ = this.slot(function(pos, viewScale, navViewPortHeight, viewHeight) {
        return Math.min(
          Math.max(0, pos.y / viewScale - navViewPortHeight / 2),
          viewHeight - navViewPortHeight
        )
      }, this.viewPortPosition$, viewScale$, navViewPort.height$, this.view$.dot('height'));

      var viewPort = this.Box.create({
        clip: true,
        height$: this.view$.dot('height'),
        width$: this.view$.dot('width'),
        scaleX$: this.scale$,
        scaleY$: this.scale$,
        x$: this.slot((x, s) => -x * s, navViewPort.x$, this.scale$),
        y$: this.slot((y, s) => -y * s, navViewPort.y$, this.scale$)
      });
      viewPort.add(this.view);
      
      navContainer.add(this.view);
      navContainer.add(navViewPort);

      var drag = false;
      var moveViewPort = e => {
        if ( ! drag ) return;
        this.viewPortPosition = { x: e.offsetX, y: e.offsetY };
      };
      this.canvas.on('mousedown', e => {
        var p = {
          x: e.offsetX / viewScale$.get(),
          y: e.offsetY / viewScale$.get()
        };
        drag = navContainer.hitTest(p);
        moveViewPort(e);
      });
      this.canvas.on('mouseup', _ => drag = false);
      this.canvas.on('mousemove', moveViewPort);
      
      this.add(viewPort);
      this.add(navContainer);
      
    }
  ]
});

foam.CLASS({
  package: 'foam.graphics',
  name: 'GreekViewDemo',
  extends: 'foam.u2.Element',
  requires: [
    'foam.graphics.CView',
    'foam.graphics.GreekView',
    'foam.graphics.Box',
    'foam.graphics.Circle',
    'foam.u2.detail.SectionedDetailView',
  ],
  exports: [
    'displayWidth'
  ],
  properties: [
    {
      class: 'Enum',
      of: 'foam.u2.layout.DisplayWidth',
      name: 'displayWidth',
      value: 'XL'
    },
  ],
  methods: [
    function initE() {
      var shapes = [
        'Box',
        'Circle'
      ];
      var color = function() {
        var hex = Math.floor(Math.random() * parseInt('FFFFFF', 16)).toString(16).padStart(6, '0')
        return '#' + hex;
      }
      var width = 10000;
      var height = 10000;
      var scale = 0.2;
      var view = this.Box.create({
        x: 0,
        y: 0,
        color: 'white',
        height: height,
        width: width
      });
      for ( var i = 0 ; i < 1000; i++ ) {
        view.add(this[shapes[Math.floor(shapes.length * Math.random())]].create({
          x: width * (2 * Math.random() - 1),
          y: height * (2 * Math.random() - 1),
          width: scale * width * Math.random(),
          height: scale * height * Math.random(),
          color: color(),
          border: color(),
          borderWidth: 5,
          arcWidth: 5,
          radius: scale * width * Math.random(),

        }))
      }

      var cview = this.GreekView.create({
        view: view,
        height: 1000,
        width: 1500,
        scale: 1,
      });
      this
        .add(cview)
        .tag(this.SectionedDetailView, { data: cview });
    }
  ]
});