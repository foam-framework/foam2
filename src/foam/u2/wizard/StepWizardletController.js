foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'StepWizardletController',

  requires: [
    'foam.u2.detail.AbstractSectionedDetailView',
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
      name: 'sections',
      documentation: `
        A two-dimensional array of wizardlet index followed by section index
        to foam.layout.Section object.
      `,
      expression: function(wizardlets) {
        return wizardlets.map(wizardlet => {
          return this.AbstractSectionedDetailView.create({
            of: wizardlet.of,
          }).sections;
        });
      }
    },
    {
      name: 'sectionAvailableSlots',
      documentation: `
        Sometimes the slot returned by createIsAvailableFor doesn't
        return the correct value immediately, so to simplify the
        logic of the next() method these are created in advance.

        Array format is similar to sections.
      `,
      expression: function(sections) {
        return [...sections.keys()].map(w => sections[w].map(
          section => section.createIsAvailableFor(
            this.wizardlets[w].data$
          )
        ));
      }
    },
    {
      name: 'currentWizardlet',
      expression: function (subStack$pos) {
        let sectionIndices = this.screenIndexToSection(subStack$pos);
        // sectionIndices[0] is the index of the current wizardlet
        return this.wizardlets[sectionIndices[0]];
      }
    },
    {
      name: 'isLastWizardlet',
      expression: function (subStack$pos, numberOfScreens) {
        return subStack$pos === numberOfScreens - 1;
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
    },
    {
      name: 'numberOfScreens',
      class: 'Int',
      expression: function (sections) {
        return sections.reduce(
          (sum, wizardletSections) => sum + wizardletSections.length, 0);
      }
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
        class: 'foam.u2.detail.SectionView',
        // Note: assumes wizard has at least one wizardlet with at least one section.
        section: this.sections[0][0],
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
        if ( this.subStack.pos >= this.numberOfScreens - 1 ) {
          return this.currentWizardlet.save().then(() => true);
        }
        let previousScreenIndex = this.subStack.pos;
        let screenIndex = this.subStack.pos + 1;

        // Get wizardlet and section indices
        let sectionIndices = this.screenIndexToSection(screenIndex);
        let wizardletIndex = sectionIndices[0];
        let sectionIndex = sectionIndices[1];

        let p = Promise.resolve();
        if ( this.screenIndexToSection(previousScreenIndex)[0] !== wizardletIndex ) {
          console.log('p will save ', this.currentWizardlet.id);
          p = this.currentWizardlet.save();
        }
        return p.then(() => {
          // Get overall index of screen (this is related to subStack position)
          let screenIndex = this.subStack.pos + 1;

          // Get wizardlet and section indices
          let sectionIndices = this.screenIndexToSection(screenIndex);
          let wizardletIndex = sectionIndices[0];
          let sectionIndex = sectionIndices[1];

          console.log('DEBUG INFO', {
            previousScreenIndex: previousScreenIndex,
            screenIndex: screenIndex,
            wizardletIndex: wizardletIndex,
            sectionIndex: sectionIndex,
            section: this.sections[wizardletIndex][sectionIndex],
            numberOfScreens: this.numberOfScreens,
          });

          // Section and wizardlet can be obtained with above indices
          let section = this.sections[wizardletIndex][sectionIndex];
          let wizardlet = this.wizardlets[wizardletIndex];

          // Set the highestIndex, this way if the user hits back and then save
          // it will still save all the wizardlets they visited.
          this.highestIndex = wizardletIndex;
          this.subStack.push({
            class: 'foam.u2.detail.SectionView',
            section: section,
            data$: wizardlet.data$,
          })

          // Automatically push the next section if this one is
          // unavailable.
          let slot = this.sectionAvailableSlots
            [wizardletIndex][sectionIndex];
          if ( ! slot.get() ) {
            return this.next();
          }

          // Return false for "not finished"
          return false;
        });
      },
    },
    function back() {
      this.subStack.back();
    },
    // Returns a tuple of two indices, 0: index corresponding to the wizardlet;
    // and 1: index corresponding to the section under that wizardlet.
    // This is used to locate the next section to display based on the stack
    // position.
    function screenIndexToSection(screenIndex) {
      let i = 0;
      for ( let w = 0 ; w < this.wizardlets.length ; w++ ) {
        let nSections = this.sections[w].length;
        if ( screenIndex >= i && i + nSections > screenIndex ) {
          return [w, screenIndex - i]
        }
        i += nSections;
      }
      return null;
    }
  ]
});