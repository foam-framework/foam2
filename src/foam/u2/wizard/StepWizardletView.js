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
    'foam.u2.dialog.Popup',
    'foam.u2.dialog.SimpleActionDialog',
    'foam.u2.stack.Stack',
    'foam.u2.stack.StackView',
    'foam.u2.detail.VerticalDetailView',
    'foam.u2.layout.Grid',
    'foam.u2.layout.GUnit',
    'foam.u2.wizard.StepWizardletStepsView',
    'foam.u2.wizard.util.CircleIndicator'
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

      /* this view handles its own scrolling */
      height: 100%;
    }
    ^status {
      background-color: %WHITE%;
      padding: 50px;
    }
    ^entry {
      background-color: %GREY5%;
      padding: 50px;
      overflow-y: scroll;
    }
    ^entry ^top-buttons {
      float: right;
      margin-bottom: 15px;
    }
    ^buttons {
      height: 50px;
    }
    ^ .foam-u2-stack-StackView {
      height: auto;
    }
    ^fix-grid {
      height: 100%;
    }
  `,

  properties: [
    {
      name: 'onClose',
      class: 'Function',
      factory: () => () => {}
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
            .addClass(this.myClass('entry'))
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
            .tag({
              class: 'foam.u2.stack.StackView',
              data$: this.data.subStack$,
              showActions: false
            })
            // This should work!; Worth investigating why Stack
            //   can't be rendered this way:
            // .add(this.SUB_STACK)
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
          actionWrap(this.CLOSE),
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
      confirmationRequired: true,
      code: function(x) {
        this.onClose(x);
      }
    },
    {
      name: 'close',
      label: 'Save for Later',
      code: function(x) {
        this.data.save().then(() => {
          this.onClose(x);
        }).catch(e => {
          x.ctrl.notify(this.ERROR_MSG_DRAFT);
        });
      }
    },
    {
      name: 'goPrev',
      label: 'back',
      code: function() {
        this.data.back();
      }
    },
    {
      name: 'goNext',
      label: 'next',
      code: function(x) {
        this.data.next().then((isFinished) => {
          if ( isFinished ) {
            this.onClose(x);
          }
        }).catch(e => {
          x.ctrl.notify(this.ERROR_MSG);
        });
      }
    },
  ]
});