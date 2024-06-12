/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'IncrementalStepWizardView',
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
    'foam.u2.detail.SectionView',
    'foam.u2.dialog.Popup',
    'foam.u2.dialog.SimpleActionDialog',
    'foam.u2.stack.Stack',
    'foam.u2.stack.StackView',
    'foam.u2.detail.VerticalDetailView',
    'foam.u2.layout.Grid',
    'foam.u2.layout.GUnit',
    'foam.u2.LoadingSpinner',
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
    { name: 'ERROR_MSG_DRAFT', message: 'An error occured while saving your progress' },
    { name: 'SUCCESS_MSG', message: 'Information successfully submitted' },
    { name: 'SUCCESS_MSG_DRAFT', message: 'Your progress has been saved' },
    { name: 'CONFIRM_MSG', message: 'Exit' },
    { name: 'DISMISS_MSG', message: 'Are you sure you want to leave this screen?' },
    { name: 'CONTINUE_MSG', message: 'Go back' }
  ],

  css: `
    ^ {
      position: relative;
      height: auto;
      background-color: /*%GREY5%*/ #f5f7fa;
      max-height: 85vh;
      height: 100%;
    }
    ^fullscreen {
      display: flex;
      flex-direction: column;
      background-color: white !important;
      position: fixed !important;
      top: 0;
      left: 0;
      height: 100vh !important;
      width: 100vw;
      max-height: 100vh !important;
      z-index: 950;
      margin: 0;
      padding: 0;
    }
    ^status {
      background-color: %WHITE%;
      padding: 50px;
      padding-top: 100px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    ^hide-X-status {
      background-color: %WHITE%;
      padding: 50px;
      padding-top: 75px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    ^rightside {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background-color: /*%GREY5%*/ #f5f7fas;
      overflow-y: hidden;
    }
    ^rightside ^entry {
      flex-grow: 1;
      -webkit-mask-image: -webkit-gradient(linear, left 15, left top, from(rgba(0,0,0,1)), to(rgba(0,0,0,0)));
      overflow-y: auto;
      padding: 0px 50px 100px 50px;
    }
    ^rightside ^hide-X-entry {
      flex-grow: 1;
      -webkit-mask-image: -webkit-gradient(linear, left 15, left top, from(rgba(0,0,0,1)), to(rgba(0,0,0,0)));
      overflow-y: auto;
      padding: 50px 50px 100px 50px;
    }
    ^rightside ^top-buttons {
      text-align: right;
      margin-bottom: 15px;
      padding: 25px;
      padding-bottom: 0;
    }
    ^rightside ^bottom-buttons {
      background-color: %GREY6%;
      padding: 0 50px 25px 50px;
      text-align: right;
    }
    ^buttons {
      display: flex;
      justify-content: flex-end;
    }
    ^loading-spinner {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      width: 100%;
    }
    ^loading-spinner .foam-u2-LoadingSpinner {
      margin-bottom: 50px;
    }
    ^loading-spinner img {
      width: 100px;
      height: 100px;
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
    },
    {
      name: 'fullScreen',
      class: 'Boolean',
      value: false
    },
    {
      name: 'hideX',
      class: 'Boolean',
      value: true
    },
    {
      name: 'backDisabled',
      class: 'Boolean',
      value: false
    },
    {
      class: 'Boolean',
      name: 'isLoading_',
      documentation: `Condition to synchronize code execution and user response.`,
      value: false
    },
    {
      name: 'loadingSpinner',
      factory: function() {
        return this.LoadingSpinner.create();
      }
    }
  ],

  methods: [
    function initE() {
      var btn = { size: 'LARGE' };
      var self = this;

      this
        .addClass(this.myClass())
        .enableClass(this.myClass('fullscreen'), this.fullScreen$)
        .start(this.Grid)
          .addClass(this.myClass('fix-grid'))
          .start(this.GUnit, { columns: 4 })
            .addClass(this.hideX ? this.myClass('hide-X-status') : this.myClass('status'))
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
            .add(this.slot(function(hideX) {
              return hideX ?
                null :
                this.E().addClass(this.myClass('top-buttons'))
                .start(this.CircleIndicator, {
                  label: 'X',
                  borderThickness: 2,
                  borderColor: this.theme.grey2,
                  borderColorHover: this.theme.primary1,
                  clickable: true
                })
                .on('click', () => this.showExitPrompt())
                .end();
            }))
            .start()
              .addClass(this.hideX ? this.myClass('hide-X-entry') : this.myClass('entry'))
              .start()
                .add(this.slot(function (data, data$currentWizardlet, data$currentSection, isLoading_) {
                  if ( isLoading_ ) {
                    return this.E().start().addClass(self.myClass('loading-spinner'))
                      .add(this.loadingSpinner)
                      .end();
                  }

                  return data$currentSection.createView();
                }))
              .end()
            .end()
            .start()
              .addClass(this.myClass('bottom-buttons'))
              .add(this.slot(function (data$isLastScreen, isLoading_) {
                return this.E()
                  .startContext({ data: self })
                  .addClass(self.myClass('buttons'))
                  .tag(this.GO_PREV, btn)
                  .tag(this.GO_NEXT,
                    data$isLastScreen
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
      prompt = this.Popup.create({ closeable: false }).tag(this.SimpleActionDialog, {
        title: this.CONFIRM_MSG,
        body: this.DISMISS_MSG,
        actions: [
          this.Action.create({
            name: 'cancel',
            label: this.CONTINUE_MSG,
            code: () => {
              prompt.close();
            }
          }),
          actionWrap(this.SAVE_AND_CLOSE),
          actionWrap(this.DISCARD)
        ]
      });
      ctrl.add(prompt);
    }
  ],

  actions: [
    {
      name: 'discard',
      label: 'Dismiss',
      isAvailable: function () {
        return this.showDiscardOption;
      },
      confirmationRequired: function() {
        return true;
      },
      code: function(x) {
        this.onClose(x, false);
      }
    },
    {
      name: 'saveAndClose',
      label: 'Save and exit',
      code: function(x) {
        this.data.saveProgress().then(() => {
          this.onClose(x, false);
        }).catch(e => {
          console.error(e);
          x.ctrl.notify(this.ERROR_MSG_DRAFT, '', this.LogLevel.ERROR, true);
        });
      }
    },
    {
      name: 'goPrev',
      label: 'Back',
      isEnabled: function (data$canGoBack) {
        return data$canGoBack;
      },
      isAvailable: function (backDisabled, isLoading_) {
        return ! backDisabled && ! isLoading_;
      },
      code: function() {
        this.data.back();
      }
    },
    {
      name: 'goNext',
      label: 'Next',
      isEnabled: function (data$canGoNext, isLoading_) {
        return data$canGoNext && ! isLoading_;
      },
      isAvailable: function (isLoading_) {
        return ! isLoading_;
      },
      code: function(x) {
        this.isLoading_ = true;
        this.data.next().then((isFinished) => {
          if ( isFinished ) {
            this.onClose(x, true);
          }
        }).catch(e => {
          console.error(e);
          x.ctrl.notify(this.ERROR_MSG, '', this.LogLevel.ERROR, true);
        }).finally(() => {
          this.isLoading_ = false;
        });
      }
    }
  ]
});
