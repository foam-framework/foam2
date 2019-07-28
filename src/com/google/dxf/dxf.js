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
  package: 'com.google.dxf.model',
  name: 'Point2',

  properties: [
    { class: 'Float', name: 'x' },
    { class: 'Float', name: 'y' }
  ]
});


foam.CLASS({
  package: 'com.google.dxf.model',
  name: 'Point3',

  properties: [
    { class: 'Float', name: 'x' },
    { class: 'Float', name: 'y' },
    { class: 'Float', name: 'z' }
  ]
});


foam.CLASS({
  package: 'com.google.dxf.model',
  name: 'Entity',

  imports: [
    'doTransform',
    'dxfScale',
    'layerColors',
    'layers'
  ],

  ids: [ 'handle' ],

  properties: [
    {
      class: 'String',
      name: 'handle'
    },
    {
      class: 'String',
      name: 'type'
    },
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'ownerHandle'
    },
    {
      class: 'String',
      name: 'layer'
    }
  ],

  methods: [
    function render() {
      throw "Can't render a default Entity.";
    }
  ]
});


foam.CLASS({
  package: 'com.google.dxf.model',
  name: 'Insert',
  extends: 'com.google.dxf.model.Entity',

  documentation: 'An INSERT is a nested entity. It references by name an ' +
      'object described in the BLOCKS table. Each block contains a list of ' +
      'inner entities.',

  requires: [
    'foam.graphics.CView'
  ],

  imports: [
    'doTransform',
    'dxfBlocks',
    'inflateEntity'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'com.google.dxf.model.Point3',
      name: 'position',
      adapt: function(old, nu) {
        this.doTransform(nu);
        return nu;
      }
    },
    {
      class: 'FObjectProperty',
      of: 'com.google.dxf.model.Point3',
      name: 'extrusionDirection'
    },
    {
      class: 'Float',
      name: 'rotation'
    },
    { class: 'Float', name: 'xScale' },
    { class: 'Float', name: 'yScale' },
    { class: 'Float', name: 'zScale' }
  ],

  methods: [
    function render() {
      // Look up the blocks entry.
      if ( ! this.layers[this.layer].visible ) return;
      var block = this.dxfBlocks[this.name];
      var entities = block.entities.map(this.inflateEntity);
      var cview = this.CView.create();
      for ( var i = 0; i < entities.length; i++ ) {
        var e = entities[i].render();
        if ( e ) cview.add(e);
      }
      return cview;
    }
  ]
});


foam.CLASS({
  package: 'com.google.dxf.model',
  name: 'Line',
  extends: 'com.google.dxf.model.Entity',

  imports: [
    'doTransform'
  ],

  properties: [
    {
      class: 'FObjectArray',
      of: 'com.google.dxf.model.Point3',
      name: 'vertices',
      adaptArrayElement: function(nu, obj) {
        obj.doTransform(nu);
        return nu;
      }
    },
    {
      class: 'Float',
      name: 'lineweight',
      value: 1
    },
    {
      class: 'String',
      name: 'lineType'
    }
  ],

  methods: [
    function render() {
      if ( ! this.layers[this.layer].visible ) return;
      return foam.graphics.Line.create({
        startX: this.vertices[0].x,
        startY: this.vertices[0].y,
        endX: this.vertices[1].x,
        endY: this.vertices[1].y,
        color: this.layerColors[this.layer],
        lineWidth: this.lineWeight
      });
    }
  ]
});


