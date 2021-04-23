/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'LoadingSpinner',
  extends: 'foam.u2.View',

  documentation: 'Small view that just shows a loading spinner',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          position: relative;
        }

        ^.hidden {
          display: none;
        }

        ^ .processing-notice {
          text-align: center;
        }
      */}
    })
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'isHidden',
      value: false
    },
    {
      class: 'Boolean',
      name: 'showText',
      value: false
    },
    {
      class: 'String',
      name: 'text'
    },
    {
      class: 'Int',
      name: 'angle'
    },
    {
      name: 'imagePath',
      class: 'String',
      value: '/images/ic-loading.svg'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass()).enableClass('hidden', this.isHidden$)
        .start({ class: 'foam.u2.tag.Image', data$: this.imagePath$ })
          .style({transform: this.angle$.map(a => 'rotate(' + a + 'deg)')})
        .end()
        .start()
        .addClass('processing-notice')
          .show(this.showText$)
          .add(this.text)
        .end();

      this.tick();
    },

    function show() {
      this.isHidden = false;
      this.tick();
    },

    function hide() {
      this.isHidden = true;
    }
  ],

  listeners: [
    {
      name: 'tick',
      isFramed: 'true',
      code: function() {
        if ( this.isHidden ) return;
        this.angle = (this.angle + 3) % 360;
        this.tick();
      }
    }
  ]
});
