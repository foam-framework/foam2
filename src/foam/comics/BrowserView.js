/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'foam.comics',
  name: 'BrowserView',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'foam.comics.DAOController',
    'foam.comics.DAOControllerView',
    'foam.dao.FnSink',
    'foam.u2.dialog.Popup',
    'net.nanopay.tx.cico.CITransaction',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  imports: [
    'accountDAO as bankAccountDAO',
    'balance',
    'balanceDAO',
    'currencyDAO',
    'currentAccount',
    'transactionDAO',
    'findBalance',
    'findAccount',
    'stack',
    'user',
    'auth',
    'window'
  ],

  exports: [
    'amount',
    'bankList',
    'cashOut',
    'cashIn',
    'confirmCashOut',
    'confirmCashIn',
    'controller as data',
    'dblclick',
    'summaryView',
    'createControllerView',
    'updateView',
    'resetCicoAmount',
    'goToBankAccounts',
    'onCashOutSuccess',
    'onCashInSuccess',
    'as view'
  ],

  css: `
    ^ .topContainer {
      margin-left: 260px;
      width: 100%;
    }
    ^ .balanceBox {
      position: relative;
      min-width: 330px;
      max-width: calc(100% - 135px);
      padding-bottom: 15px;
      border-radius: 2px;
      background-color: #ffffff;
      box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.01);
      display: inline-block;
      vertical-align: middle;
    }
    ^ .sideBar {
      width: 6px;
      height: 100%;
      background-color: %SECONDARYCOLOR%;
      position: absolute;
    }
    ^ .balanceBoxTitle {
      color: #093649;
      font-size: 12px;
      margin-left: 44px;
      padding-top: 14px;
      line-height: 1.33;
      letter-spacing: 0.2px;
    }
    ^ .balance {
      font-size: 30px;
      font-weight: 300;
      line-height: 1;
      letter-spacing: 0.5px;
      overflow-wrap: break-word;
      text-align: left;
      color: #093649;
      margin-top: 27px;
      margin-left: 44px;
      margin-right: 44px;
    }
    ^ .inlineDiv {
      display: inline-block;
      width: 135px;
      vertical-align: middle;
    }
    ^ .net-nanopay-ui-ActionView-cashInBtn {
      width: 135px;
      height: 50px;
      border-radius: 2px;
      background: %SECONDARYCOLOR%;
      color: white;
      margin: 0;
      padding: 0;
      border: 0;
      outline: none;
      cursor: pointer;
      line-height: 50px;
      font-size: 14px;
      font-weight: normal;
      box-shadow: none;
    }
    ^ .net-nanopay-ui-ActionView-cashInBtn:hover {
      background: %SECONDARYCOLOR%;
      opacity: 0.9;
    }
    ^ .net-nanopay-ui-ActionView-cashOutButton {
      width: 135px;
      height: 50px;
      border-radius: 2px;
      background: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
      color: #093649;
      margin: 0;
      padding: 0;
      border: 0;
      outline: none;
      cursor: pointer;
      line-height: 50px;
      font-size: 14px;
      font-weight: normal;
      margin-bottom: 2px;
    }
    ^ .net-nanopay-ui-ActionView-cashOutButton:hover {
      background: lightgray;
    }
  `,

  properties: [
    {
      name: 'data'
    },
    {
      name: 'title',
      expression: function(data$of) {
        return 'Browse ' + data$of.model_.plural;
      }
    },
    {
      class: 'String',
      name: 'subtitle'
    },
    {
      class: 'String',
      name: 'customDAOController'
    },
    {
      class: 'String',
      name: 'createLabel',
      documentation: 'Set this to override the create button label.'
    },
    {
      class: 'Enum',
      of: 'foam.comics.SearchMode',
      name: 'searchMode',
      documentation: `
        The level of search capabilities that the controller should have.
      `
    },
    {
      class: 'Boolean',
      name: 'createEnabled',
      documentation: 'True to enable the create button.'
    },
    {
      class: 'Boolean',
      name: 'editEnabled',
      documentation: 'True to enable the edit button.'
    },
    {
      class: 'Boolean',
      name: 'selectEnabled',
      documentation: 'True to enable the select button.'
    },
    {
      class: 'Boolean',
      name: 'addEnabled',
      documentation: `
        True to enable the Add button for adding to a relationship.
      `
    },
    {
      class: 'Boolean',
      name: 'exportEnabled',
      documentation: 'True to enable the export button.'
    },
    {
      class: 'Boolean',
      name: 'toggleEnabled',
      documentation: 'True to enable the toggle filters button.'
    },
    {
      name: 'controller',
      expression: function(
        data,
        title,
        subtitle,
        customDAOController,
        createLabel,
        searchMode,
        createEnabled,
        editEnabled,
        selectEnabled,
        addEnabled,
        exportEnabled,
        toggleEnabled,
        detailView
      ) {
        var config = {};

        if ( createLabel ) config.createLabel = createLabel;
        if ( searchMode )  config.searchMode  = searchMode;
        if ( subtitle )    config.subtitle    = subtitle;
        if ( title )       config.title       = title;
        config.addEnabled    = addEnabled;
        config.createEnabled = createEnabled;
        config.detailView    = detailView;
        config.editEnabled   = editEnabled;
        config.exportEnabled = exportEnabled;
        config.selectEnabled = selectEnabled;
        config.toggleEnabled = toggleEnabled;

        if ( customDAOController ) {
          var controller = this.__context__.lookup(customDAOController).create(config, this);

          // Let the custom controller override the dao used.
          controller.data = controller.data || data;

          return controller;
        }

        config.data = data;
        return this.DAOController.create(config, this);
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'summaryView',
      // TODO: remove next line when permanently fixed in ViewSpec
      fromJSON: function fromJSON(value, ctx, prop, json) { return value; }
    },
    // This is the DAOUpdateControllerView, not the DetailView
    'updateView',
    // This is the DAOCreateControllerView, not the DetailView
    'createControllerView',
    {
      class: 'String',
      name: 'detailView',
      value: 'foam.u2.DetailView'
    },
    {
      class: 'Currency',
      name: 'amount'
    },
    {
      name: 'formattedBalance',
      value: '...'
    },
    {
      class: 'Boolean',
      name: 'hasCashIn'
    },
    {
      name: 'userBankAccounts',
      factory: function() {
        return this.bankAccountDAO.where(
          this.AND(
            this.EQ(this.BankAccount.OWNER, this.user.id),
            this.EQ(this.BankAccount.STATUS, this.BankAccountStatus.VERIFIED)
          )
        );
      }
    },
    {
      name: 'bankList',
      view: function(_, X) {
        var self = X.view;
        return foam.u2.view.ChoiceView.create({
          dao: self.userBankAccounts,
          objToChoice: function(a) {
            return [a.id, a.name];
          }
        });
      }
    },
    {
      class: 'Boolean',
      name: 'isLoading',
      value: true
    }
  ],

  messages: [
    { name: 'balanceTitle', message: 'Balance' }
  ],

  methods: [
    function initE() {
      var self = this;
      // this.getDefaultBank();

      this.auth.check(null, 'cico.ci').then(function(perm) {
        self.hasCashIn = perm;
      });

      this.transactionDAO.listen(this.FnSink.create({ fn: this.onDAOUpdate }));
      this.onDAOUpdate();
      this.currentAccount$.sub(this.onDAOUpdate);

      this
        .addClass(this.myClass())

        .start('div').addClass('topContainer')
          .start('div').addClass('balanceBox')
            .start('div').addClass('sideBar').end()
            .start().add(this.balanceTitle).addClass('balanceBoxTitle').end()
            .start().add(this.formattedBalance$).addClass('balance').end()
          .end()
          .start('div').addClass('inlineDiv')
            .start().show(this.hasCashIn$).add(this.CASH_IN_BTN).end()
            .start().add(this.CASH_OUT_BUTTON).end()
          .end()
        .end()
        
        .addClass(this.myClass(this.data.of.id.replace(/\./g, '-')))
        .tag(this.DAOControllerView);
    },

    function dblclick(transaction) {
      this.stack.push({
        class: 'net.nanopay.tx.ui.TransactionDetailView',
        data: transaction
      });
    },

    function cashIn() {
      this.add(this.Popup.create().tag({
        class: 'net.nanopay.cico.ui.ci.CashInModal'
      }));
    },

    function confirmCashIn() {
      this.add(this.Popup.create().tag({
        class: 'net.nanopay.cico.ui.ci.ConfirmCashInModal'
      }));
    },

    function onCashInSuccess() {
      this.add(this.Popup.create().tag({
        class: 'net.nanopay.cico.ui.ci.CashInSuccessModal'
      }));
    },

    function cashOut() {
      this.add(this.Popup.create().tag({
        class: 'net.nanopay.cico.ui.co.CashOutModal'
      }));
    },

    function confirmCashOut() {
      this.add(this.Popup.create().tag({
        class: 'net.nanopay.cico.ui.co.ConfirmCashOutModal'
      }));
    },

    function onCashOutSuccess() {
      this.add(this.Popup.create().tag({
        class: 'net.nanopay.cico.ui.co.CashOutSuccessModal'
      }));
    },

    function goToBankAccounts() {
      this.stack.push({
        class: 'net.nanopay.cico.ui.bankAccount.BankAccountsView'
      });
      this.window.location.hash = 'set-bank';
    },

    function resetCicoAmount() {
      this.amount = 0;
    },

    function getDefaultBank() {
      var self = this;
      self.userBankAccounts
          .where(self.EQ(self.BankAccount.IS_DEFAULT, true))
          .select()
          .then(function(result) {
            if ( result.array.length == 0 ) return;
            self.bankList = result.array[0].id;
          });
    }
  ],

  actions: [
    {
      name: 'cashInBtn',
      label: 'Cash In',
      code: function(X) {
        X.resetCicoAmount();
        X.cashIn();
      }
    },
    {
      name: 'cashOutButton',
      label: 'Cash Out',
      code: function(X) {
        X.resetCicoAmount();
        X.cashOut();
      }
    }
  ],

  listeners: [
    {
      name: 'onDAOUpdate',
      code: function onDAOUpdate() {
        this.balanceDAO.find(this.currentAccount.id).then((balance) => {
          var amount = 0;

          if ( balance != null ) {
            this.balance.copyFrom(balance);
            amount = this.balance.balance;
          }

          this.currencyDAO
            .find(this.currentAccount.denomination)
            .then((currency) => {
              this.formattedBalance = currency.format(amount);
            });
        });
      }
    }
  ]
});
