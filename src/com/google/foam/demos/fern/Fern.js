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
        [ 'depth', 1 ],
        [ 'alpha', 0.8 ],
        [ 'radius', 1.2 ],
        [ 'color', 'green' ],
        [ 'border', null ]
      ],
      methods: [
        function initCView() {
          if ( this.depth < 10 ) this.timer.time$.sub(this.onTick);
        }
      ],
      listeners: [
        function onTick() {
          this.age++;
          this.rotation -= 0.0001;
          if ( this.age === 60 ) {
            this.add(this.cls_.create({depth: this.depth+1, x: 0, y: -2, scaleX: 0.8, scaleY: 0.8, xxxrotation: -Math.PI/20}, this.__context__));
          }
          if ( this.age === 100 ) {
            this.add(this.cls_.create({depth: this.depth+1.5, x: -1.5, y: 0, scaleX: 0.5, scaleY: 0.5, rotation:  Math.PI/2}, this.__context__));
            this.add(this.cls_.create({depth: this.depth+1.5, x: +1.5, y: 0, scaleX: 0.5, scaleY: 0.5, rotation: -Math.PI/2}, this.__context__));
          }
        }
      ]
    }
  ],

  properties: [
    [ 'width', 1000 ],
    [ 'height', 800 ],
    [ 'color', 'white' ],
    { class: 'Int', name: 'time' },
    'root'
  ],

  methods: [
    function initCView() {
      this.add(this.root = this.Leaf.create({x: this.width/2, y: this.height-200}));
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
