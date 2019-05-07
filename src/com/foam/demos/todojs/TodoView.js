/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.foam.demos.todojs',
  name: 'TodoView',
  extends: 'foam.u2.Element',

  css: `
    ^done {
      text-decoration: line-through;
      color: grey;
    }
  `,
  exports: [
    'data'
  ],

  properties: [
    'data', //TODO more clarification
  ],

  methods: [
    function initE() {
      this.start(this.data.DONE).end().enableClass(this.myClass('done'), this.data.done$). // for CSS reason
        add(this.data.action).add(this.data.done$).end();
    }
  ]
});
