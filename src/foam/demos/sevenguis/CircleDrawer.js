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
  package: 'foam.demos.sevenguis',
  name: 'CircleDrawer',
  extends: 'foam.u2.Element',

  implements: [ 'foam.memento.MementoMgr' ],

  requires: [
    'foam.graphics.Circle',
    'foam.graphics.Box',
    'foam.u2.PopupView'
  ],

  exports: [ 'as data' ],

  constants: {
    SELECTED_COLOR:   '#ddd',
    UNSELECTED_COLOR: 'white'
  },

  // TODO: remove '-' after ActionView when CSS naming fixed
  css: `
    ^ { width:600px; margin: 20px; }
    ^ canvas { border: 1px solid black; margin-top: 10px; }
    ^ .foam-u2-ActionView- { margin: 10px; }
    ^ input[type='range'] { width: 400px; }
  `,

  classes: [
    {
      name: 'DiameterDialog',
      extends: 'foam.u2.View',

      requires: [
        'foam.graphics.Circle',
        'foam.u2.RangeView'
      ],

      methods: [
        function initE() {
          this.nodeName = 'span';
          this.
            addClass(this.myClass()).
            add('Adjust the diameter of the circle at (', this.data.x$, ', ', this.data.y$, ').').
            tag('br').
            add(this.RangeView.create({data$: this.data.radius$, maxValue: 200, onKey: true}));
        }
      ]
    }
  ],

  properties: [
    'feedback_',
    {
      name: 'selected',
      postSet: function(o, n) {
        if ( o ) o.color = this.UNSELECTED_COLOR;
        if ( n ) n.color = this.SELECTED_COLOR;
      }
    },
    {
      name: 'canvas',
      factory: function() {
        return this.Box.create({width: 600, height: 500, color: '#f3f3f3'});
      }
    }
  ],

  methods: [
    function initE() {
      this.memento$.sub(function() {
        var m = this.memento;
        if ( this.feedback_ ) return;
        this.canvas.children = [];
        if ( m ) {
          for ( var i = 0 ; i < m.length ; i++ ) {
            var c = m[i];
            this.addCircle(c.x, c.y, c.radius);
          }
        }
        this.selected = null;
      }.bind(this));

      this.
        addClass(this.myClass()).
        start('center').
          start(this.BACK,  {label: 'Undo'}).end().
          start(this.FORTH, {label: 'Redo'}).end().
          tag('br').
          start(this.canvas).
            on('click',       this.onClick).
            on('contextmenu', this.onRightClick).
          end().
        end();
    },

    function addCircle(x, y, opt_r) {
      var c = this.Circle.create({
        x: x,
        y: y,
        radius: opt_r || 25,
        color: this.UNSELECTED_COLOR,
        border: 'black'});

      this.canvas.addChildren(c);

      return c;
    },

    function updateMemento() {
      this.feedback_ = true;
      this.memento = this.canvas.children.map(function(c) {
        return {x: c.x, y: c.y, radius: c.radius};
      });
      this.feedback_ = false;
    }
  ],

  listeners: [
    function onClick(evt) {
      var x = evt.offsetX, y = evt.offsetY;
      var c = this.canvas.findFirstChildAt(x, y);

      if ( c && c !== this.canvas ) {
        this.selected = c;
      } else {
        this.selected = this.addCircle(x, y);
        this.updateMemento();
      }
    },

    function onRightClick(evt) {
      evt.preventDefault();

      if ( ! this.selected ) return;

      var p = this.PopupView.create({
        width: 450,
        height: 110
      }).add(this.DiameterDialog.create({data: this.selected}));

      this.add(p);

      // If the size is changed with the dialog, then create an updated memento
      var oldRadius = this.selected.radius;
      p.onunload.sub(function() {
        if ( this.selected.radius !== oldRadius ) this.updateMemento();
      }.bind(this));
    }
  ]
});
