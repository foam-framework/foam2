/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.google.foam.demos.blocks',
  name: 'Blocks',
  extends: 'foam.u2.Element',

  requires: [ 'com.google.foam.demos.blocks.Wall' ],

  documentation: 'Simple architectural stress simulator',

  properties: [
    {
      class: 'Int',
      name: 'time'
    },
    {
      name: 'wall',
      factory: function() { return this.Wall.create(); }
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.add(this.time$).tag('br').add(this.wall);
      this.tick();
    }
  ],

  listeners: [
    {
      name: 'tick',
      isMerged: true,
      mergeDelay: 1000,
      code: function() { this.time++; this.tick(); }
    }
  ]
});
