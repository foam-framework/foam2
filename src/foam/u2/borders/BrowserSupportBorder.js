/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.borders',
  name: 'BrowserSupportBorder',
  extends: 'foam.u2.Element',

  css: `
  ^browser-message {
    margin-right: 20%;
    float: right;
  }
  `,

  documentation: 'Border to show browser support message',

  messages: [
    { name: 'BROWSER_SUPPORT', message: 'This application is optimized for '}
  ],

  methods: [
    function init() {
      if ( this.isChrome() ) {
        this
          .start()
            .addClass(this.myClass())
            .start('div', null, this.content$)
              .addClass(this.myClass('content'))
            .end()
          .end();
      } else {
        this
          .start()
            .addClass(this.myClass())
            .start('div', null, this.content$)
              .addClass(this.myClass('content'))
            .end()
            .start('div')
              .addClass(this.myClass("browser-message"))
              .add(this.BROWSER_SUPPORT)
              .start('a')
                .attrs({href: 'https://www.google.com/chrome/'})
                .add("Google Chrome")
              .end()
            .end()
          .end();
      }
    },

    function isChrome() {
      return navigator.userAgent.includes("Chrome") && navigator.vendor.includes("Google Inc");
    }
  ]
})
