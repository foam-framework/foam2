foam.CLASS({
  package: 'foam.u2.svg',
  name: 'TreeGraph',
  extends: 'foam.u2.Element',

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
    {
      name: 'data',
      // can't be FObjectArray because 'of' can't be specified
      class: 'Array'
    }
  ],

  methods: [
    function initE() {
      var size = 100;
      var gap = 20;
      var self = this;
      this
        .start('svg')
          .attrs({
            'xmlns': 'http://www.w3.org/2000/svg',
            'viewBox': '0 0 ' +
              ('' + (this.nodePlacementPlan.shape[0]*(size + gap) + gap)) + ' ' +
              ('' + (this.nodePlacementPlan.shape[1]*(size + gap) + gap))
          })
          .forEach(this.data, function (obj) {
            var coords = self.nodePlacementPlan.getPlacement(obj);
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

            this
              .start('rect')
                .attrs({
                  ...dims,
                  fill: '#ccc',
                })
              .end()
              .start('foreignObject')
                .attrs({
                  ...dims,
                  fill: '#ccc',
                })
                .start('p')
                  .attrs({
                    xmlns: 'http://www.w3.org/1999/xhtml',
                  })
                  .addClass(self.myClass('p'))
                  .add(obj.name)
                .end()
              .end()
          })
        .end()
    }
  ]
});