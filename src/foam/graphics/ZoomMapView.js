/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.graphics',
  name: 'ZoomMapView',
  extends: 'foam.graphics.CView',
  requires: [
    'foam.graphics.Box',
    'foam.graphics.CView',
    'foam.graphics.Circle'
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
      visibility: 'RO',
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
      value: 0.2,
      postSet: function(o, n) {
        this.viewPortPosition = {
          x: this.viewPortPosition.x * (n / o),
          y: this.viewPortPosition.y * (n / o),
        }
      }
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
      class: 'Float',
      name: 'navScalerSize',
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
      name: 'navScaler_',
      hidden: true,
      factory: function() {
        return this.CView.create({
          height$: this.navScalerSize$,
          width$: this.navScalerSize$,
          x$: this.slot(function(navScalerSize, navView_$x, navView_$width, navBorderWidth) {
            return navView_$x + navView_$width + navBorderWidth / 2 - navScalerSize / 2;
          }),
          y$: this.slot(function(navScalerSize, navView_$y, navView_$height, navBorderWidth) {
            return navView_$y + navView_$height + navBorderWidth / 2 - navScalerSize / 2;
          }),
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
      this.add(this.navScaler_);

      // Ensure the parent of view is scaledView_ to ensure that its
      // globalToLocalCoordinates uses that as the parent rather than the
      // navView_
      this.view.parent = this.scaledView_;

      this.attachViewPortListener();
      this.attachHandleListener();
      this.attachNavScalerListener();
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
        drag = this.innerNavView_.hitTest(this.innerNavView_.globalToLocalCoordinates({
          w: 1,
          x: e.offsetX,
          y: e.offsetY
        }));
        moveViewPort(e);
      }));
      this.onDetach(this.canvas.on('mouseup', _ => drag = false));
      this.onDetach(this.canvas.on('mousemove', moveViewPort));
    },
    function attachNavScalerListener() {
      var drag = null;
      var doHitTest = e => {
        return this.navScaler_.hitTest(this.navScaler_.globalToLocalCoordinates({
          w: 1,
          x: e.offsetX,
          y: e.offsetY
        }));
      };
      var scaleNavView = e => {
        if ( ! drag ) return;
        var desiredWidth = drag.width + e.offsetX - drag.x;
        var desiredHeight = drag.height + e.offsetY - drag.y;
        this.navSize = Math.max(
          drag.navSize * desiredWidth / drag.width,
          drag.navSize * desiredHeight / drag.height
        );
      };
      this.onDetach(this.canvas.on('mousedown', e => {
        var p = {
          x: e.offsetX - this.navScaler_.x,
          y: e.offsetY - this.navScaler_.y,
        };
        drag = doHitTest(e) ? {
          x: e.offsetX,
          y: e.offsetY,
          width: this.navView_.width,
          height: this.navView_.height,
          navSize: this.navSize
        } : null;
        scaleNavView(e);
      }));
      this.onDetach(this.canvas.on('mouseup', _ => drag = null));
      this.onDetach(this.canvas.on('mousemove', e => {
        if ( drag || doHitTest(e) ) {
          this.canvas.style({cursor: 'se-resize'})
        }
        scaleNavView(e);
      }));
    },
    function attachHandleListener() {
      var drag = null;
      var doHitTest = e => {
        var p = this.navViewHandle_.globalToLocalCoordinates({
          w: 1,
          x: e.offsetX,
          y: e.offsetY
        });
        return this.navViewHandle_.hitTest(p) ? p : null;
      };
      var moveNavView = e => {
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
        drag = doHitTest(e);
        moveNavView(e);
      }));
      this.onDetach(this.canvas.on('mouseup', _ => drag = null));
      this.onDetach(this.canvas.on('mousemove', e => {
        if ( drag || doHitTest(e) ) {
          this.canvas.style({cursor: 'move'})
        } else {
          this.canvas.style({cursor: 'default'})
        }
        moveNavView(e);
      }));
    }
  ]
});
