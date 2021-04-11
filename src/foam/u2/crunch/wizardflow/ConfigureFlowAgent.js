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
    'popView',
    'wizardCloseSub'
  ],

  requires: [
    'foam.u2.dialog.Popup'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      name: 'wizardCloseSub',
      of: 'foam.core.FObject',
      factory: function() {
        return foam.core.FObject.create();
      }
    },
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
          ? function (viewSpec, onClose) {
            ctrl.add(
              self.Popup.create({
                closeable: viewSpec.closeable ? viewSpec.closeable : false,
                ...(onClose ? { onClose: onClose } : {}),
              })
                .tag(viewSpec)
            )
          }
          : function (viewSpec) {
            self.stack.push(viewSpec, self);
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