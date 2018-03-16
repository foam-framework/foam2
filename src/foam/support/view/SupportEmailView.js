foam.CLASS({
  package: 'foam.support.view',
  name: 'SupportEmailView',
  extends: 'foam.u2.View',

  documentation:'SUPPORT VIEW',

  requires:[
    'foam.u2.dialog.PopUp'
  ],

  imports: [
    'ctrl'
  ],

  methods:[
    function initE(){    
      this.start(this.TEST_MODAL).end()
      this.start(this.SUPPORT_VIEW).end()
    }
  ],

  actions: [
    {
      name: 'testModal',
      code: function(){
        this.ctrl.add(foam.u2.dialog.Popup.create().tag({ class: 'foam.support.modal.NewEmailSupportModal'}));
      }
    },
    {
      name: 'supportView',
      code: function(){
        this.ctrl.add(foam.u2.dialog.Popup.create().tag({ class: 'foam.support.modal.NewEmailSupportModal1'}));
      }
    }
  ]
});