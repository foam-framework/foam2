foam.CLASS({
  package: 'foam.nanos.auth.forgotPassword',
  name: 'ResetPasswordController',
  extends: 'foam.u2.Controller',
  implements:[
    'foam.box.Context'
  ],
  requires: [
    'foam.u2.stack.Stack',
    'foam.u2.stack.StackView',
    'foam.box.HTTPBox',
    'foam.nanos.auth.token.ClientTokenService'
  ],
  exports: [
    'as ctrl',
    'stack',
    'resetPasswordToken'
  ],
  
  css: `
    .stack-wrapper {
      margin-bottom: -10px;
      min-height: calc(80% - 60px);
    }

    .stack-wrapper:after {
      content: "";
      display: block;
    }

    .stack-wrapper:after, .net-nanopay-b2b-ui-shared-FooterView {
      height: 10px;
    }

    .foam-comics-DAOUpdateControllerView .property-transactionLimits .net-nanopay-ui-ActionView-addItem {
      height: auto;
      padding: 3px;
      width: auto;
    }

    .foam-comics-DAOControllerView .foam-u2-view-TableView-row {
      height: 40px;
    }

    .foam-u2-view-TableView .net-nanopay-ui-ActionView {
      height: auto;
      padding: 8px;
      width: auto;
    }
  `,

  properties: [
    {
      name: 'stack',
      factory: function() { return this.Stack.create(); }
    },
    {
      name: 'resetPasswordToken'
    }
  ],
  methods: [
    function init() {
      this.SUPER();
      this.resetPasswordToken = this.ClientTokenService.create({
        delegate: this.HTTPBox.create({url: 'service/resetPasswordToken'})
      });
    },

    function initE() {
      this
        .addClass(this.myClass())
        .start('div').addClass('stack-wrapper')
          .tag({class: 'foam.u2.stack.StackView', data: this.stack, showActions: false})
        .end();
        this.stack.push({ class: 'foam.nanos.auth.forgotPassword.ResetView' });
      },
  ]
  });
