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

        ^ img {
          -webkit-animation-duration: 3s;
          -webkit-animation-timing-function: linear;
          -webkit-animation-delay: 0s;
          -webkit-animation-iteration-count: infinite;
          -webkit-animation-direction: normal;
          -webkit-animation-fill-mode: none;
          -webkit-animation-play-state: running;
          -webkit-animation-name: spin;
          
          -moz-animation-duration: 3s;
          -moz-animation-timing-function: linear;
          -moz-animation-delay: 0s;
          -moz-animation-iteration-count: infinite;
          -moz-animation-direction: normal;
          -moz-animation-fill-mode: none;
          -moz-animation-play-state: running;
          -moz-animation-name: spin;
          
          animation-duration: 3s;
          animation-timing-function: linear;
          animation-delay: 0s;
          animation-iteration-count: infinite;
          animation-direction: normal;
          animation-fill-mode: none;
          animation-play-state: running;
          animation-name: spin;
        }
        @-moz-keyframes spin { 100% { -moz-transform: rotate(360deg); } }
        @-webkit-keyframes spin { 100% { -webkit-transform: rotate(360deg); } }
        @keyframes spin { 100% { -webkit-transform: rotate(360deg); transform:rotate(360deg); } }

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
    }
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass()).enableClass('hidden', this.isHidden$)
        .start({ class: 'foam.u2.tag.Image', data: 'images/ic-loading.svg' }).end()
        .start()
            .show(this.showText$)
            .addClass('processing-notice')
            .add(this.text)
        .end();
    },

    function show() {
      this.isHidden = false;
    },

    function hide() {
      this.isHidden = true;
    }
  ]
});