foam.CLASS({
  package: 'com.google.dxf.model',
  name: 'Arc',
  extends: 'com.google.dxf.model.Entity',

  imports: [
    'doTransform'
  ],

  properties: [
    { class: 'Float', name: 'angleLength' },
    { class: 'Float', name: 'startAngle' },
    { class: 'Float', name: 'endAngle' },
    { class: 'Float', name: 'radius' },
    {
      class: 'FObjectProperty',
      of: 'com.google.dxf.model.Point3',
      name: 'center',
      adapt: function(old, nu) {
        this.doTransform(nu);
        return nu;
      }
    }
  ],

  methods: [
    function render() {
      if ( ! this.layers[this.layer].visible ) return;
      return foam.graphics.Arc.create({
        x: this.center.x,
        y: this.center.y,
        radius: this.radius * this.dxfScale,
        start: this.startAngle,
        end: this.endAngle,
        arcWidth: 1,
        border: this.layerColors[this.layer]
      });
    }
  ]
});


foam.CLASS({
  package: 'com.google.dxf.model',
  name: 'Polygon',
  extends: 'com.google.dxf.model.Entity',

  imports: [
    'doTransform'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'shape',
      documentation: 'No idea what this means.'
    },
    {
      class: 'Float',
      name: 'lineweight',
      units: '10um',
      documentation: 'The width of the line in 100ths of mm.'
    },
    {
      class: 'FObjectArray',
      of: 'com.google.dxf.model.Point3',
      name: 'vertices',
      adaptArrayElement: function(nu, obj) {
        obj.doTransform(nu);
        return nu;
      }
    }
  ],

  methods: [
    function render() {
      if ( ! this.layers[this.layer].visible ) return;
      return foam.graphics.Polygon.create({
        xCoordinates: this.vertices.map(function(v) { return v.x; }),
        yCoordinates: this.vertices.map(function(v) { return v.y; }),
        color: this.layerColors[this.layer]
      });
    }
  ]
});


