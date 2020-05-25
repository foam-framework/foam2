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
    'stack'
  ],

  requires: [
    'foam.u2.stack.Stack',
    'foam.u2.stack.StackView',
    'foam.u2.detail.VerticalDetailView'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  messages: [
    { name: 'ACTION_LABEL', message: 'Submit' },
    { name: 'SAVE_IN_PROGRESS', message: 'Saving...' },
    { name: 'ERROR_MSG', message: 'Information was not successfully submitted, please try again later' },
    { name: 'ERROR_MSG_DRAFT', message: 'An error occured while saving your progress.' },
    { name: 'SUCCESS_MSG', message: 'Information successfully submitted.' },
    { name: 'SUCCESS_MSG_DRAFT', message: 'Your progress has been saved.' },
  ],

  css: `
    ^ {
      margin: 30px;
    }
    ^ .foam-u2-stack-StackView {
      height: auto;
    }
  `,

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .tag({
          class: 'foam.u2.stack.StackView',
          data$: this.data.subStack$,
          showActions: false
        })
        // .add(this.SUB_STACK)
        .startContext({ data: this })
          .tag(this.DISCARD, { size: 'LARGE' })
          .tag(this.CLOSE, { size: 'LARGE' })
          .tag(this.GO_PREV, { size: 'LARGE' })
          .callIfElse( this.data.isLastWizardlet,
            function() {
              this.tag(this.GO_NEXT, { size: 'LARGE', label: this.ACTION_LABEL });
            },
            function() {
              this.tag(this.GO_NEXT, { size: 'LARGE' });
            })
        .endContext()
        ;
    }
  ],

  actions: [
    {
      name: 'discard',
      confirmationRequired: true,
      code: function(x) {
        x.stack.back();
      }
    },
    {
      name: 'close',
      label: 'Save for Later',
      code: function(x) {
        this.data.save().then(() => {
          x.stack.back();
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
            this.stack.back();
          }
        }).catch(e => {
          x.ctrl.notify(this.ERROR_MSG);
        });
      }
    },
  ]
});