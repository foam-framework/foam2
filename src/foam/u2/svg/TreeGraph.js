/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.svg',
  name: 'TreeGraph',
  extends: 'foam.u2.Element',

  requires: [
    'foam.u2.svg.arrow.VHVArrowLine',
    'foam.u2.svg.arrow.SimpleArrowHead',
  ],

  css: `
    ^p {
      /*
        note: "pixels" are relative to SVG viewport
      */
      font-size: 10px;
      text-align: center;
    }
  `,

  documentation: `
    SVG implementation of a tree graph.
  `,

  properties: [
    {
      name: 'nodePlacementPlan',
      class: 'FObjectProperty',
      of: 'FObject',
      // of: 'foam.u2.svg.graph.GridPlacementPlan',
    },
    // {
    //   name: 'data',
    //   // can't be FObjectArray because 'of' can't be specified
    //   class: 'Array'
    // },
    {
      name: 'rootObject',
      class: 'FObjectProperty',
      of: 'FObject',
    },
    {
      name: 'nodeView',
      class: 'foam.u2.ViewSpec'
    },
    {
      name: 'relationshipPropertyName',
      class: 'String'
    },

    {
      name: 'size',
      class: 'Int',
      value: 100
    },
    {
      name: 'gap',
      class: 'Int',
      value: 20
    }
  ],

  methods: [
    function initE() {
      var size = this.size; var gap = this.gap;
      var self = this;
      var g = this.start('svg');
      this.renderBoxes(g, this.rootObject);
      var shape = this.nodePlacementPlan.shape;
      g
        .attrs({
          'xmlns': 'http://www.w3.org/2000/svg',
          'viewBox': '0 0 ' +
            ('' + (shape[0]*(size + gap) + gap)) + ' ' +
            ('' + (shape[1]*(size + gap) + gap))
        })
        .end()
    },
    function renderBoxes(g, obj, parent) {
      var self = this;
      var size = this.size; var gap = this.gap;
      var coords = this.nodePlacementPlan.getPlacement(obj);
      if ( coords == null ) return;
      if ( ! Array.isArray(coords) ) {
        console.warn('unexpected return time from placement',
          typeof coords, coords)
      }

      g
        .tag(this.nodeView, {
          data: obj,
          position: coords.map(v => gap + v*(size + gap)),
          size: Array(coords.length).fill(this.size)
        })
        .callIf(parent, function () {
          var pcoords = self.nodePlacementPlan.getPlacement(parent);
          this
            .tag(self.VHVArrowLine, {
              startPos: [
                (pcoords[0]*(size + gap) + gap + 0.5*size),
                (pcoords[1]*(size + gap) + gap + size),
              ],
              endPos: [
                (coords[0]*(size + gap) + gap + 0.5*size),
                (coords[1]*(size + gap) + gap),
              ]
            })
            .tag(self.SimpleArrowHead, {
              originPos: [
                // same as end position of line
                (coords[0]*(size + gap) + gap + 0.5*size),
                (coords[1]*(size + gap) + gap),
              ],
              angle: 0,
              size: 5
            })
        })
      
      obj[this.relationshipPropertyName].dao
        .select().then(r => r.array.forEach(o => {
          this.renderBoxes(g, o, obj);
        }));
    }
  ]
});