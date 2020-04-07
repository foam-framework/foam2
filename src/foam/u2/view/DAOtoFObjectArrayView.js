/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'DAOtoFObjectArrayView',
  extends: 'foam.u2.View',

  documentation: 'Adapt a DAOView for use with viewing an FObjectArray',

  requires: [
    'foam.u2.stack.Stack',
    'foam.dao.ArrayDAO'
  ],

  exports: [ 'stack' ],

  properties: [
    {
      name: 'stack',
      view: 'foam.u2.stack.StackView',
      factory: function() {
        return this.Stack.create();
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'daoView',
      factory: function() { return foam.comics.InlineBrowserView; }
    },
    {
      name: 'dao',
      factory: function() {
        return this.ArrayDAO.create({of: this.of, array: this.data});
      }
    },
    'of',
  ],

  methods: [
    function fromProperty(p) {
      this.of = p.of;
    },
    function initE() {
      var self = this;

      this.SUPER();

      // I'm not sure why we need to add a Stack. Shouldn't InlineBrowserView
      // do that itself? -- KGR
      this.
        start(this.STACK, {data: this.stack}).
          start(foam.u2.ViewSpec.createView(this.daoView, { data: this.dao }, this, this.__subContext__), {data: this.dao}).
          end().
        end();
    }
  ]
});
