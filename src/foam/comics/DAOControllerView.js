/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.comics',
  name: 'DAOControllerView',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'foam.comics.SearchMode',
    'foam.comics.DAOController',
    'foam.comics.DAOUpdateControllerView',
    'foam.u2.view.ScrollTableView',
    'foam.dao.FnSink',
    'foam.u2.dialog.Popup',
    'net.nanopay.tx.cico.CITransaction',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  imports: [
    'createControllerView? as importedCreateControllerView',
    'data? as importedData',
    'stack',
    'summaryView? as importedSummaryView',
    'updateView? as importedUpdateView',
    'accountDAO as bankAccountDAO',
    'balance',
    'balanceDAO',
    'currencyDAO',
    'currentAccount',
    'transactionDAO',
    'findBalance',
    'findAccount',
    'user',
    'auth',
    'window'
  ],

  exports: [
    'as controllerView',
    'data.selection as selection',
    'data.data as dao',
    'data.searchColumns as searchColumns',
    'amount',
    'bankList',
    'cashOut',
    'cashIn',
    'confirmCashOut',
    'confirmCashIn',
    'dblclick',
    'resetCicoAmount',
    'goToBankAccounts',
    'onCashOutSuccess',
    'onCashInSuccess',
    'as view'
  ],

  css: `
    ^ {
      width: fit-content;
      max-width: 100vw;
      margin: auto;
    }

    ^top-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 10px;
    }

    ^title-container > * {
      color: #555;
      display: inline-block;
      margin: 0.67rem 0;
    }

    ^title-container > * + * {
      margin-left: 1rem;
    }

    ^container {
      display: flex;
    }

    ^container > * + * {
      margin-left: 10px;
    }

    ^ .actions {
      display: inline-block;
      margin-bottom: 8px;
    }

    ^ .actions .net-nanopay-ui-ActionView {
      margin: 0 10px 10px 0;
    }

    ^ .actions button + button {
      margin-left: 8px;
    }

    ^ .net-nanopay-ui-ActionView {
      width: 128px;
      height: 40px;
      background: #0098db;
      color: white;
      border-radius: 4px;
      box-shadow: 0 1px 0 0 rgba(22, 29, 37, 0.05);
      font-weight: 500;
      font-size: 14px;
    }
    ^ .topContainer {
      margin-left: 270px;
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
      class: 'FObjectProperty',
      of: 'foam.comics.DAOController',
      name: 'data',
      expression: function(importedData) {
        return importedData;
      }
    },
    {
      name: 'cls',
      expression: function(data) {
        return data.cls_;
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'summaryView',
      factory: function() {
        return this.data.summaryView || this.importedSummaryView || {
          class: 'foam.u2.view.ScrollTableView'
        };
      }
    },
    {
      name: 'createControllerView',
      expression: function() {
        return this.importedCreateControllerView || {
          class: 'foam.comics.DAOCreateControllerView'
        };
      }
    },
    {
      name: 'updateView',
      expression: function() {
        return this.importedUpdateView || {
          class: 'foam.comics.DAOUpdateControllerView'
        };
      }
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

  reactions: [
    ['data', 'action.create', 'onCreate'],
    ['data', 'edit', 'onEdit'],
    ['data', 'action.findRelatedObject', 'onFindRelated'],
    ['data', 'finished', 'onFinished'],
    ['data', 'export', 'onExport']
  ],

  messages: [
    { name: 'balanceTitle', message: 'Balance' }
  ],

  methods: [
    function initE() {
      var self = this;

      this.getDefaultBank();
      this.auth.check(null, 'cico.ci').then(function(perm) {
        self.hasCashIn = perm;
      });
      this.transactionDAO.listen(this.FnSink.create({ fn: this.onDAOUpdate }));
      this.onDAOUpdate();
      this.currentAccount$.sub(this.onDAOUpdate);

      this.data.border.add(
        this.E()
          .addClass(this.myClass())
          .start('div').addClass('topContainer').show(this.data.showCICO)
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
          .start()
            .addClass(this.myClass('top-row'))
            .start()
              .addClass(this.myClass('title-container'))
              .start('h1')
                .add(this.data.title$)
              .end()
              .add(this.data.subtitle$)
            .end()
            .callIfElse(this.data.primaryAction, function() {
              this.startContext({ data: self })
                .start()
                  .add(self.data.primaryAction)
                .end()
              .endContext();
            }, function() {
              if ( self.data.createLabel ) {
                this.tag(self.cls.CREATE, { label$: self.data.createLabel$ });
              } else {
                this.start().add(self.cls.CREATE).end();
              }
            })
          .end()
          .start()
            .addClass(this.myClass('container'))
            .callIf(this.data.searchMode === this.SearchMode.FULL, function() {
              this.start()
                .hide(self.data.searchHidden$)
                .add(self.cls.PREDICATE.clone().copyFrom({
                  view: { class: 'foam.u2.view.ReciprocalSearch' }
                }))
              .end();
            })
            .start()
              .style({ 'overflow-x': 'auto' })
              .start()
                .addClass('actions')
                .show(self.mode$.map((m) => m === foam.u2.DisplayMode.RW))
                .start()
                  .add(self.cls.getAxiomsByClass(foam.core.Action).filter((action) => {
                    var rtn = true;
                    if ( ! self.primaryAction ) {
                      rtn = rtn && action.name !== 'create';
                    }
                    if ( self.data.searchMode !== self.SearchMode.FULL ) {
                      rtn = rtn && action.name !== 'toggleFilters';
                    }
                    return rtn;
                  }))
                .end()
              .end()
              .callIf(this.data.searchMode === this.SearchMode.SIMPLE, function() {
                this.start().add(self.cls.PREDICATE.clone().copyFrom({
                  view: { class: 'foam.u2.view.SimpleSearch' }
                })).end();
              })
              .start()
                .style({ 'overflow-x': 'auto' })
                .tag(this.summaryView, { data$: this.data.filteredDAO$ })
              .end()
            .end()
          .end());

      this.add(this.data.border);
    },

    function dblclick(obj) {
      if ( this.data.showCICO ) {
        this.stack.push({
          class: 'net.nanopay.tx.ui.TransactionDetailView',
          data: transaction
        });
      } else {
        if ( this.data.dblclick ) {
          this.data.dblclick(obj);
        } else {
          this.onEdit(null, null, obj.id);
        }
      }
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
    function onCreate() {
      this.stack.push({
        class: this.createControllerView.class,
        detailView: this.data.detailView
      }, this);
    },

    function onEdit(s, edit, id) {
      this.stack.push({
        class: this.updateView.class,
        detailView: this.data.detailView,
        key: id
      }, this);
    },

    function onFindRelated() {
      var data = this.DAOController.create({
        data: this.data.relationship.targetDAO,
        addEnabled: true,
        relationship: this.data.relationship
      });

      this.stack.push({
        class: 'foam.comics.DAOControllerView',
        data: data
      }, this);
    },

    function onFinished() {
      this.stack.back();
    },

    function onExport(dao) {
      this.add(this.Popup.create().tag({
        class: 'foam.u2.ExportModal',
        exportData: dao.src.filteredDAO
      }));
    },

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
