/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'StepWizardletView',
  extends: 'foam.u2.View',

  documentation: `Displays wizardlets in individual screens.`,

  imports: [
    'notify',
    'stack',
    'theme'
  ],

  requires: [
    'foam.core.Action',
    'foam.log.LogLevel',
    'foam.u2.dialog.Popup',
    'foam.u2.dialog.SimpleActionDialog',
    'foam.u2.stack.Stack',
    'foam.u2.stack.StackView',
    'foam.u2.detail.VerticalDetailView',
    'foam.u2.layout.Grid',
    'foam.u2.layout.GUnit',
    'foam.u2.wizard.StepWizardletStepsView',
    'foam.u2.tag.CircleIndicator'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  messages: [
    { name: 'ACTION_LABEL', message: 'Submit' },
    { name: 'CANCEL_LABEL', message: 'Cancel' },
    { name: 'SAVE_IN_PROGRESS', message: 'Saving...' },
    { name: 'ERROR_MSG', message: 'Information was not successfully submitted, please try again later' },
    { name: 'ERROR_MSG_DRAFT', message: 'An error occured while saving your progress.' },
    { name: 'SUCCESS_MSG', message: 'Information successfully submitted.' },
    { name: 'SUCCESS_MSG_DRAFT', message: 'Your progress has been saved.' },
  ],

  css: `
    ^ {
      position: relative;
      height: auto;
      background-color: %GREY5%;
      max-height: 95vh;
      height: 100%;
    }
    ^status {
      background-color: %WHITE%;
      padding: 50px;
      overflow-y: scroll;
      display: flex;
      flex-direction: column;
    }
    ^rightside {
      display: flex;
      flex-direction: column;
      background-color: %GREY5%;
      overflow-y: hidden;
    }
    ^rightside ^entry {
      flex-grow: 1;
      -webkit-mask-image: -webkit-gradient(linear, left 15, left top, from(rgba(0,0,0,1)), to(rgba(0,0,0,0)));
      overflow-y: scroll;
      padding: 0 50px;
    }
    ^rightside ^top-buttons {
      text-align: right;
      margin-bottom: 15px;
      padding: 50px;
      padding-bottom: 0;
    }
    ^rightside ^bottom-buttons {
      background-color: %GREY6%;
      padding: 25px 50px;
      text-align: right;
    }
    ^ .foam-u2-stack-StackView {
      height: auto;
      margin-bottom: 30px;
    }
    ^fix-grid {
      height: 100%;
    }
    ^fix-grid.foam-u2-layout-Grid {
      grid-gap: 0;
    }
  `,

  properties: [
    {
      name: 'onClose',
      class: 'Function'
    },
    {
      name: 'showDiscardOption',
      class: 'Boolean'
    }
  ],

  methods: [
    function initE() {
      var btn = { size: 'LARGE' };
      var self = this;

      this
        .addClass(this.myClass())
        .start(this.Grid)
          .addClass(this.myClass('fix-grid'))
          .start(this.GUnit, { columns: 4 })
            .addClass(this.myClass('status'))
            .add(
              this.slot(function (data, data$currentWizardlet) {
                return this.StepWizardletStepsView.create({
                  data: data,
                });
              })
            )
          .end()
          .start(this.GUnit, { columns: 8 })
            .addClass(this.myClass('rightside'))
            .start().addClass(this.myClass('top-buttons'))
              .start(this.CircleIndicator, {
                label: 'X',
                borderThickness: 2,
                borderColor: this.theme.grey2,
                borderColorHover: this.theme.primary1,
                clickable: true
              })
                .on('click', function () {
                  self.showExitPrompt();
                })
              .end()
            .end()
            .start()
              .addClass(this.myClass('entry'))
              .start()
                .add(this.data.SUB_STACK)
              .end()
            .end()
            .start()
              .addClass(this.myClass('bottom-buttons'))
              .add(this.slot(function (data$isLastWizardlet) {
                return this.E()
                  .startContext({ data: self })
                  .addClass(self.myClass('buttons'))
                  .tag(this.GO_PREV, btn)
                  .tag(this.GO_NEXT,
                    data$isLastWizardlet
                      ? { ...btn, label: this.ACTION_LABEL }
                      : btn
                  )
                  .endContext();
              }))
            .end()
          .end()
        .end()
        ;
    },
    function showExitPrompt() {
      var prompt = null;
      var actionWrap = action => {
        let a = action.clone();
        a.code = action.code.bind(this, this.__subSubContext__);
        return a;
      }
      prompt = this.Popup.create().tag(this.SimpleActionDialog, {
        title: 'Confirm Wizard Cancellation',
        body: 'You are closing this wizard. How do you wish to proceed?',
        actions: [
          actionWrap(this.DISCARD),
          actionWrap(this.SAVE_AND_CLOSE),
          this.Action.create({
            name: 'cancel',
            label: 'Cancel',
            code: () => {
              prompt.close();
            }
          })
        ]
      });
      ctrl.add(prompt);
    }
  ],

  actions: [
    {
      name: 'discard',
      label: 'Discard Changes',
      isAvailable: function () {
        return this.showDiscardOption;
      },
      confirmationRequired: true,
      code: function(x) {
        this.onClose(x);
      }
    },
    {
      name: 'saveAndClose',
      label: 'Save for Later',
      code: function(x) {
        this.data.saveProgress().then(() => {
          this.onClose(x);
        }).catch(e => {
          console.error(e);
          x.ctrl.notify(this.ERROR_MSG_DRAFT, '', this.LogLevel.ERROR, true);
        });
      }
    },
    {
      name: 'goPrev',
      label: 'back',
      isEnabled: function (data$canGoBack) {
        return data$canGoBack;
      },
      code: function() {
        this.data.back();
      }
    },
    {
      name: 'goNext',
      label: 'next',
      isEnabled: function (data$isLastWizardlet, data$currentWizardlet) {
        return data$isLastWizardlet || data$currentWizardlet.validate();
      },
      code: function(x) {
        this.data.next().then((isFinished) => {
          if ( isFinished ) {
            this.onClose(x);
          }
        }).catch(e => {
          console.error(e);
          x.ctrl.notify(this.ERROR_MSG, '', this.LogLevel.ERROR, true);
        });
      }
    }
  ]
});