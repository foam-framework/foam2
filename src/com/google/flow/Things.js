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
      this.width = this.desk.width + this.cabinet.width;
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
  extends: 'foam.graphics.CView',

  properties: [
    {
      name: 'of',
      value: com.google.flow.DuplexDesk,
      hidden: true
    },
    { name: 'cellWidth',  hidden: true },
    { name: 'cellHeight', hidden: true },
    [ 'rows',    1 ],
    [ 'columns', 4 ]
  ],

  methods: [
    function init() {
      this.SUPER();

      var o = this.of.create();
      this.cellWidth  = o.width;
      this.cellHeight = o.height;

      this.width  = o.width * 4;
      this.height = o.height * 1;

      this.onResize();
      this.propertyChange.sub('width', this.onResize);
      this.propertyChange.sub('height', this.onResize);
    }
  ],

  listeners: [
    {
      name: 'onResize',
      isFramed: true,
      code: function() {
        this.removeAllChildren();

        var w = this.cellWidth, h = this.cellHeight;

        this.rows    = Math.max(this.rows, Math.floor(this.height / h));
        this.columns = Math.max(this.rows, Math.floor(this.width / w));
        // this.width   = Math.max(this.width,  this.columns * w);
        // this.height  = Math.max(this.height, this.rows    * h);

        for ( var i = 0 ; i < this.rows ; i++ ) {
          for ( var j = 0 ; j < this.columns ; j++ ) {
            var o = this.of.create();
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
    [ 'width', 20 ],
    [ 'height', 35 ],
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

// foam.json.stringify(flow.memento.map(function(o) { var v = o.value; var r = {name: o.name, factory: 'function() { return ' + v.cls_.id + '.create(' + foam.json.stringify(v.instance_) + ')}'};  return r;})).replace(/\"/g,"'").replace(/\\/g,'');
