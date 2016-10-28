/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'com.google.flow',
  name: 'Clock',
  extends: 'com.google.foam.demos.clock.Clock',
  implements: [ 'foam.physics.Physical' ],
  properties: [
    [ 'gravity', 1 ],
    [ 'radius', 45 ],
    [ 'width', 90 ],
    [ 'height', 90 ]
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'Text',
  extends: 'foam.graphics.Label',
  implements: [ 'foam.physics.Physical' ],
  properties: [
    [ 'gravity', 1 ],
    [ 'width',  100 ],
    [ 'height', 50 ],
    [ 'text', 'Text' ],
    [ 'color', '#000000' ],
    [ 'font', '50px Arial' ]
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'Circle',
  extends: 'foam.graphics.Circle',
  implements: [ 'foam.physics.Physical' ],
  properties: [
    [ 'arcWidth', 1 ],
    [ 'gravity', 1 ],
    [ 'radius',  25 ]
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'Box',
  extends: 'foam.graphics.Box',
  implements: [ 'foam.physics.Physical' ],
  properties: [
    [ 'width',  50 ],
    [ 'height', 50 ]
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'Desk',
  extends: 'foam.graphics.CView',

  properties: [
    {
      name: 'desk',
      hidden: true,
      factory: function() { return foam.graphics.Box.create({x:0, y:0, width:28, height:14, color:'gray'}); }
    },
    {
      name: 'cabinet',
      hidden: true,
      factory: function() { return foam.graphics.Box.create({x:29, y:0, width:9, height:12, color: 'white'}); }
    },
    {
      name: 'person',
      hidden: true,
      factory: function() { return foam.graphics.Circle.create({x:14, y:21, radius:3, border: null, color:'blue'}); }
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.add(this.desk, this.person, this.cabinet);
      this.width  = this.desk.width + this.cabinet.width + 2;
      this.height = this.desk.height * 2.75;
    }
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'DuplexDesk',
  extends: 'foam.graphics.CView',

  requires: [ 'com.google.flow.Desk' ],

  properties: [
    {
      name: 'desk1',
      hidden: true,
      factory: function() { return this.Desk.create({}); }
    },
    {
      name: 'desk2',
      hidden: true,
      factory: function() { return this.Desk.create({}); }
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      this.desk1.y = this.desk2.y = this.desk1.height;
      this.desk1.scaleY = -1;
      this.width = this.desk1.width;
      this.height = this.desk1.height * 2;
      this.add(this.desk1, this.desk2);
    }
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'Desks',
  extends: 'foam.graphics.Box',

  properties: [
    {
      class: 'Class',
      name: 'of',
      value: 'com.google.flow.DuplexDesk'
//      hidden: true
    },
    {
      class: 'Boolean',
      name: 'feedback_',
      hidden: true
    },
    [ 'border', null ],
    { name: 'cellWidth',  hidden: true },
    { name: 'cellHeight', hidden: true },
    { class: 'Int', name: 'rows',    postSet: function(o, n) { if ( this.feedback_ ) return o; this.feedback_ = true; this.height  = this.cellHeight * n; this.feedback_ = false; return n;  } },
    { class: 'Int', name: 'columns', postSet: function(o, n) { if ( this.feedback_ ) return o; this.feedback_ = true; this.width   = this.cellWidth * n; this.feedback_ = false; return n;  } },
    { name: 'width',   postSet: function(o, n) { if ( this.feedback_ ) return o; this.feedback_ = true; this.columns = Math.floor(n/this.cellWidth); this.feedback_ = false; return n;  } },
    { name: 'height',  postSet: function(o, n) { if ( this.feedback_ ) return o; this.feedback_ = true; this.rows    = Math.floor(n/this.cellHeight); this.feedback_ = false; return n;  } }
  ],

  methods: [
    function init() {
      this.SUPER();

      this.updateCellSize();
      this.rows = this.columns = 2;

      this.onResize();
      this.propertyChange.sub('of',     this.onResize);
      this.propertyChange.sub('width',  this.onResize);
      this.propertyChange.sub('height', this.onResize);
    },

    function updateCellSize() {
      var o = this.of$cls.create();
      this.cellWidth  = o.width;
      this.cellHeight = o.height;
    }
  ],

  listeners: [
    {
      name: 'onResize',
      isFramed: true,
      code: function() {
        this.removeAllChildren();

        this.updateCellSize();
        this.width  = this.width;
        this.height = this.height;
        var w = this.cellWidth, h = this.cellHeight;

        for ( var i = 0 ; i < this.rows ; i++ ) {
          for ( var j = 0 ; j < this.columns ; j++ ) {
            var o = this.of$cls.create(null, this.__subContext__);
            o.x = w  * j;
            o.y = h * i;
            this.add(o);
          }
        }
      }
    }
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'Mushroom',
  extends: 'foam.graphics.Circle',

  implements: [ 'foam.physics.Physical' ],

  requires: [ 'foam.graphics.Box' ],

  properties: [
    [ 'mass', foam.physics.Physical.INFINITE_MASS ],
    [ 'border', null ],
    [ 'color', 'red' ],
    [ 'start',  Math.PI ],
    [ 'radius', 20 ],
    [ 'width', 42 ],
    [ 'height', 45 ],
    { name: 'stem', hidden: true/*, view: 'foam.u2.DetailView'*/ }
  ],

  methods: [
    function init() {
      this.SUPER();

      this.gravity = 0;

      this.add(this.stem = this.Box.create({
        x: -7.5,
        y: -0.5,
        width: 15,
        height: 20,
        color: 'gray',
        border: null
      }));
    }
  ],

  actions: [
    function explode() {
      this.stem.color = 'red';
      // Movement.animate(200, function() {
      //   this.scaleX = this.scaleY = 30;
      //   this.alpha = 0;
      //   this.a = Math.PI * 1.5;
      //   this.stem.alpha = 0;
      // }.bind(this)/*, function() { this.table.removeChild(o2); }.bind(this)*/)();
    }
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'Cursor',
  extends: 'foam.graphics.CView',

  properties: [
    {
      class: 'Float',
      name: 'lineWidth',
      view: { class: 'foam.u2.RangeView', minValue: 0, maxValue: 5, step: 1, onKey: true },
      value: 1
    },
    { name: 'width', value: 0, hidden: true },
    { name: 'height', value: 0, hidden: true },
    [ 'color', 'red' ],
    [ 'alpha', 0.5 ],
    {
      name: 'x'
    },
    {
      name: 'y'
    }
  ],

  methods: [
    function initCView() {
      this.SUPER();
      this.canvas.on('mousemove', this.onMouseMove);
    },

    function hitTest(p) { return false; },

    function paintSelf(x) {
      if ( ! this.color || ! this.lineWidth ) return;

      x.strokeStyle = this.color;
      x.lineWidth   = this.lineWidth;

      // Draw the lines longer than needed in case the
      // cursor is rotated.
      x.beginPath();
      x.moveTo(-this.parent.width*2, 0);
      x.lineTo(this.parent.width*2, 0);
      x.stroke();

      x.beginPath();
      x.moveTo(0, -this.parent.height*2);
      x.lineTo(0, this.parent.height*2);
      x.stroke();
    },
  ],

  listeners: [
    {
      name: 'onMouseMove',
//      isFramed: true,
      code: function(evt) {
        this.x = evt.offsetX;
        this.y = evt.offsetY;
      }
    }
  ]
});

// foam.json.stringify(flow.memento.map(function(o) { var v = o.value; var r = {name: o.name, factory: 'function() { return ' + v.cls_.id + '.create(' + foam.json.stringify(v.instance_) + ')}'};  return r;})).replace(/\"/g,"'").replace(/\\/g,'');
