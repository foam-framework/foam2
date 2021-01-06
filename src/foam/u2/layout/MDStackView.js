/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.layout',
  name: 'MDStackView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.stack.Stack'
  ],

  exports: [ 'data as stack' ],

  properties: [
    {
      name: 'data',
      factory: function() { return this.Stack.create(); }
    },
    {
      class: 'Boolean',
      name: 'showActions',
      value: true
    },
    {
      name: 'curPos',
      value: 0
    },
    'curView',

  ],

  css: '%CUSTOMCSS%',

  methods: [
    // TODO: Why is this init() instead of initE()? Investigate and maybe fix.
    function init() {
    this.curView$.sub(this.onViewUpdate);

    var self = this;
      this.setNodeName('div');
      this.addClass(this.myClass());

      this.start('div').addClass('primary-stack')
        .add(this.slot(function(data) {
          var s = data.top;
          if ( ! s ) return this.E('span');

          var view   = s[0];
          var parent = s[1];

          var X;
          if ( ! parent ) {
            X = this.__subSubContext__;
          } else {
            if ( parent.isContext ) {
              X = parent;
            } else if ( parent.__subContext__ ) {
              X = parent.__subContext__;
            } else {
              // I'm not sure how this is a good idea, KGR
              // TODO: find all places we do this and see if we can replace
              // with case 1 above.

              // Do a bit of a dance with the context, to ensure that exports from
              // "parent" are available to "view"
              X = this.__subSubContext__.createSubContext(parent);
            }
          }

          var e  = foam.u2.ViewSpec.createView(view, null, this, X);
          this.children[0].removeClass('slide-in');
          this.children[0].style({
            left: data.pos > self.curPos ? '100%' : '-100%',
          });
          self.curPos = data.pos;
          self.curView = e;
          return self.curView;
        }, this.data$, this.data$.dot('top')))
      .end();
    }
  ],

  listeners: [
    {
        name: 'onViewUpdate',
        isMerged:true,
        mergeDelay:1,
        code: function() {
          this.children[0].addClass('slide-in')
        }
      },
  ],

  css: `
    ^ .slide-in {
      left: 0 !important;
      transition: left 300ms ease;
    }

    ^ .primary-stack {
      position: absolute;
      width: 100%;
      height: 100%;
    }
  `
});
