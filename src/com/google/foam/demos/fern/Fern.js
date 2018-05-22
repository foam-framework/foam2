/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.google.foam.demos.fern',
  name: 'Fern',
  extends: 'foam.graphics.Box',
  exports:  [ 'as timer' ],

  classes: [
    {
      name: 'Leaf',
      extends: 'foam.graphics.Circle',
      imports: [ 'timer' ],
      properties: [
        { class: 'Int', name: 'age' },
        [ 'radius', 1 ],
        [ 'color', 'green' ],
        [ 'border', 'green' ]
      ],
      methods: [
        function initCView() {
          this.timer.time$.sub(this.onTick);
        },
      ],
      listeners: [
        function onTick() {
          this.age++;
          if ( this.age === 97 ) {
            this.add(this.cls_.create({x: 0, y: -2, scaleX: 0.8, scaleY: 0.8, rotation: -Math.PI/20}, this.__context__));
          }
          if ( this.age === 293 ) {
            this.add(this.cls_.create({x: -2, y: 0, scaleX: 0.5, scaleY: 0.5, rotation:  Math.PI/2}, this.__context__));
            this.add(this.cls_.create({x: +2, y: 0, scaleX: 0.5, scaleY: 0.5, rotation: -Math.PI/2}, this.__context__));
          }
        }
      ]
    }
  ],

  properties: [
    [ 'width', 550 ],
    [ 'height', 300 ],
    [ 'color', 'black' ],
    [ 'autorepaint' , true ],
    { class: 'Int', name: 'time' },
    'root'
  ],

  methods: [
    function initCView() {
      this.add(this.root = this.Leaf.create({x: this.width/2, y: this.height-100}));
      this.tick();
    }
  ],

  listeners: [
    {
      name: 'tick',
      isFramed: true,
      code: function() {
        this.root.scaleX *= 1.002;
        this.root.scaleY *= 1.002;
        this.time++;
        this.tick();
        this.invalidated.pub();
      }
    }
  ]
});
