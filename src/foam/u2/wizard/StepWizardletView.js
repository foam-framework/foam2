/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'StepWizardletView',
  extends: 'foam.u2.wizard.WizardletView',

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

  properties: [
    {
      name: 'subStack',
      class: 'FObjectProperty',
      of: 'foam.u2.stack.Stack',
      view: {
        class: 'foam.u2.stack.StackView',
        showActions: false
      },
      factory: function () {
        return this.Stack.create();
      }
    },
    {
      name: 'currentWizardlet',
      expression: function (subStack$pos) {
        return this.wizardlets[subStack$pos];
      }
    },
    {
      name: 'isLastWizardlet',
      expression: function (subStack$pos) {
        return subStack$pos === this.wizardlets.length - 1;
      }
    },
    {
      name: 'highestIndex',
      documentation: `
        Tracks the highest index visited so that "save & exit"
        can save all visited wizardlets.
      `
    },
    {
      name: 'stackContext'
    }
  ],

  methods: [
    function init() {
      this.stackContext =
        this.__subSubContext__.createSubContext({ fu:'bar' });
      this.stackContext.register(
        // this.VerticalDetailView,
        foam.u2.detail.VerticalDetailView,
        'foam.u2.detail.SectionedDetailView'
      );

      this.subStack.push({
        class: 'foam.u2.detail.VerticalDetailView',
        data: this.wizardlets[0].data,
      }, this.stackContext);
    },
    function initE() {
      this
        .addClass(this.myClass())
        .start('h1').add(this.title).end()
        .tag({
          class: 'foam.u2.stack.StackView',
          data: this.subStack,
          showActions: false
        })
        // .add(this.SUB_STACK)
        .startContext({ data: this })
          .tag(this.DISCARD, { size: 'LARGE' })
          .tag(this.CLOSE, { size: 'LARGE' })
          .tag(this.GO_PREV, { size: 'LARGE' })
          .callIfElse( this.isLastWizardlet,
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
        var p = Promise.resolve();
        this.wizardlets.slice(0, this.highestIndex).reduce(
          (p, wizardlet) => p.then(() => wizardlet.save()), p
        ).then(() => {
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
        this.subStack.back();
      }
    },
    {
      name: 'goNext',
      label: 'next',
      code: function(x) {
        this.currentWizardlet.save().then(() => {
          if ( this.subStack.pos < this.wizardlets.length - 1 ) {
            let newIndex = this.subStack.pos + 1;
            this.highestIndex = newIndex;
            this.subStack.push(this.wizardlets[newIndex].data,
              this.stackContext);
          } else {
            this.stack.back();
            x.ctrl.notify(this.ERROR_MSG_DRAFT);
          }
        }).catch(e => {
          x.ctrl.notify(this.ERROR_MSG);
        });
      }
    },
  ]
});