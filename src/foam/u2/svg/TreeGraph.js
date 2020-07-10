foam.CLASS({
  package: 'foam.u2.svg',
  name: 'TreeGraph',
  extends: 'foam.u2.Element',

  requires: [
    'foam.u2.svg.arrow.VHVArrowLine',
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
      of: 'foam.u2.svg.graph.GridPlacementPlan',
    },
    // {
    //   name: 'data',
    //   // can't be FObjectArray because 'of' can't be specified
    //   class: 'Array'
    // },
    {
      name: 'rootObject',
      class: 'FObjectProperty'
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
      g
        .attrs({
          'xmlns': 'http://www.w3.org/2000/svg',
          'viewBox': '0 0 ' +
            ('' + (this.nodePlacementPlan.shape[0]*(size + gap) + gap)) + ' ' +
            ('' + (this.nodePlacementPlan.shape[1]*(size + gap) + gap))
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

      var dims = {
        x: '' + (coords[0]*(size + gap) + gap),
        y: '' + (coords[1]*(size + gap) + gap),
        width: '' + size, height: '' + size,
      }

      g
        .start('rect')
          .attrs({
            ...dims,
            fill: '#fff',
            stroke: 'black'
          })
        .end()
        .start('foreignObject')
          .attrs({
            ...dims,
          })
          .start('p')
            .attrs({
              xmlns: 'http://www.w3.org/1999/xhtml',
            })
            .addClass(this.myClass('p'))
            .add(obj.name)
            .add('<br>')
            .add(obj.id)
          .end()
        .end()

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
        })
      
      obj[this.relationshipPropertyName].dao
        .select().then(r => r.array.forEach(o => {
          this.renderBoxes(g, o, obj);
        }));
    }
  ]
});