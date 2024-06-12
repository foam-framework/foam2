/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.stack',
  name: 'DesktopStackView',
  extends: 'foam.u2.stack.StackView',

  requires: [
    'foam.nanos.controller.Memento',
    'foam.u2.dialog.Popup',
    'foam.u2.stack.Stack'
  ],

  properties: [
    {
      name: 'popupsOpened',
      documentation: 'Determines of a popup is open at a specific index',
      factory: () => ({})
    }
  ],

  css: '%CUSTOMCSS%',

  methods: [
    function listenStackView() {
      var self = this;
      this.data$.dot('top').sub(() => {
        var top = this.data.top;
        var pos = this.data.pos;
        // TODO: This is an unreliable way to test a 'back' event
        if ( this.popupsOpened[pos + 1] ) {
          let popup = this.popupsOpened[pos + 1];
          delete this.popupsOpened[pos + 1];
          popup.close();
        }
        if ( top[3].popup && ! this.popupsOpened[pos] ) {
          let popup = this.Popup.create({
            ...top[3].popup,
            onClose: () => {
              if ( this.popupsOpened[pos] ) {
                delete this.popupsOpened[pos];
                this.data.back();
              }
            }
          });
          popup.add(this.renderStackView(top));
          this.popupsOpened[pos] = popup;
          ctrl.add(popup);
        }
      });
      this.add(this.slot(s => self.renderStackView(s),
        this.data$.dot('topNonPopup')))
    }
  ]
});
