foam.CLASS({
  package: 'foam.u2.crunch.lab',
  name: 'CapabilityGraphNodeView',
  extends: 'foam.u2.View',

  properties: [
    {
      name: 'nodeName',
      value: 'G'
    },
    {
      name: 'size',
      class: 'Array',
      factory: () => [100, 100]
    },
    {
      name: 'position',
      class: 'Array',
      factory: () => [0, 0]
    }
  ],

  methods: [
    function initE() {
      var dims = {
        x: '' + this.position[0],
        y: '' + this.position[1],
        width:  '' + this.size[0],
        height: '' + this.size[1],
      };
      this
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
            .add(this.data.name)
            .add('\n')
            .add(this.data.id)
          .end()
        .end()
    }
  ]
});