foam.CLASS({
  package: 'com.google.dxf.ui',
  name: 'DXFDiagram',
  extends: 'foam.graphics.CView',

  requires: [
    'com.google.dxf.model.Entity',
    'foam.dao.MDAO',
    'foam.dao.PromisedDAO',
    'foam.graphics.CView'
  ],

  imports: [
    'document',
    'window'
  ],

  exports: [
    'as data',
    'doTransform',
    'dxfBlocks',
    'dxfScale',
    'inflateEntity',
    'layerColors',
    'layers'
  ],

  constants: {
    ENTITY_TYPES: {
      ARC:        'com.google.dxf.model.Arc',
      INSERT:     'com.google.dxf.model.Insert',
      LINE:       'com.google.dxf.model.Line',
      LWPOLYLINE: 'com.google.dxf.model.Polygon'
    }
  },

  css: `
    ^layers {
      display: inline-block;
    }
    ^ canvas {
    }
  `,

  properties: [
    {
      name: 'autoRepaint',
      value: false
    },
    {
      class: 'String',
      name: 'dxfUrl',
      value: '../dxf/sample.dxf'
    },
    {
      name: 'dxfPromise',
      hidden: true,
      factory: function() {
        var self = this;
        return this.window.fetch(this.dxfUrl).then(function(resp) {
          return resp.text();
        }).then(function(text) {
          var parser = new self.window.DxfParser();
          return parser.parseSync(text);
        }).then(function(tree) { // TODO: Debugging, remove this.
          self.window.__tree = tree;

          var colors = {};
          // Map from layers to colours.
          foam.Object.forEach(tree.tables.layer.layers, function(o, k) {
            colors[k] = '#' + o.color.toString(16);
          });
          self.layerColors = colors;
          self.layers      = tree.tables.layer.layers;
          self.dxfBlocks   = tree.blocks;

          var topRight     = tree.header.$EXTMAX;
          var bottomLeft   = tree.header.$EXTMIN;
          self.translateX  = -bottomLeft.x;
          self.translateY  = -topRight.y;

          return tree;
        });
      }
    },
    {
      name: 'layerColors',
      hidden: true
    },
    {
      name: 'layers',
      hidden: true
    },
    {
      name: 'sideCanvas',
      hidden: true
    },
    {
      name: 'dxfBlocks',
      hidden: true
    },
    {
      class: 'Float',
      name: 'dxfScale',
      documentation: 'CAD drawings are often huge (many thousands of ' +
          'pixels). Give a scale factor here to shrink the diagram.',
      value: 0.1,
      postSet: function(old, nu) {
        this.invalidate();
      }
    },
    {
      class: 'Float',
      name: 'translateX',
      hidden: true,
      value: 0
    },
    {
      class: 'Float',
      name: 'translateY',
      hidden: true,
      value: 0
    },
    {
      name: 'entityDAO',
      hidden: true,
      factory: function() {
        var self = this;
        var inner = this.MDAO.create({ of: this.Entity });
        return this.PromisedDAO.create({
          promise: this.dxfPromise.then(function(tree) {
            var ps = [];
            for ( var i = 0; i < tree.entities.length; i++ ) {
              ps.push(inner.put(self.inflateEntity(tree.entities[i])));
            }
            return Promise.all(ps).then(function() { return inner; });
          })
        });
      }
    }
  ],

  methods: [
    function paintSelf(x) {
      this.SUPER(x);

      if ( this.sideCanvas ) {
        x.drawImage(this.sideCanvas, this.x, this.y);
      } else {
        this.sideCanvas = this.document.createElement('canvas');
        var self = this;
        this.dxfPromise.then(function(tree) {
          var topRight   = tree.header.$EXTMAX;
          var bottomLeft = tree.header.$EXTMIN;
          self.sideCanvas.width  = self.width  = topRight.x - bottomLeft.x;
          self.sideCanvas.height = self.height = topRight.y - bottomLeft.y;
          self.renderDiagram();
        });
      }
    },

    function doTransform(pos) {
      // Converts the coordinates in pos based on dxfScale and translateX/Y.
      // Negating the scale for Y-coordinates, to convert +Y from up (CAD) to
      // down (canvas).
      pos.x = (pos.x + this.translateX) * this.dxfScale;
      pos.y = (pos.y + this.translateY) * (-this.dxfScale);
    },

    function inflateEntity(entity) {
      var model = foam.lookup(this.ENTITY_TYPES[entity.type]);
      return foam.json.parse(entity, model, this.__subContext__);
    }
  ],

  listeners: [
    {
      name: 'renderDiagram',
      isFramed: true,
      code: function() {
        // Render everything into the CView.
        var self = this;
        console.time('render');

        // TODO(braden): Remove hard-coded set of layers; demo purposes only.
        var visibleLayers = [
          '0',
          'I-WALL',
          'A-GLAZ-CURT',
          'A-GLAZ-CWMG',
          'A-WALL',
          'A-DOOR',
          'S-BEAM',
          'A-FLOR',
          'S-STRS',
          'S-STRS-MBND',
          'L-PLNT',
          'A-DETL',
          'Q-CASE',
          'Q-SPCQ',
          'A-FLOR-HRAL',
          'L-SITE',
          'A-DETL-GENF',
          'A-WALL-PATT',
          'A-FLOR-LEVL',
          'S-STRS-ANNO',
          'A-GENM',
          'S-COLS',
          'A-AREA-PATT',
          'S-GRID_IDEN',
          'X-BLOCKS'
        ];
        /*
        foam.Object.forEach(this.layers, function(l, k) {
          if ( l.visible ) visibleLayers.push(k);
        });
        */

        this.entityDAO.where(foam.mlang.predicate.In.create({
          arg1: this.Entity.LAYER,
          arg2: visibleLayers
        })).select().then(function(a) {
          var entities = a.array;
          var cview = self.CView.create({
            canvas: self.sideCanvas
          });
          for ( var i = 0; i < entities.length; i++ ) {
            var e = entities[i].render();
            if ( e ) cview.add(e);
          }
          cview.paint(self.sideCanvas.getContext('2d'));
          self.renderEnd();
        });
      }
    },
    {
      name: 'renderEnd',
      isFramed: true,
      code: function() {
        this.invalidate();
      }
    }
  ]
});
