/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.doc',
  name: 'ClassLink',
  extends: 'foam.u2.View',

  imports: [ 'browserPath' ],

  properties: [
    {
      class: 'Class',
      name: 'data'
    },
    {
      class: 'Boolean',
      name: 'showPackage'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();

      this.setNodeName('a').
        on('click', this.click).
        attrs({href: this.data.id}).
        add(this.showPackage ? this.data.id : this.data.name);
    }
  ],

  listeners: [
    function click(e) {
      this.browserPath$.set(this.data.id);
      e.preventDefault();
    }
  ]
});
