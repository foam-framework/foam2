/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.svg.graph',
  name: 'ZoomedOutFObjectGraphNodeView',
  extends: 'foam.u2.View',

  css: `
    ^ {
      overflow: auto;
    }
    ^view {
      zoom: 0.7;
      overflow: auto;
    }
  `,

  properties: [
    {
      name: 'nodeName',
      value: 'foreignObject'
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
        .addClass(this.myClass())
        .attrs(dims)
        .start('div')
          .attrs({
            xmlns: 'http://www.w3.org/1999/xhtml',
          })
          .addClass(this.myClass('view'))
          .add(this.data)
        .end()
    }
  ]
});
