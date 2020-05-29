foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'StepWizardletController',

  requires: [
    'foam.u2.detail.VerticalDetailView',
    'foam.u2.stack.Stack'
  ],

  properties: [
    {
      class: 'String',
      name: 'title'
    },
    {
      name: 'wizardlets',
      class: 'FObjectArray',
      of: 'foam.u2.wizard.Wizardlet'
    },
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
      this.stackContext = this.__subContext__.createSubContext();
      this.stackContext.register(
        this.VerticalDetailView,
        'foam.u2.detail.SectionedDetailView'
      );
      this.subStack.push({
        class: 'foam.u2.detail.VerticalDetailView',
        data$: this.wizardlets[0].data$,
      });
    },
    function saveProgress() {
      var p = Promise.resolve();
      return this.wizardlets.slice(0, this.highestIndex).reduce(
        (p, wizardlet) => p.then(() => wizardlet.save()), p
      );
    },
    {
      name: 'next',
      documentation: `
        Saves the current wizardlet, then updates subStack to
        display the next wizard item, or returns true IFF the
        current wizardlet is already the last one.
      `,
      code: function next() {
        return this.currentWizardlet.save().then(() => {
          if ( this.subStack.pos < this.wizardlets.length - 1 ) {
            let newIndex = this.subStack.pos + 1;
            this.highestIndex = newIndex;
            this.subStack.push({
              class: 'foam.u2.detail.VerticalDetailView',
              data$: this.wizardlets[newIndex].data$,
            })
            return false; // isFinished
          } else {
            return true; // isFinished
          }
        });
      },
    },
    function back() {
      this.subStack.back();
    }
  ]
});