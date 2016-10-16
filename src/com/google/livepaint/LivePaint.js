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
  package: 'com.google.livepaint',
  name: 'Text',
  extends: 'foam.graphics.Label',
  implements: [ 'foam.physics.Physical' ],
  properties: [
    {
      class: 'String',
      name: 'name'
    },
    [ 'mass',  0 ],
    [ 'width',  100 ],
    [ 'height', 50 ],
    [ 'text', 'Text' ],
    [ 'color', 'black' ],
    [ 'font', '50px Arial' ]
  ]
});

foam.CLASS({
  package: 'com.google.livepaint',
  name: 'Circle',
  extends: 'foam.graphics.Circle',
  implements: [ 'foam.physics.Physical' ],
  properties: [
    {
      class: 'String',
      name: 'name'
    },
    [ 'mass',  0 ],
    [ 'radius', 25 ]
  ]
});

foam.CLASS({
  package: 'com.google.livepaint',
  name: 'Box',
  extends: 'foam.graphics.Box',
  implements: [ 'foam.physics.Physical' ],
  properties: [
    {
      class: 'String',
      name: 'name'
    },
    [ 'mass',  0 ],
    [ 'width',  50 ],
    [ 'height', 50 ]
  ]
});


foam.CLASS({
  package: 'com.google.livepaint',
  name: 'LivePaint',
  extends: 'foam.u2.Element',

  implements: [ 'foam.memento.MementoMgr' ],

  requires: [
    'foam.dao.EasyDAO',
    'foam.graphics.Box',
    'foam.graphics.Circle',
    'foam.physics.PhysicsEngine',
    'foam.u2.PopupView',
    'foam.u2.TableView'
  ],

  exports: [ 'as data' ],

  constants: {
    SELECTED_COLOR:   '#ddd',
    UNSELECTED_COLOR: 'white'
  },

  axioms: [
    // TODO: remove '-' after ActionView when CSS naming fixed
    foam.u2.CSS.create({
      code: function() {/*
      ^ { display: flex; }
      ^ > * { padding: 16px; }
      .foam-u2-TableView-selected { background: lightgray; }
      ^ canvas { border: 1px solid black; }
      ^ .foam-u2-ActionView { margin: 10px; }
      */}
    })
  ],

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
              cssClass(this.myCls()).
              add('Adjust the diameter of the circle at (', this.data.x$, ', ', this.data.y$, ').').
              tag('br').
              add(this.RangeView.create({data$: this.data.radius$, maxValue: 200, onKey: true}));
        }
      ]
    }
  ],

  properties: [
    {
      name: 'physics',
      factory: function() {
        return this.PhysicsEngine.create();
      }
    },
    'feedback_',
    'currentTool',
    {
      class: 'foam.dao.DAOProperty',
      name: 'tools',
      view: {
        class: 'foam.u2.TableView',
        columns: [ foam.core.Model.NAME ]
      },
      factory: function() {
        var dao = foam.dao.EasyDAO.create({
          of: 'foam.core.Model',
          daoType: 'MDAO'
        });
        dao.put(com.google.livepaint.Circle.model_);
        dao.put(com.google.livepaint.Box.model_);
        dao.put(com.google.livepaint.Text.model_);
        return dao;
      }
    },
    {
      name: 'selected',
      view: { class: 'foam.u2.DetailView' },
      postSet: function(o, n) {
        if ( o ) { o.shadowBlur = 0; }
        if ( n ) { n.shadowBlur = 10; n.shadowColor = 'red'; }
      }
    },
    {
      name: 'canvas',
      factory: function() {
        return this.Box.create({width: 600, height: 500, color: '#f3f3f3'});
      }
    },
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
          cssClass(this.myCls()).
          start(this.TOOLS, {selection$: this.currentTool$}).end().
          start('center').
            start(this.BACK,  {label: 'Undo'}).end().
            start(this.FORTH, {label: 'Redo'}).end().
            tag('br').
            start(this.canvas).
              on('click',       this.onClick).
              on('contextmenu', this.onRightClick).
            end().
          end().
          add(this.SELECTED);

      this.physics.start();
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

      if ( c ) {
        this.selected = c;
      } else {
        var tool = this.currentTool;
        if ( ! tool ) return;
        var cls = this.lookup(tool.id);
        var o = cls.create({x: x, y: y});
        this.canvas.addChildren(o);
        this.physics.add(o);
        this.selected = o;
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
