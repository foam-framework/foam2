/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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
  package: 'com.google.flow',
  name: 'FLOW',
  extends: 'foam.u2.Element',

  implements: [
    'foam.mlang.Expressions',
    'foam.memento.MementoMgr'
  ],

  requires: [
    'com.google.flow.Property',
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
      body { overflow: hidden }
      ^ { display: flex; }
      ^ > * { padding-left: 16px; padding-right: 16px; }
      ^tools, ^properties, ^sheet { box-shadow: 3px 3px 6px 0 gray; height: 100%; }
      ^sheet { width: 100%; overflow-y: auto; }
      ^tools thead, ^properties thead { display: none }
      ^tools tr { height: 30px }
      .foam-u2-TableView { border-collapse: collapse; }
      .foam-u2-TableView td { padding-left: 6px; }
      .foam-u2-TableView-selected { outline: 1px solid red; }
      ^ canvas { border: none; }
      ^ .foam-u2-ActionView { margin: 10px; }
      ^properties .foam-u2-ActionView, ^properties .foam-u2-ActionView:hover { background: white; padding: 0; padding-left: 18px; margin: 2px; border: none; }
      .foam-u2-Tabs { padding-top: 0 !important; }
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
          daoType: 'ARRAY'
        });
        dao.put(com.google.flow.Box.model_);
        dao.put(com.google.flow.Circle.model_);
        dao.put(com.google.flow.Text.model_);
        dao.put(com.google.flow.Clock.model_);
        dao.put(com.google.flow.Mushroom.model_);
        dao.put(com.google.foam.demos.robot.Robot.model_);
        dao.put(foam.audio.Speak.model_);
        dao.put(foam.audio.Beep.model_);
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
          com.google.flow.Property.NAME,
          com.google.flow.Property.DELETE_ROW
        ]
      },
      factory: function() {
        var dao = foam.dao.EasyDAO.create({
          of: 'com.google.flow.Property',
          guid: true,
          seqProperty: this.Property.NAME,
//          daoType: 'MDAO'
          daoType: 'ARRAY'
        });

        var p = this.Property.create({name: 'canvas1', value: this.canvas});
        this.physics.setPrivate_('lpp_', p);
        dao.put(p);

        p = this.Property.create({name: 'physics', value: this.physics});
        this.physics.setPrivate_('lpp_', p);
        dao.put(p);

        return dao;
      }
    },
    {
      name: 'canvas',
      factory: function() {
        return this.Box.create({autoRepaint: true, width: 600, height: 600, color: '#f3f3f3'});
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
          start('div').
            cssClass(this.myCls('tools')).
            start(this.TOOLS, {selection$: this.currentTool$}).end().
          end().
          start('center').
            start(foam.u2.Tabs).
              start(foam.u2.Tab, {label: 'canvas1'}).
                start(this.canvas).
                  on('click',       this.onClick).
                  on('contextmenu', this.onRightClick).
                end().
              end().
              start(foam.u2.Tab, {label: '+'}).
              end().
            end().
            start(this.BACK,  {label: 'Undo'}).end().
            start(this.FORTH, {label: 'Redo'}).end().
          end().
          start('div').
            cssClass(this.myCls('properties')).
            start(this.PROPERTIES, {selection$: this.selected$}).end().
          end().
          start(this.VALUE).cssClass(this.myCls('sheet')).end();

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
