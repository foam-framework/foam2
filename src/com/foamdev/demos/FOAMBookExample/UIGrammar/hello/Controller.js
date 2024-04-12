/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.foam.demos.FOAMBookExample.UIGrammar.hello',
  name: 'Controller',
  extends: 'foam.u2.Element',

  exports: [ 'as data' ], // FOAM has DI (Dependency Injection) built-in at the
                          // object level.

  css: `
    body, input[text] { color: #888; font-family: Cambria, Georgia; }
  `,

  methods: [
    function initE() {

      this.start('div').
             addClass('container'). // <div class='container'>.end().
             add('Hello, world!').
           end();

      this.start('button').
             attrs({type: 'button','data-dismiss': 'alert','aria-label': 'Close'}).
             addClass('close').
             start('span').
               attrs({'aria-hidden': 'true'}).
               add('&times;').
             end().
           end();
    }
  ]
});
