/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'StepWizardletController',

  requires: [
    'foam.core.ArraySlot',
    'foam.u2.detail.AbstractSectionedDetailView',
    'foam.u2.detail.VerticalDetailView',
    'foam.u2.stack.Stack',
    'foam.u2.wizard.WizardPosition',
    'foam.u2.wizard.StepWizardConfig'
  ],

  properties: [
    {
      class: 'String',
      name: 'title'
    },
    {
      name: 'config',
      class: 'FObjectProperty',
      of: 'foam.u2.wizard.StepWizardConfig',
      factory: function() {
        return this.StepWizardConfig.create();
      }
    },
    {
      name: 'wizardlets',
      class: 'FObjectArray',
      of: 'foam.u2.wizard.Wizardlet'
    },
    {
      name: 'wizardPosition',
      documentation: `
        Wizardlet position
      `,
      class: 'FObjectProperty',
      of: 'foam.u2.wizard.WizardPosition',
      factory: function() {
        return this.WizardPosition.create({
          wizardletIndex: 0,
          sectionIndex: 0,
        });
      },
      postSet: function(_, n) {
        this.highestIndex = Math.max(this.highestIndex, n.wizardletIndex);
      }
    },
    {
      name: 'sections',
      documentation: `
        A two-dimensional array of wizardlet index followed by section index
        to foam.layout.Section object.
      `,
      expression: function(wizardlets) {
        return wizardlets.map(w => w.sections);
      }
    },
    {
      name: 'wizardletAvailableSlots',
      documentation: `
        Used to gather all the slots across all the Wizardlets so that nextScreen can change
        depending on the availablity of all the wizardlets

        Array format is similar to sections.
      `,
      expression: function(wizardlets) {
        var availableSlots = wizardlets.map(wizardlet =>  wizardlet.isAvailable$)
        availableSlots.forEach(availableSlot => {
            availableSlot.sub(() => {
              this.wizardPosition = this.WizardPosition.create({
                wizardletIndex: this.wizardPosition.wizardletIndex,
                sectionIndex: this.wizardPosition.sectionIndex
              });
            });
          });
        return availableSlots;
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
        var availableSlots = [...sections.keys()]
          .map(w => sections[w].map(section => section.isAvailable$));

        availableSlots.forEach((sections, wizardletIndex) => {
          sections.forEach((availableSlot, sectionIndex) => {
            var listenerPos = this.WizardPosition.create({
              wizardletIndex: wizardletIndex,
              sectionIndex: sectionIndex,
            });
            availableSlot.sub(() => {
              this.onWizardPositionAvailabilityUpdate(
                listenerPos, availableSlot.get());
            });
          });
        });
        return availableSlots;
      }
    },
    {
      name: 'currentWizardlet',
      expression: function(wizardlets, wizardPosition) {
        return wizardlets[wizardPosition.wizardletIndex];
      }
    },
    {
      name: 'currentSection',
      expression: function(sections, wizardPosition) {
        this.currentWizardlet = this.wizardlets[wizardPosition.wizardletIndex];
        return this.currentWizardlet.currentSection = sections[wizardPosition.wizardletIndex][wizardPosition.sectionIndex];
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
      name: 'previousScreen',
      expression: function(sectionAvailableSlots, wizardPosition) {
        var decr = pos => {
          let subWi = pos.wizardletIndex;
          let subSi = pos.sectionIndex;
          if ( subSi == 0 ) {
            if ( subWi == 0 ) return null;
            subWi--;
            // Skip past steps with no sections
            while ( sectionAvailableSlots[subWi].length < 1 ) subWi--;
            if ( subWi < 0 ) return null;
            subSi = sectionAvailableSlots[subWi].length - 1;
          } else {
            subSi--;
          }
          return this.WizardPosition.create({
            wizardletIndex: subWi,
            sectionIndex: subSi,
          });
        };

        for ( let p = decr(wizardPosition) ; p != null ; p = decr(p) ) {
          if ( ! this.wizardlets[p.wizardletIndex].isVisible ) {
            continue;
          }

          if ( 
            sectionAvailableSlots[p.wizardletIndex].length > 0 && 
            sectionAvailableSlots[p.wizardletIndex][p.sectionIndex].get() 
            ) {
            return p;
          }

          if ( p.sectionIndex < -1 ) return null;
        }

        return null;
      }
    },
    {
      name: 'nextScreen',
      expression: function(sectionAvailableSlots, wizardPosition, wizardletAvailableSlots) {
        var incr = pos => {
          let subWi = pos.wizardletIndex;
          let subSi = pos.sectionIndex;
          if ( subSi >= sectionAvailableSlots[subWi].length - 1 ) {
            if ( subWi >= this.wizardlets.length - 1 ) return null;
            subSi = 0;
            subWi++;
          } else {
            subSi++;
          }
          return this.WizardPosition.create({
            wizardletIndex: subWi,
            sectionIndex: subSi,
          });
        };

        for ( let p = incr(wizardPosition) ; p != null ; p = incr(p) ) {
          // Skip invisible wizardlets
          if ( ! this.wizardlets[p.wizardletIndex].isVisible ) {
            continue;
          }

          // Land on an available section
          if ( 
            sectionAvailableSlots[p.wizardletIndex].length > 0 && 
            sectionAvailableSlots[p.wizardletIndex][p.sectionIndex].get() 
            ) {
            return p;
          }
        }

        return null;
      }
    },
    {
      name: 'isLastScreen',
      expression: function(nextScreen) {
        return nextScreen == null;
      }
    },
    {
      name: 'canGoBack',
      class: 'Boolean',
      documentation: `
        If the first screen has no available sections, then the back button
        should be disabled.
      `,
      expression: function(previousScreen) {
        return previousScreen != null;
      }
    },
    {
      name: 'canGoNext',
      class: 'Boolean',
      expression: function(currentWizardlet$isValid, config$allowSkipping) {
        return currentWizardlet$isValid || config$allowSkipping;
      }
    },
    {
      name: 'availabilityInvalidate',
      class: 'Int'
    },
    {
      name: 'submitted',
      class: 'Boolean'
    }
  ],

  methods: [
    function init() {
      console.log('stepWizardlet', this);
      this.wizardlets.forEach(wizardlet => {
        wizardlet.isAvailable$.sub(() => {
          this.availabilityInvalidate++;
        })
      });

      // Force update of first section in current wizardlet
      this.onWizardPositionAvailabilityUpdate(
        this.wizardPosition,
        this.wizardPosition.apply(this.sectionAvailableSlots).get()
      );
    },
    function saveProgress() {
      var p = Promise.resolve();
      return this.wizardlets.reduce(
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
        var nextScreen = this.nextScreen;

        if ( nextScreen == null ) {
          return this.currentWizardlet.save().then(() => {
            this.submitted = true;
            return true;
          });
        }

        // number of unsaved wizardlets
        let N = nextScreen.wizardletIndex - this.wizardPosition.wizardletIndex;
        // starting index of unsaved wizardlets
        let S = this.wizardPosition.wizardletIndex;

        // Save wizardlets
        return [...Array(N).keys()].map(v => S + v)
          .reduce(
            (p, i) => p.then(
              () => {
                if ( this.wizardlets[i].isAvailable ) this.wizardlets[i].save();
              }),
            Promise.resolve()
          ).then(() => {
            this.wizardPosition = nextScreen;
          });
      },
    },
    function countAvailableSections(wizardletIndex) {
      return this.sectionAvailableSlots[wizardletIndex].reduce(
        (total, sectionAvailable$) =>
          sectionAvailable$.get() ? total + 1 : total,
        0
      );
    },
    function canSkipTo(pos) {
      let diff = pos.compareTo(this.wizardPosition);
      return ( diff == 0
        ? true
        : ( diff > 0
          ? this.canGoNext && this.config.allowSkipping
          : this.canGoBack && this.config.allowBacktracking
        )
      );
    },
    function skipTo(pos) {
      // TODO: add ucj save logic
      this.wizardPosition = pos;
    },
    function back() {
      let previousScreen = this.previousScreen;
      if ( previousScreen !== null ) {
        this.wizardPosition = previousScreen;
      }
    }
  ],

  listeners: [
    {
      name: 'onWizardPositionAvailabilityUpdate',
      code: function onWizardPositionAvailabilityUpdate(listenerPos, val) {
        this.sectionAvailableSlots = this.sectionAvailableSlots;
        let name = 'sectionAvailableSlots';
        this.propertyChange.pub(name, this.slot(name));

        console.log('here', listenerPos, val);

        if ( val ) {
          // If this is a previous position, move the wizard back
          if ( listenerPos.compareTo(this.wizardPosition) < 0 ) {
            this.wizardPosition = listenerPos;
          }
        }

        // Trigger "next screen" if the current wizard position is gone
        if ( ! val && listenerPos.compareTo(this.wizardPosition) == 0 ) {
          this.wizardPosition = this.nextScreen;
        } else {
          // Invoke a wizard position update (even if position didn't change)
          // to re-render steps
          this.wizardPosition = this.WizardPosition.create({
            wizardletIndex: this.wizardPosition.wizardletIndex,
            sectionIndex: this.wizardPosition.sectionIndex
          });
        }
      }
    }
  ]
});
