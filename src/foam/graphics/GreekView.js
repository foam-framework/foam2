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

      var viewPort = this.Box.create({
        clip: true,
        height$: this.slot(function(view$height, scale) {
          return view$height * scale;
        }),
        width$: this.slot(function(view$width, scale) {
          return view$width * scale;
        }),
        scaleX$: this.scale$,
        scaleY$: this.scale$,
      });
      viewPort.add(this.view);

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
      })
      
      navContainer.add(this.view);
      navContainer.add(navViewPort);

      var drag = false;
      var moveViewPort = e => {
        if ( ! drag ) return;
        navViewPort.x = Math.min(
          Math.max(0, e.offsetX / viewScale$.get() - navViewPort.width / 2),
          this.view.width - navViewPort.width
        );
        navViewPort.y = Math.min(
          Math.max(0, e.offsetY / viewScale$.get() - navViewPort.height / 2),
          this.view.height - navViewPort.height
        );

        viewPort.x = - navViewPort.x * this.scale;
        viewPort.y = - navViewPort.y * this.scale;
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
      var width = 500;
      var height = 1000;
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
        scale: 10,
      });
      this
        .add(cview)
        .tag(this.SectionedDetailView, { data: cview });
    }
  ]
});