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
  name: 'Property',
  ids: [ 'name' ],
  properties: [
    {
      class: 'String',
      name: 'name'
    },
    [ 'value',  0 ]
  ],
  actions: [
    {
      name: 'deleteRow',
      label: 'X',
      code: function deleteRow() {
        debugger;
      }
    }
  ]
});


foam.CLASS({
  package: 'com.google.livepaint',
  name: 'Clock',
  extends: 'com.google.foam.demos.clock.Clock',
  implements: [ 'foam.physics.Physical' ],
  properties: [
    [ 'mass',  0 ],
    [ 'radius', 45 ]
  ]
});


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
    [ 'color', '#000000' ],
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
    'com.google.livepaint.Property',
    'foam.dao.EasyDAO',
    'foam.graphics.Box',
    'foam.graphics.CView',
    'foam.graphics.Circle',
    'foam.physics.Physical',
    'foam.physics.PhysicsEngine',
    'foam.u2.PopupView',
    'foam.u2.TableView'
  ],

  exports: [ 'as data' ],

  constants: {
    SELECTED_COLOR:   '#dddddd',
    UNSELECTED_COLOR: '#ffffff'
  },

  axioms: [
    foam.u2.CSS.create({
      code: function() {/*
      ^ { display: flex; }
      ^ > * { padding: 16px; }
      .foam-u2-TableView-selected { background: lightgray; }
      ^ canvas { border: 1px solid black; }
      ^ .foam-u2-ActionView { margin: 10px; }
      ^properties .foam-u2-ActionView { background: white; padding: 0; margin: 2px; border: none; }
      */}
    })
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
        dao.put(com.google.foam.demos.robot.Robot.model_);
        dao.put(com.google.livepaint.Clock.model_);
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
        if ( n ) { n.shadowBlur = 10; n.shadowColor = '#ff0000'; }
      }
    },
    {
      name: 'properties',
      view: {
        class: 'foam.u2.TableView',
        columns: [
          com.google.livepaint.Property.NAME,
          com.google.livepaint.Property.DELETE_ROW
        ]
      },
      factory: function() {
        var dao = foam.dao.EasyDAO.create({
          of: 'com.google.livepaint.Property',
          guid: true,
          seqProperty: this.Property.NAME,
//          daoType: 'MDAO'
          daoType: 'ARRAY'
        });
        dao.put(this.Property.create({name: 'physics', value: this.physics}));
        return dao;
      }
    },
    {
      name: 'canvas',
      factory: function() {
        return this.Box.create({autoRepaint: true, width: 600, height: 500, color: '#f3f3f3'});
      }
    },
  ],

  methods: [

    function initE() {
      this.properties.on.put.sub(this.onPropertyPut);

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
          start('div').
            cssClass(this.myCls('properties')).
            add(this.PROPERTIES).
          end().
          add(this.SELECTED);

      this.physics.start();
    },

    function addProperty(value, opt_name, opt_i) {
      var self = this;
      if ( ! opt_name ) {
        var i = opt_i || 1;
        var prefix = value.cls_.name.toLowerCase();
        this.properties.find(prefix + i).then(function (o) {
          if ( ! o ) {
            self.addProperty(value, prefix + i);
          } else {
            self.addProperty(value, null, i+1);
          }
        }).catch(function(x) {
          self.addProperty(value, prefix+i);
        });
      } else {
        this.properties.put(this.Property.create({
          name: opt_name,
          value: value
        }));
      }
    },

    /*
    function addCircle(x, y, opt_r) {
      var c = this.Circle.create({
        x: x,
        y: y,
        radius: opt_r || 25,
        color: this.UNSELECTED_COLOR,
        border: '#000'});

      this.canvas.addChildren(c);

      return c;
    },
    */

    function updateMemento() {
      this.feedback_ = true;
      this.memento = this.canvas.children.map(function(c) {
        return {x: c.x, y: c.y, radius: c.radius};
      });
      this.feedback_ = false;
    }
  ],

  actions: [
    {
      name: 'deleteProperty',
      label: 'X',
      code: function() {
        debugger;
      }
    }
  ],

  listeners: [
    function onPropertyPut(_, _, _, p) {
      var o = p.value;
      if ( this.CView.isInstance(o) ) {
        this.canvas.add(o);

        if ( this.Physical.isInstance(o) ) {
          this.physics.add(o);
        }
      }
    },

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
        this.addProperty(o);
        this.selected = o;
        this.updateMemento();
      }
    },

    function onRightClick(evt) {
      evt.preventDefault();

      if ( ! this.selected ) return;
    }
  ]
});
