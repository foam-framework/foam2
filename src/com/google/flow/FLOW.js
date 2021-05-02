/**
 * @license
 * Copyright 2016 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.google.flow',
  name: 'Canvas',
  extends: 'foam.graphics.Box',

  properties: [
    [ 'autoRepaint', true ],
    [ 'width', 800 ],
    [ 'height', 600 ],
    [ 'color', '#f3f3f3' ]
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'Select',
  documentation: 'Dummy Model to represent selection mode in FLOW.'
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'TreeView',
  extends: 'foam.u2.view.TreeView',

  methods: [
    function onObjDrop(obj, target) {
      // console.log('***************** target: ', o, target, target.value);
      // Adjust position of object so that it stays in its current
      // location. TODO: something better with transforms as this
      // probably doesn't work with scaling and rotation.
      var o      = obj.value;
      var parent = o.parent
      while ( parent ) {
        o.x -= parent.x;
        o.y -= parent.y;
        parent = parent.parent;
      }
    }
  ]
});


// TODO: Should have a GUID 'id' instead of name, since now
// you can't have two properties with the same name but
// different parents.
foam.CLASS({
  package: 'com.google.flow',
  name: 'Property',

  ids: [ 'name' ],

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      name: 'value',
      cloneProperty: function(o, m) {
        m[this.name ] = o.cls_.create({
          arcWidth:    o.arcWidth,
          border:      o.border,
          code:        o.code,
          color:       o.color,
          compressionStrength: o.compressionStrength,
          end:         o.end,
          friction:    o.friction,
          gravity:     o.gravity,
          head:        o.head,
          height:      o.height,
          length:      o.length,
          mass:        o.mass,
          name:        o.name,
          radius:      o.radius,
          radiusX:     o.radiusX,
          radiusY:     o.radiusY,
          springWidth: o.springWidth,
          start:       o.start,
          stretchStrength: o.stretchStrength,
          tail:        o.tail,
          text:        o.text,
          visible:     o.visible,
          width:       o.width,
          x:           o.x,
          y:           o.y
        }, o.__context__);
        m[this.name].instance_.reactions_ = o.reactions_;
      }
    }
  ],

  actions: [
    {
      name: 'deleteRow',
      label: 'X',
      code: function deleteRow(X) {
        X.properties.remove(X.data);
        X.updateMemento();
      }
    }
  ]
});


// TODO: make a FLOW be the root of the tree
foam.CLASS({
  package: 'com.google.flow',
  name: 'FLOW',

  ids: [ 'name' ],

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'description'
    },
    {
      class: 'FObjectArray',
      of: 'com.google.flow.Property',
      name: 'memento'
    }
  ]
});


foam.RELATIONSHIP({
  forwardName: 'children',
  inverseName: 'parent',
  cadinality: '1:*',
  sourceModel: 'com.google.flow.Property',
  targetModel: 'com.google.flow.Property',
  targetDAOKey: 'properties'
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'FLOWController',
  extends: 'foam.u2.Element',

  implements: [
    'foam.mlang.Expressions',
    'foam.memento.MementoMgr'
  ],

  requires: [
    'com.google.flow.Calc',
    'com.google.flow.Canvas',
    'com.google.flow.Circle',
    'com.google.flow.DetailPropertyView',
    'com.google.flow.Ellipse',
    'com.google.flow.FLOW',
    'com.google.flow.Halo',
    'com.google.flow.Property',
    'foam.dao.EasyDAO',
    'foam.demos.sevenguis.Cells',
    'foam.google.flow.TreeView',
    'foam.graphics.Box',
    'foam.graphics.CView',
    'foam.physics.Physical',
    'foam.physics.PhysicsEngine',
    'foam.u2.PopupView',
    'foam.u2.TableView',
    'foam.util.Timer'
//    'com.google.dxf.ui.DXFDiagram',
  ],

  exports: [
    'addProperty',
    'as data',
    'physics',
    'properties',
    'scope',
    'timer',
    'updateMemento'
  ],

  css: `
      body {
        overflow: hidden;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
        color: #444;
        }

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
      ^cmd { box-shadow: 3px 3px 6px 0 gray; width: 100%; margin-bottom: 8px; }
      ^properties .foam-u2-view-TreeViewRow { position: relative; }
      ^properties .foam-u2-ActionView, ^properties .foam-u2-ActionView:hover { background: white; padding: 0; position: absolute; right: 2px; border: none; margin: 2px 2px 0 0; }
      .foam-u2-Tabs { padding-top: 0 !important; margin-right: -8px; }
      input[type="range"] { width: 60px; height: 15px; }
      input[type="color"] { width: 60px; }
`,

  properties: [
    {
      name: 'scope',
      factory: function() {
        var self = this;
        return {
          repeat: function(n, fn) {
            for ( var i = 1 ; i <= n ; i++ ) fn.call(this, i);
            return this;
          },
          clear: function() {
            self.updateMemento().then(function() {
              self.properties.skip(4).removeAll();
            });
          },
          copy: function(obj, opt_n) {
            var n = opt_n || 1;
            for ( var i = 1 ; i <= n ; i++ ) {
              var m = {};
              com.google.flow.Property.VALUE.cloneProperty(obj, m);
              m.value.x += 30*i;
              m.value.y += 30*i;
              this.add(m.value);
            }
            return 'copied';
          },
          add: function(obj, opt_name, opt_parent) {
            this.addProperty(obj, opt_name, undefined, opt_parent || 'canvas1');
          }.bind(this),
          hsl: function(h, s, l) {
            return 'hsl(' + (h%360) + ',' + s + '%,' + l + '%)';
          },
          fib: (function() {
            var fib_ = foam.Function.memoize1(function(n) {
              if ( n < 1 ) return 0;
              if ( n < 3 ) return 1;
              return fib_(n-1) + fib_(n-2);
            });

            return function(i) {
              if ( i < 0 ) return 0;
              var floor = Math.floor(i);
              var frac  = i-floor;
              return fib_(floor) + frac * ( floor < 1 ? 1 : fib_(floor-1));
            };
          })(),
          hsla: function(h, s, l, a) {
            return 'hsla(' + (h%360) + ',' + s + '%,' + l + '%,' + a + ')';
          },
          log: function() {
            var o = this.cmdLineFeedback_;
            if ( ! o ) self.cmdLineFeedback_ = true;
            self.cmdLine += Array.from(arguments).join(' ') + '\n';
            if ( ! o ) self.cmdLineFeedback_ = false;
          },
          sin: Math.sin,
          cos: Math.cos,
          PI: Math.PI,
          degToRad: function(d) { return d * Math.PI / 180; },
          radToDeg: function(r) { return r * 180 / Math.PI; },
          load: this.loadFlow.bind(this),
          save: this.saveFlow.bind(this),
          dir: function() {
            // TODO: Better to allow commands to return promises and have
            // the cmdLinewait for them to finish
            var log = this.log;
            var first = true;
            self.flows.select({
              put: function(o) {
                if ( first ) {
                  first = false;
                  log('\n');
                }
                log(o.name);
              }
            }).then(function() { if ( ! first ) log('\nflow> '); });
          }
        };
      },
      documentation: 'Scope to run reactive formulas in.'
    },
    {
      name: 'physics',
      factory: function() {
        return this.PhysicsEngine.create({
          bounceOnWalls: true,
          bounds: this.canvas
        });
      }
    },
    {
      name: 'timer',
      factory: function() {
        return this.Timer.create();
      }
    },
    'feedback_',
    {
      name: 'currentTool',
      factory: function() {
        return com.google.flow.Select.model_;
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'tools',
      view: {
        class: 'foam.u2.TableView',
        columns: [ foam.core.Model.NAME ]
      },
      factory: function() {
        var dao = this.EasyDAO.create({
          of: 'foam.core.Model',
          daoType: 'ARRAY'
        });
        dao.put(com.google.flow.Select.model_);
        dao.put(com.google.flow.Line.model_);
        dao.put(com.google.flow.Box.model_);
        dao.put(com.google.flow.Circle.model_);
        dao.put(com.google.flow.Ellipse.model_);
        dao.put(com.google.flow.Text.model_);
        dao.put(com.google.flow.Clock.model_);
        dao.put(com.google.flow.Mushroom.model_);
        dao.put(com.google.flow.Turtle.model_);
        dao.put(com.google.flow.Turtle3D.model_);
        dao.put(foam.demos.robot.Robot.model_);
        dao.put(com.google.flow.Desk.model_);
        dao.put(com.google.flow.DuplexDesk.model_);
        dao.put(com.google.flow.Desks.model_);
        dao.put(com.google.flow.Gate.model_);
        dao.put(foam.audio.Speak.model_);
        dao.put(foam.audio.Beep.model_);
        dao.put(com.google.flow.Spring.model_);
        dao.put(com.google.flow.Strut.model_);
        dao.put(com.google.flow.Cursor.model_);
        dao.put(com.google.flow.Script.model_);
        dao.put(foam.core.Model.model_);
        // dao.put(com.google.dxf.ui.DXFDiagram.model_);
        return dao;
      }
    },
    {
      class: 'String',
      name: 'name',
      value: 'Untitled1'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'flows',
      factory: function() {
        return this.EasyDAO.create({
          of: com.google.flow.FLOW,
          cache: false,
          daoType: 'IDB'
        });
      }
    },
    {
      name: 'value',
      view: { class: 'com.google.flow.ReactiveDetailView', showActions: true }
//      view: { class: 'foam.u2.DetailView', showActions: true }
    },
    {
      name: 'selected',
      postSet: function(o, n) { this.value = n && n.value; }
    },
    {
      name: 'properties',
      view: function(args, x) {
        return {
          class: 'com.google.flow.TreeView',
          relationship: com.google.flow.PropertyPropertyChildrenRelationship,
          startExpanded: true,
          formatter: function() {
            var X = this.__subSubContext__;
            this.start('span').add(X.data.name).end().
              start('span').nbsp().style({ display: 'inline-block', width: '50px' }).end().
              start('span').add(com.google.flow.Property.DELETE_ROW).end();
          }
        };
      },
      factory: function() {
        var dao = this.EasyDAO.create({
          of: 'com.google.flow.Property',
          guid: true,
          seqProperty: this.Property.NAME,
          daoType: 'ARRAY'
        });

        var p;

        p = this.Property.create({name: 'canvas1', value: this.canvas});
        this.physics.setPrivate_('lpp_', p);
        dao.put(p);

        p = this.Property.create({name: 'sheet1', value: this.sheet});
        this.physics.setPrivate_('lpp_', p);
        dao.put(p);

        p = this.Property.create({name: 'timer', value: this.timer, parent: 'canvas1'});
        this.physics.setPrivate_('lpp_', p);
        dao.put(p);

        p = this.Property.create({name: 'physics', value: this.physics, parent: 'canvas1' });
        this.physics.setPrivate_('lpp_', p);
        dao.put(p);

        this.scope.canvas1 = this.canvas;
        var sheet = this.sheet;
        this.scope.sheet1  = function(cell) {
          return sheet.cell(cell.toUpperCase()).data;
        };
        this.scope.physics = this.physics;
        this.scope.timer   = this.timer;
        this.scope.cycle   = this.timer.cycle.bind(this.timer);

        return dao;
      }
    },
    {
      name: 'canvas',
      factory: function() { return this.Canvas.create(); }
    },
    {
      name: 'sheet',
      factory: function() {
        this.Cells.getAxiomsByClass(foam.core.Property).forEach(function(p) { p.hidden = true; });
        this.Cells.ROWS.hidden = this.Cells.COLUMNS.hidden = false;

        return this.Cells.create({rows: 28, columns:8}).style({width:'650px'});
      }
    },
    {
      name: 'calc',
      factory: function() {
        this.Calc.getAxiomsByClass(foam.core.Property).forEach(function(p) { p.hidden = true; });

        return this.Calc.create().style({width:'650px'});
      }
    },
    'mouseTarget',
    {
      name: 'position',
      view: { class: 'foam.u2.RangeView', onKey: true }
    },
    'cmdLineFeedback_',
    {
      class: 'String',
      name: 'cmdLine',
      value: 'flow> ',
      postSet: function(_, cmd) {
        if ( this.cmdLineFeedback_ ) return;
        this.cmdLineFeedback_ = true;

        try {
          var self = this;
          var i = cmd.lastIndexOf('flow> ');
          cmd = i === -1 ? cmd : cmd.substring(i+6);

          if ( ! cmd.trim() ) return;

          with ( this.scope ) {
            log();
            log(eval(cmd));
            this.cmdLine += 'flow> ';
          }
        } catch (x) {
          log('ERROR:', x);
        } finally {
          this.cmdLineFeedback_ = false;
        }
      },
      view: { class: 'foam.u2.tag.TextArea', rows: 3, cols: 80 }
    }
  ],

  methods: [
    function initE() {
      this.timer.start();

      this.properties.on.put.sub(this.onPropertyPut);
      this.properties.on.remove.sub(this.onPropertyRemove);

      var halo = this.Halo.create();
      var self = this;
      halo.selected$.linkFrom(this.selected$);

      this.memento$.sub(this.onMemento);

      this.
          addClass(this.myClass()).
          start('div').
            addClass(this.myClass('tools')).
            start(this.TOOLS, {selection$: this.currentTool$}).end().
          end().
          start('center').
            start(this.CMD_LINE).
              addClass(this.myClass('cmd')).
              // TODO: this should be a feature of TextArea
              on('keydown', function(evt) {
                if ( evt.keyCode === 13 ) {
                  self.cmdLine = evt.srcElement.value;
                  evt.preventDefault();
                  evt.srcElement.focus();
                  evt.srcElement.scrollTop = evt.srcElement.scrollHeight;
                  return false;
                }
              }).
            end().
//            tag('br').
            start(foam.u2.Tabs).
              start(foam.u2.Tab, {label: 'canvas1'}).
                start(this.canvas).
//                  on('click',       this.onClick).
                  on('mousedown',   this.onMouseDown).
                  on('mouseup',     this.onMouseUp).
                  on('mousemove',   this.onMouseMove).
                  on('contextmenu', this.onRightClick).
                end().
              end().
              start(foam.u2.Tab, {label: 'sheet1'}).
                start(this.sheet).
                end().
              end().
              start(foam.u2.Tab, {label: 'calc1'}).
                start(this.calc).
                end().
              end().
              start(foam.u2.Tab, {label: '+'}).
              end().
            end().
            start(this.POSITION, {maxValue: this.totalSize_$}).style({width: '50%'}).end().
            start(this.BACK,  {label: 'Undo'}).end().
            start(this.FORTH, {label: 'Redo'}).end().
          end().
          start('div').
            addClass(this.myClass('properties')).
            start(this.PROPERTIES, {selection$: this.selected$}).end().
          end().
          start(this.VALUE).
            addClass(this.myClass('sheet')).
            show(this.slot(function(selected) { return !!selected; })).
          end();
    },

    function addProperty(value, opt_name, opt_i, opt_parent) {
      var self = this;
      if ( ! opt_name ) {
        var i = opt_i || 1;
        var prefix = value.cls_.name.toLowerCase();
        this.properties.find(prefix + i).then(function (o) {
          if ( o == null )           self.addProperty(value, prefix+i, null, opt_parent);
          else self.addProperty(value, null, i+1, opt_parent);
        });
      } else {
        var p = this.Property.create({
          name: opt_name,
          value: value
        });
        if ( opt_parent ) p.parent = opt_parent;
        value.setPrivate_('lpp_', p);
        this.properties.put(p);
        this.selected = p;
      }
    },

    function updateMemento() {
      return this.properties.skip(4).select().then(function(s) {
        console.log('*************** updateMemento: ', s.array.length);
        this.feedback_ = true;
        this.memento = foam.Array.clone(s.array);
        this.feedback_ = false;
      }.bind(this));
    },

    function loadFlow(name) {
      foam.assert(name, 'Name required.')

      this.name = name;
      this.flows.find(name).then(function (f) {
        this.memento = f.memento;
      }.bind(this));
      return 'loading: ' + name;
    },

    function saveFlow(opt_name) {
      var name = opt_name || this.name;
      this.name = name;
      this.updateMemento().then(function() {
        this.flows.put(this.FLOW.create({
          name: name,
          memento: this.memento
        }));
      }.bind(this));
      return 'saving as: ' + name;
    }
  ],

  listeners: [
    function onPropertyPut(_, __, ___, p) {
      var o = p.value;

      this.scope[p.name] = p.value;
      if ( this.CView.isInstance(o) ) {
        if ( ! p.parent || p.parent === 'canvas1' ) {
          this.canvas.add(o);

          if ( this.Physical.isInstance(o) ) {
            this.physics.add(o);
          }
        } else {
          this.properties.find(p.parent).then(function(target) {
            target.value.add(o);
          });
        }
      }
    },

    function onPropertyRemove(_, __, p) {
      var o = p.value;

      delete this.scope[p.name];

      if ( p === this.selected ) this.selected = null;

      if ( this.CView.isInstance(o) ) {
        if ( ! p.parent || p.parent === 'canvas1' ) {
          this.canvas.remove(o);

          if ( this.Physical.isInstance(o) ) {
            this.physics.remove(o);
          }
        } else {
          this.properties.find(p.parent).then(function(p2) {
            p2.value.remove(o);
          });
        }
      }
    },

    function onMouseDown(evt) {
      this.onClick(evt);
      var x = evt.offsetX, y = evt.offsetY;
      var c = this.canvas.findFirstChildAt(x, y);

      if ( c === this.canvas ) {
        this.mouseTarget = null;
      } else {
        console.log('mouseDown: ', c && c.cls_.name);
        this.mouseTarget = c;
        if ( c && c.onMouseDown ) c.onMouseDown(evt);
      }
    },

    function onMouseUp(evt) {
      this.mouseTarget = null;
    },

    function onMouseMove(evt) {
      if ( this.mouseTarget && this.mouseTarget.onMouseMove ) this.mouseTarget.onMouseMove(evt);
    },

    function onClick(evt) {
      var x = evt.offsetX, y = evt.offsetY;
      var c = this.canvas.findFirstChildAt(x, y);

      if ( this.Halo.isInstance(c) ) return;

      if ( c === this.canvas ) {
        var tool = this.currentTool;
        if ( tool === this.CURRENT_TOOL.value ) return;
        var cls = this.__context__.lookup(tool.id);
        var o = cls.create({x: x, y: y}, this.__subContext__);
        var p = this.addProperty(o, null, null, 'canvas1');
        // TODO: hack because addProperty is asyn
        setTimeout(this.updateMemento.bind(this), 100);
      } else {
        for ( ; c !== this.canvas ; c = c.parent ) {
          var p = c.getPrivate_('lpp_');
          if ( p ) {
            this.selected = p;
            break;
          }
        }
      }
    },

    function onRightClick(evt) {
      evt.preventDefault();
      if ( ! this.selected ) return;
    },

    {
      name: 'onMemento_',
      isMerged: true,
      mergeDelay: 100,
      code: function() {
        var m = this.memento;
        this.properties.skip(4).removeAll();
        if ( m ) {
          for ( var i = 0 ; i < m.length ; i++ ) {
            var p = m[i];
            this.addProperty(p.value, p.name, null, p.parent);
          }
        }
        this.selected = null;
      }
    },

    function onMemento() {
      if ( this.feedback_ ) return;
      this.onMemento_();
    }
  ]
});
