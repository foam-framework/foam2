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
      value: 'red'
    },
    {
      class: 'Int',
      name: 'viewBorderWidth',
      value: 5 
    },
    {
      class: 'Int',
      name: 'navBorderWidth',
      value: 10
    },
    {
      class: 'Map',
      name: 'viewPortPosition',
      preSet: function(_, n) {
        if ( ! this.hasOwnProperty('navView_') || ! this.hasOwnProperty('viewPortView_') ) {
          return { x: 0, y: 0 }
        }
        return {
          x: Math.max(0, Math.min(n.x || 0, this.navView_.width - this.viewPortView_.width)),
          y: Math.max(0, Math.min(n.y || 0, this.navView_.height - this.viewPortView_.height)),
        }
      }
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
    },
    {
      class: 'Color',
      name: 'handleColor',
      value: 'green'
    },
    {
      class: 'Float',
      name: 'handleHeight',
      value: 20
    },

    {
      name: 'navView_',
      hidden: true,
      factory: function() {
        var v = this.Box.create({
          x: this.navBorderWidth / 2,
          y: this.handleHeight + this.navBorderWidth / 2,
          borderWidth$: this.navBorderWidth$,
          border$: this.navBorder$,
          clip: true,
          width$: this.innerNavView_.slot(function(scaleX, width) {
            return scaleX * width;
          }),
          height$: this.innerNavView_.slot(function(scaleY, height) {
            return scaleY * height;
          }),
        })

        v.add(this.innerNavView_);
        v.add(this.viewPortView_);

        return v;
      }
    },
    {
      name: 'viewPortView_',
      hidden: true,
      factory: function() {
        var v = this.Box.create({
          borderWidth$: this.viewBorderWidth$,
          border$: this.viewBorder$,
          height$: this.slot(function(scale, height, innerNavView_$scaleY) {
            return height * innerNavView_$scaleY / scale;
          }),
          width$: this.slot(function(scale, width, innerNavView_$scaleX) {
            return width * innerNavView_$scaleX / scale;
          }),
          x$: this.slot(function (viewPortPosition) {
            return viewPortPosition.x;
          }),
          y$: this.slot(function (viewPortPosition) {
            return viewPortPosition.y;
          })
        });
        return v;
      }
    },
    {
      name: 'navViewHandle_',
      hidden: true,
      factory: function() {
        return this.Box.create({
          width$: this.slot(function(navView_$width, navBorderWidth) {
            return navView_$width + navBorderWidth;
          }),
          height$: this.handleHeight$,
          color$: this.handleColor$,
          x$: this.slot(function(navView_$x, navBorderWidth) {
            return navView_$x - navBorderWidth / 2;
          }),
          y$: this.slot(function(navView_$y, navBorderWidth, handleHeight) {
            return navView_$y - handleHeight - navBorderWidth / 2;
          })
        });
      }
    },
    {
      name: 'innerNavView_',
      hidden: true,
      factory: function() {
        var viewScale$ = this.slot(function(navSize, width, view$width, height, view$height) {
          return navSize * Math.min(width / view$width, height / view$height);
        });
        var v = this.CView.create({
          width$: this.view$.dot('width'),
          height$: this.view$.dot('height'),
          scaleX$: viewScale$,
          scaleY$: viewScale$,
        });
        v.add(this.view);
        return v;
      }
    },
    {
      name: 'scaledView_',
      hidden: true,
      factory: function() {
        var v = this.Box.create({
          clip: true,
          height$: this.view$.dot('height'),
          width$: this.view$.dot('width'),
          scaleX$: this.scale$,
          scaleY$: this.scale$,
          x$: this.slot(function(scale, viewPortView_$x, navView_$width, view$width) {
            return - scale * view$width * viewPortView_$x / navView_$width;
          }),
          y$: this.slot(function(scale, viewPortView_$y, navView_$height, view$height) {
            return - scale * view$height * viewPortView_$y / navView_$height;
          }),
        });
        v.add(this.view);
        return v;
      }
    }
  ],
  methods: [
    function initCView() {
      this.SUPER();
      this.add(this.scaledView_);
      this.add(this.navView_);
      this.add(this.navViewHandle_);

      this.attachViewPortListener();
      this.attachHandleListener();
    },
    function attachViewPortListener() {
      var drag = false;
      var moveViewPort = e => {
        if ( ! drag ) return;
        this.viewPortPosition = {
          x: e.offsetX - this.navView_.x - this.viewPortView_.width / 2,
          y: e.offsetY - this.navView_.y - this.viewPortView_.height / 2,
        };
      };
      this.onDetach(this.canvas.on('mousedown', e => {
        drag = this.innerNavView_.hitTest({
            x: (e.offsetX - this.navView_.x) / this.innerNavView_.scaleX,
            y: (e.offsetY - this.navView_.y) / this.innerNavView_.scaleY,
        });
        moveViewPort(e);
      }));
      this.onDetach(this.canvas.on('mouseup', _ => drag = false));
      this.onDetach(this.canvas.on('mousemove', moveViewPort));
    },
    function attachHandleListener() {
      var drag = null;
      var moveNavView_ = e => {
        if ( ! drag ) return;
        this.navView_.x = Math.max(
          this.navBorderWidth / 2,
          Math.min(e.offsetX - drag.x, this.width - this.navView_.width)
        );
        this.navView_.y = Math.max(
          this.handleHeight + this.navBorderWidth / 2,
          Math.min(e.offsetY - drag.y + this.handleHeight, this.height - this.navView_.height)
        );
      };
      this.onDetach(this.canvas.on('mousedown', e => {
        var p = {
          x: e.offsetX - this.navViewHandle_.x,
          y: e.offsetY - this.navViewHandle_.y,
        };
        drag = this.navViewHandle_.hitTest(p) ? p : null;
        moveNavView_(e);
      }));
      this.onDetach(this.canvas.on('mouseup', _ => drag = null));
      this.onDetach(this.canvas.on('mousemove', moveNavView_));
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