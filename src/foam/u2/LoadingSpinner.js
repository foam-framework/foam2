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

  imports: ['theme'],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          position: relative;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
        }

        ^.hidden {
          display: none;
        }

        ^ .processing-notice {
          padding-top: 8px;
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
    'size'
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass()).enableClass('hidden', this.isHidden$)
        .start()
          .style({ width: this.size+'px' })
          .start('svg')
            .attrs({ width: '100%', viewBox: '0 0 24 24', 'transform-origin': 'center', preserveAspectRatio: 'xMidYMid meet' })
            .start('g')
              .style({
                'transform-origin': 'center',
                'transform-box': 'fill-box', //Safari support
                transform: this.angle$.map(a => 'rotate(' + a + 'deg)') 
              })
              .start('path')
                .attrs({
                  d: 'M12 0C14.5832 3.08049e-08 17.0975 0.833605 19.1691 2.3769C21.2407 3.92019 22.7589 6.09077 23.4982 8.56598C24.2374 11.0412 24.1582 13.6889 23.2722 16.1155C22.3863 18.542 20.741 20.6179 18.5808 22.0346C16.4207 23.4512 13.861 24.133 11.2824 23.9785C8.70379 23.824 6.24386 22.8416 4.26828 21.1772C2.29271 19.5128 0.906976 17.2553 0.317073 14.7403C-0.272831 12.2253 -0.0354082 9.5871 0.994048 7.21784L3.74025 8.41109C2.96766 10.1892 2.78948 12.1691 3.23219 14.0565C3.67491 15.944 4.71487 17.6382 6.1975 18.8873C7.68013 20.1364 9.52626 20.8737 11.4615 20.9896C13.3967 21.1056 15.3176 20.5939 16.9388 19.5308C18.5599 18.4676 19.7947 16.9097 20.4596 15.0886C21.1245 13.2675 21.1839 11.2804 20.6291 9.42284C20.0743 7.56524 18.9349 5.93626 17.3803 4.77805C15.8256 3.61984 13.9387 2.99424 12 2.99424L12 0Z',
                  fill: this.theme ? this.theme.primary3 : '#406dea'
                })
              .end()
            .end()
          .end()
        .end()
        .start('p')
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
