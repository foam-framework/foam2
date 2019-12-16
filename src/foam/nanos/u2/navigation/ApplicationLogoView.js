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

  css: `
    ^ {
      display: flex;
      align-items: center;
      cursor: pointer;
    }
    ^ .logo {
      max-height: 40px;
    }
    ^ .appName {
      color: white;
      font-size: 20px;
      display: flex;
      align-items: center;
      margin-left: 10px;
    }
  `,

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .on('click', this.goToDefault)
          .start({
            class: 'foam.u2.tag.Image',
            data$: this.theme$.dot('logo')
          })
            .hide(this.theme$.dot('largeLogoEnabled'))
            .addClass('logo')
          .end()
          .start('span')
            .addClass('appName')
            .hide(this.theme$.dot('largeLogoEnabled'))
            .add(this.theme$.dot('appName'))
          .end()
          .start({
            class: 'foam.u2.tag.Image',
            data$: this.theme$.dot('largeLogo')
          })
            .addClass('logo')
            .show(this.theme$.dot('largeLogoEnabled'))
          .end();
    }
  ],

  listeners: [
    function goToDefault() {
      if ( this.theme ) {
        this.pushMenu(this.theme.defaultMenu);
      }
    }
  ]
});
