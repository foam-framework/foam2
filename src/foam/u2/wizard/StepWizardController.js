/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'StepWizardController',

  requires: [
    'foam.core.FObject',
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
      name: 'wsub',
      class: 'FObjectProperty',
      of: 'FObject',
      description: `
        Subscription for listeners of wizardlets' state. This is replaced if the
        list of wizardlets is updated.
      `
    },
    {
      name: 'wizardlets',
      class: 'FObjectArray',
      of: 'foam.u2.wizard.Wizardlet',
      postSet: function (_, n) {
        this.setupWizardletListeners(n);
        this.determineWizardActions(n);
      }
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
      }
    },

    {
      name: 'nextScreen',
      expression: function(wizardPosition) {
        return this.nextAvailable(wizardPosition, this.positionAfter.bind(this));
      }
    },
    {
      name: 'previousScreen',
      expression: function(wizardPosition) {
        return this.nextAvailable(wizardPosition, this.positionBefore.bind(this));
      }
    },
    {
      name: 'visitedWizardlets',
      class: 'FObjectArray',
      of: 'foam.u2.wizard.Wizardlet'
    },

    // Convenience properties
    {
      name: 'currentWizardlet',
      expression: function(wizardlets, wizardPosition) {
        var current = wizardlets[wizardPosition.wizardletIndex];
        if ( this.visitedWizardlets.indexOf(current) == -1 ) {
          this.visitedWizardlets.push(current);
        }
        return current;
      }
    },
    {
      name: 'currentSection',
      expression: function(
        wizardlets,
        wizardPosition$wizardletIndex, wizardPosition$sectionIndex
      ) {
        return wizardlets[wizardPosition$wizardletIndex]
          .sections[wizardPosition$sectionIndex];
      }
    },
    {
      name: 'isLastScreen',
      class: 'Boolean',
      expression: function(nextScreen) {
        return nextScreen == null;
      }
    },
    {
      name: 'canGoBack',
      class: 'Boolean',
      expression: function(previousScreen) {
        return previousScreen != null;
      }
    },
    {
      name: 'canGoNext',
      class: 'Boolean',
      expression: function(
        wizardPosition, nextScreen,
        currentSection, currentWizardlet,
        currentSection$isValid, currentWizardlet$isValid,
        config$allowSkipping
      ) {
        if ( config$allowSkipping ) return true;
        if (
          ! nextScreen ||
          wizardPosition.wizardletIndex != nextScreen.wizardletIndex
        ) {
          if ( ! currentWizardlet$isValid ) return false;
        }
        return currentSection$isValid;
      }
    },
    {
      name: 'submitted',
      class: 'Boolean'
    },
    {
      name: 'allValid',
      class: 'Boolean'
    }
  ],

  methods: [
    function setupWizardletListeners(wizardlets) {
      console.debug('step wizard', this);

      if ( this.wsub ) this.wsub.detach();
      this.wsub = this.FObject.create();

      var wi = 0, si = 0;
      wizardlets.forEach((w, wizardletIndex) => {

        // Bind availability listener for wizardlet availability
        var isAvailable$ = w.isAvailable$;
        this.wsub.onDetach(isAvailable$.sub(() => {
          this.onWizardletAvailability(wizardletIndex, isAvailable$.get());
        }));

        // Bind availability listener for each wizardlet section
        w.sections.forEach((section, sectionIndex) => {
          var sectionPosition = this.WizardPosition.create({
            wizardletIndex: wizardletIndex,
            sectionIndex: sectionIndex,
          });
          var isAvailable$ = section.isAvailable$;
          this.wsub.onDetach(isAvailable$.sub(() => {
            this.onSectionAvailability(
              sectionPosition, isAvailable$.get());
          }));
        });

        // Bind validity listener for wizardlet validity
        var isValid$ = w.isValid$;
        this.wsub.onDetach(isValid$.sub(() => {
          this.onWizardletValidity(wizardletIndex, isValid$.get());
        }));

      });

    },
    function determineWizardActions(wizardlets) {
      // TODO: If we ever need wizardlets to add new actions to the wizard,
      //       rather than just overriding existing ones, we can create a list
      //       of pseudo-actions here by iterating over all the wizardlets and
      //       finding axioms of type foam.u2.wizard.axiom.WizardAction.
    },
    function detach() {
      this.wsub.detach();
      this.SUPER();
    },
    function positionAfter(pos) {
      let subWi = pos.wizardletIndex
      let subSi = pos.sectionIndex;
      if ( subSi >= this.wizardlets[subWi].sections.length - 1 ) {
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
    },
    function positionBefore(pos) {
      let subWi = pos.wizardletIndex;
      let subSi = pos.sectionIndex;
      if ( subSi == 0 ) {
        if ( subWi == 0 ) return null;
        subWi--;
        // Skip past steps with no sections
        while ( this.wizardlets[subWi].sections.length < 1 ) subWi--;
        if ( subWi < 0 ) return null;
        subSi = this.wizardlets[subWi].sections.length - 1;
      } else {
        subSi--;
      }
      return this.WizardPosition.create({
        wizardletIndex: subWi,
        sectionIndex: subSi,
      });
    },
    function nextAvailable(pos, iter) {
      if ( ! pos || ! iter ) return null;
      for ( let p = iter(pos) ; p != null ; p = iter(p) ) {
        let wizardlet = this.wizardlets[p.wizardletIndex]
        if ( ! wizardlet.isVisible ) continue;

        if (
          wizardlet.sections.length > 0 &&
          wizardlet.sections[p.sectionIndex].isAvailable
        ) return p;
      }

      return null;
    },
    function saveProgress() {
      return this.wizardlets.reduce((p, wizardlet) =>
        this.visitedWizardlets.indexOf(wizardlet) == -1 ? p
          : p.then(() => wizardlet.save()), Promise.resolve());
    },
    function next() {
      // Save current wizardlet, and any save-able (isAvailable) but invisible
      // wizardlets that may exist in between this one and the next.
      // If it exists, load the next wizardlet
      // TODO: Just load next wizardlet instead of loading all in the beginning
      var start = this.wizardPosition.wizardletIndex;
      var end = this.nextScreen ?
        this.nextScreen.wizardletIndex : this.wizardlets.length;
      var p = Promise.resolve();
      for ( let i = start ; i < end ; i++ ) {
        if ( ! this.wizardlets[i].isAvailable ) continue;
        p = p.then(() => this.wizardlets[i].save());
        if ( (i + 1) < end && this.wizardlets[i + 1] ) p = p.then(() => this.wizardlets[i + 1].load());
      }
      return p.then(() => {
        if ( this.nextScreen == null ) {
          this.submitted = true;
          return true;
        }
        this.wizardPosition = this.nextScreen;
        return false;
      });
    },
    function back() {
      let previousScreen = this.previousScreen;
      if ( previousScreen == null ) {
        throw new Error('back() called without checking canGoBack');
      }
      this.wizardPosition = previousScreen;
    },
    function countAvailableSections(wizardletIndex) {
      return this.wizardlets[wizardletIndex].sections.filter(
        s => s.isAvailable).length;
    },
    function canSkipTo(pos) {
      var start = this.wizardPosition;
      var diff = pos.compareTo(this.wizardPosition);

      if ( diff == 0 ) return true;
      if ( this.nextScreen && pos.compareTo(this.nextScreen) == 0 )
        return this.canGoNext;
      if ( this.previousScreen && pos.compareTo(this.previousScreen) == 0 ) return this.canGoBack;
      if ( diff < 0 ) return this.allowBacktracking;
      if ( this.allowSkipping ) return true;

      // Iterate over each section along the way to make sure it's valid
      var iter = this.positionAfter.bind(this);
      var lastWizardletIndex = start.wizardletIndex;
      for ( let p = start ; p != null ; p = iter(p) ) {
        // Also check isValid on the wizardlet itself
        if ( p.wizardletIndex != lastWizardletIndex ) {
          if ( ! this.wizardlets[lastWizardletIndex].isValid ) {
            return false;
          }
        }
        if ( p.compareTo(pos) == 0 ) return true;
        let wizardlet = this.wizardlets[p.wizardletIndex];
        let section = this.wizardlets[p.sectionIndex];
      }
    },
    function skipTo(pos) {
      this.wizardPosition = pos;
    }
  ],

  listeners: [
    function onWizardletAvailability(wizardletIndex, value) {
      // Force a position update so views recalculate state
      this.wizardPosition = this.WizardPosition.create({
        wizardletIndex: this.wizardPosition.wizardletIndex,
        sectionIndex: this.wizardPosition.sectionIndex,
      });
    },
    function onWizardletValidity(wizardletIndex, value) {
      this.allValid = this.wizardlets.filter(w => ! w.isValid).length == 0;
    },
    function onSectionAvailability(sectionPosition, value) {
      // If a previous position became available, move the wizard back
      if ( value && sectionPosition.compareTo(this.wizardPosition) < 0 ) {
        this.wizardPosition = sectionPosition;
        return;
      }

      // Trigger "next screen" if the current wizard position is gone
      if ( ! value && sectionPosition.compareTo(this.wizardPosition) == 0 ) {
        this.wizardPosition = this.nextScreen;
        return;
      }

      // Force position update anyway so views recalculate state
      this.wizardPosition = this.WizardPosition.create({
        wizardletIndex: this.wizardPosition.wizardletIndex,
        sectionIndex: this.wizardPosition.sectionIndex,
      });
    }
  ]
});
