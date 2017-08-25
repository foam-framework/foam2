foam.CLASS({
  package: 'foam.u2.view',
  name: 'PopUpTitledView',
  extends: 'foam.u2.View',

  imports: [
    'stack',
    'closeDialog'
  ],

  documentation: 'Pop Up View',

  properties: [ 
     {
       class: 'String',
       name: 'title'
     },
     'messageView'
   ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
      ^ {
        width: 448px;
        margin: auto;
      }

      ^ .Message-Container {
        width: 448px;
        border-radius: 2px;
        background-color: #ffffff;
      }

      ^ .Change-Container {
        width: 448px;
        height: 40.5px;
        background-color: #14375d;
      }

      ^ .Change-Text {
        width: 100;
        height: 40px;
        font-family: Roboto;
        font-size: 14px;
        line-height: 2.86;
        letter-spacing: 0.2px;
        text-align: left;
        color: #ffffff;
        margin-left: 19px;
        display: inline-block;
      }

      ^ .mainMessage-Text {
        height: 16px;
        font-family: Roboto;
        font-size: 14px;
        font-weight: 300;
        letter-spacing: 0.2px;
        text-algin: left;
        color: #093649;
        margin-left: 20px;
        margin-top: 19.5px;
        margin-right: 64px;
        margin-bottom: 10px;
      }

      ^ .close-Button {
        width: 24px;
        height: 24px;
        margin-top: 8.5px;
        margin-right: 16px;
        float: right;
        cursor: pointer;
      }

      ^ .input-Box, .foam-u2-tag-Input, .foam-u2-tag-Select {
        height: 40px;
        width: 408px;
        background-color: #ffffff;
        border: solid 1px rgba(!64, 179, 184, 0.5);
        margin-left: 20px;
        margin-right: 20px;
        padding-left: 5px;
        padding-right: 5px;
        font-size: 12px;
        font-weight: 300;
        letter-spacing: 0.2px;
        font-family: Roboto;
        color: #093649;
        text-align: left;
      }

      ^ .Button, .foam-u2-ActionView {
        width: 135px;
        height: 40px;
        border-radius: 2px;
        background-color: #5e91cb;
        cursor: pointer;
        text-align: center;
        color: #ffffff;
        font-family: Roboto;
        font-size: 14px;
        line-height: 2.86;
        letter-spacing: 0.2px;
        margin-top: 5px;
        margin-left: 293px;
        margin-right: 20px;
        margin-bottom: 20px;
        float: left;
      }

      ^ .foam-u2-ActionView {
        line-height: 0px;
      }

      ^ .foam-u2-ActionView:hover {
        background-color: #5e91cb;
        background: #5e91cb;
      }

      ^ .Button-Container {
        margin: 0;
        margin-top: 20px;
        padding: 0;
        overflow: hidden;
      }

      ^ .cancel-Button, .foam-u2-ActionView-back {
        width: 135px;
        height: 40px;
        border-radius: 2px;
        background-color: rgba(164, 179, 184, 0.1);
        box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
        cursor: pointer;
        text-align: center;
        font-family: Roboto;
        font-size: 14px;
        line-height: 2.86;
        letter-spacing: 0.2px;
        margin-top: 5px;
        margin-left: 20px;
        margin-bottom: 20px;
        position: fixed;
        color: #093649;
      }

      ^ .foam-u2-ActionView-back:hover {
        background-color: rgba(164, 179, 184, 0.1);
        background: rgba(164, 179, 184, 0.1);
      }

      ^ .input-container {
        margin-top: 20px;
      }

      ^ .pDefault {
        margin-bottom: 8px;
        margin-top: 0;
        margin-left: 20px;
        font-family: Roboto;
        font-size: 14px;
        font-weight: 300;
        letter-spacing: 0.2px;
        text-align: left;
        color: #093649;
      }

      ^ .foam-u2-ActionView-closeButton {
        width: 24px;
        height: 24px;
        margin: 0;
        margin-top: -10px;
        margin-right: 20px;
        cursor: pointer;
        display: inline-block;
        float: right;
        border: none;
        background: transparent;
        outline: none;
      }

      ^ .foam-u2-ActionView-closeButton:hover {
        outline: none;
        border: none;
        background: transparent;
      }

      ^ .summary-heading {
        padding: 10px 74px 0px 20px;
        font-family: Roboto;
        font-size: 14px;
        font-weight: bold;
        letter-spacing: 0.2px;
        text-align: left;
        color: #093649;
      }
    */}
    })
  ],

  methods: [
    function initE() {
    this.SUPER();
    var self = this;

    this
      .addClass(this.myClass())
      .start()
        .start().addClass('Message-Container')
          .start().addClass('Change-Container')
            .start().addClass('Change-Text').add(self.title).end()
            .start()
              .add(self.CLOSE_BUTTON)
              .addClass('close-Button')
            .end()
          .end()
          .add(self.messageView$.map(function(f) {
            return foam.u2.ViewSpec.createView(f);
          }))
        .end()
      .end()
    }
  ],

  actions: [
    {
      name: 'closeButton',
      icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij4gICAgPGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiNGRkYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIyIj4gICAgICAgIDxwYXRoIGQ9Ik01IDVsMTQuMTQyIDE0LjE0Mk0xOSA1TDUgMTkiLz4gICAgPC9nPjwvc3ZnPg==',
      code: function (X) {
        X.closeDialog();
      }
    }
  ]
})
