/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'RadioCircle',
  extends: 'foam.graphics.Circle',

  requires: [
    'foam.graphics.Circle'
  ],

  properties: [
    [ 'color',       null ],
    [ 'border',      'blue' ],
    [ 'radius',      12 ],
    [ 'width',       26 ],
    [ 'height',      26 ],
    [ 'x',           13.5 ],
    [ 'y',           13.5 ],
    [ 'arcWidth',    1.5 ],
    [ 'autoRepaint', true ],
    [ 'selected',    true ],
    {
      name: 'indicator',
      factory: function() {
        return this.Circle.create({
          radius: 5,
          color: 'blue',
          border: null,
          x: 0,
          y: 0,
          autoRepaint: true
        });
      }
    }
  ],

  methods: [
    function init() {
      this.add(this.indicator);

    },
    function toggle() {
      this.selected = ! this.selected;
      this.animate();
    }
  ],

  listeners: [
    {
      name: 'animate',
      isFramed: true,
      code: function animate() {
        if ( this.selected ) {
          if ( this.indicator.radius >= 5 ) return;
          this.indicator.radius += 0.5;
        } else {
          if ( this.indicator.radius <= 0 ) return;
          this.indicator.radius -= 0.5;
        }
        this.animate();
      }
    }
  ]
});
