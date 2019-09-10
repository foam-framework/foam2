/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.demos.graphics',
  name: 'ZoomMapViewDemo',
  extends: 'foam.u2.Element',
  requires: [
    'foam.graphics.CView',
    'foam.graphics.ZoomMapView',
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
      for ( var i = 0 ; i < 100; i++ ) {
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

      var cview = this.ZoomMapView.create({
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