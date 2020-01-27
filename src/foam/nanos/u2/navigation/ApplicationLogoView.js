/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
*/
foam.CLASS({
  package: 'foam.nanos.u2.navigation',
  name: 'ApplicationLogoView',
  extends: 'foam.u2.View',

  documentation: 'View displaying Application logo and name.',

  imports: [
    'group',
    'pushMenu',
    'theme'
  ],

  requires: [
    'foam.u2.tag.Image'
  ],

  css: `
    ^ {
      display: flex;
      align-items: center;
      cursor: pointer;
    }
    ^ .logo {
      max-height: 40px;
    }
  `,

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .on('click', this.goToDefault)
        .start(this.Image, {
          data$: this.slot(function(theme$largeLogoEnabled, theme$logo, theme$largeLogo) {
            return theme$largeLogoEnabled ? theme$largeLogo : theme$logo;
          })
        })
          .addClass('logo')
        .end();
    }
  ],

  listeners: [
    function goToDefault() {
      if ( this.theme ) {
        this.pushMenu(this.group.defaultMenu);
      }
    }
  ]
});
