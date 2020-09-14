/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'ConfigureFlowAgent',
  implements: [ 'foam.core.ContextAgent' ],

  imports: [
    'stack'
  ],

  exports: [
    'pushView',
    'popView'
  ],

  requires: [
    'foam.u2.dialog.Popup'
  ],

  properties: [
    {
      name: 'popupMode',
      class: 'Boolean',
      value: true
    },
    {
      name: 'ensureHash',
      documentation: `
        Sets the url hash on subsequent stack pushes.
      `,
      class: 'String'
    },
    {
      name: 'pushView',
      class: 'Function',
      expression: function () {
        var self = this;
        return this.popupMode 
          ? function (viewSpec) {
            ctrl.add(
              self.Popup.create({ closable: false })
                .tag(viewSpec)
            )
          }
          : function (viewSpec) {
            self.stack.push(viewSpec);
            if ( self.ensureHash ) {
              location.hash = self.ensureHash;
            }
          }
          ;
      }
    },
    {
      name: 'popView',
      class: 'Function',
      expression: function () {
        var self = this;
        return this.popupMode 
          ? function (x) {
            x.closeDialog();
          }
          : function (x) {
            self.stack.back();
          }
          ;
      }
    }
  ],

  methods: [
    async function execute () {}
  ]
});