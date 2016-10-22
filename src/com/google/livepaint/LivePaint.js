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
      code: function deleteRow(X) {
        X.properties.remove(X.data);
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
    [ 'gravity', 1 ],
    [ 'radius', 45 ],
    [ 'width', 90 ],
    [ 'height', 90 ]
  ]
});


foam.CLASS({
  package: 'com.google.livepaint',
  name: 'Text',
  extends: 'foam.graphics.Label',
  implements: [ 'foam.physics.Physical' ],
  properties: [
    // [ 'mass',  0 ],
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
    [ 'gravity', 1 ],
    [ 'radius',  25 ]
  ]
});


foam.CLASS({
  package: 'com.google.livepaint',
  name: 'Box',
  extends: 'foam.graphics.Box',
  implements: [ 'foam.physics.Physical' ],
  properties: [
    // [ 'mass',  0 ],
    [ 'width',  50 ],
    [ 'height', 50 ]
  ]
});


foam.CLASS({
  package: 'com.google.livepaint',
  name: 'LivePaint',
  extends: 'foam.u2.Element',

  implements: [
    'foam.mlang.Expressions',
    'foam.memento.MementoMgr'
  ],

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

  exports: [
    'as data',
    'properties'
  ],

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
        return this.PhysicsEngine.create({
          enableGravity: false,
          bounceOnWalls: true,
          bounds: this.canvas
        });
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
        dao.put(foam.audio.Speak.model_);
        dao.put(foam.audio.Beep.model_);
        dao.put(com.google.livepaint.Mushroom.model_);
        dao.put(com.google.foam.demos.robot.Robot.model_);
        dao.put(com.google.livepaint.Clock.model_);
        dao.put(com.google.livepaint.Circle.model_);
        dao.put(com.google.livepaint.Box.model_);
        dao.put(com.google.livepaint.Text.model_);
        return dao;
      }
    },
    {
      name: 'value',
      view: { class: 'foam.u2.DetailView', showActions: true }
    },
    {
      name: 'selected',
      postSet: function(o, n) {
        this.value = n && n.value;
        // TODO: check and only set if a CView
        if ( o ) { o.value.shadowBlur = 0; }
        if ( n ) { n.value.shadowBlur = 10; n.value.shadowColor = '#ff0000'; }
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
        var p = this.Property.create({name: 'physics', value: this.physics});
        this.physics.setPrivate_('lpp_', p);
        dao.put(p);
        return dao;
      }
    },
    {
      name: 'canvas',
      factory: function() {
        return this.Box.create({autoRepaint: true, width: 700, height: 700, color: '#f3f3f3'});
      }
    },
  ],

  methods: [

    function initE() {
      this.properties.on.put.sub(this.onPropertyPut);
      this.properties.on.remove.sub(this.onPropertyRemove);

      this.memento$.sub(function() {
        var m = this.memento;
        if ( this.feedback_ ) return;
        this.properties.removeAll();
        if ( m ) {
          for ( var i = 0 ; i < m.length ; i++ ) {
            var c = m[i];
            this.properties.put(c);
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
          start(this.PROPERTIES, {selection$: this.selected$}).end().
          end().
          add(this.VALUE);

      // this.physics.start();
    },

    function addProperty(value, opt_name, opt_i) {
      var self = this;
      if ( ! opt_name ) {
        var i = opt_i || 1;
        var prefix = value.cls_.name.toLowerCase();
        this.properties.find(prefix + i).then(function (o) {
          self.addProperty(value, null, i+1);
        }).catch(function(x) {
          self.addProperty(value, prefix+i);
        });
      } else {
        var p = this.Property.create({
          name: opt_name,
          value: value
        });
//        value.gravity = 1;
        value.setPrivate_('lpp_', p);
        this.properties.put(p);
        this.selected = p;
      }
    },

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
      code: function(X) {
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

    function onPropertyRemove(_, _, _, p) {
      var o = p.value;
      if ( this.CView.isInstance(o) ) {
        this.canvas.remove(o);

        if ( this.Physical.isInstance(o) ) {
          this.physics.remove(o);
        }
      }
    },

    function onClick(evt) {
      var x = evt.offsetX, y = evt.offsetY;
      var c = this.canvas.findFirstChildAt(x, y);

      if ( c ) {
        var p = c.getPrivate_('lpp_');
        this.selected = p;
      } else {
        var tool = this.currentTool;
        if ( ! tool ) return;
        var cls = this.lookup(tool.id);
        var o = cls.create({x: x, y: y});
        var p = this.addProperty(o);
        this.updateMemento();
      }
    },

    function onRightClick(evt) {
      evt.preventDefault();

      if ( ! this.selected ) return;
    }
  ]
});
