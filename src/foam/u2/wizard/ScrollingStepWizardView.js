/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'ScrollingStepWizardView',
  extends: 'foam.u2.wizard.IncrementalStepWizardView',
  mixins: ['foam.u2.wizard.WizardletRenderUtils'],
  documentation: `Displays all wizardlets in a scrolling page.`,

  requires: [
    'foam.u2.tag.CircleIndicator',
    'foam.u2.wizard.WizardPosition',
    'foam.u2.wizard.WizardletIndicator'
  ],

  css: `
    ^mainView > * > *:not(:last-child) {
      margin-bottom: 64px;
    }
  `,

  properties: [
    {
      name: 'scrollPosition',
      class: 'Int'
    },
    {
      name: 'wizardPositionElements',
      class: 'Map'
    },
    {
      name: 'scrollWizardPosition',
      expression: function (scrollPosition, wizardPositionElements) {
        var offset = 50;

        var test_visible = el => {
          var sectTop = el.offsetTop - offset;
          var sectBot = sectTop + el.clientHeight;
          var mainTop = this.mainScrollElement.scrollTop;
          var mainBot = mainTop + this.mainScrollElement.clientHeight;
          return (sectTop <= mainTop && sectBot > mainTop) ||
            (sectBot >= mainBot && sectTop < mainBot) ||
            (sectTop >= mainTop && sectBot < mainBot) ;
        };
        var minTopPosition = null;
        // Find the closest visible section to the top
        for ( let hash in wizardPositionElements ) {
          let el = wizardPositionElements[hash].section.el();
          let pos = wizardPositionElements[hash].position;
          if ( ! el ) {
            console.error('missing element', wizardPositionElements[hash]);
            continue;
          }
          if ( test_visible(el) ) {
            if ( ! minTopPosition || pos.compareTo(minTopPosition) < 0 )
              minTopPosition = pos;
          }
        }

        // console.log(minTopPosition.instance_)

        return minTopPosition;
      }
    },
    'mainScrollElement'
  ],

  methods: [
    function initE() {
      var self = this;
      window.testing_ = self;
      this.scrollWizardPosition$.sub(() => {
        this.data.wizardPosition = this.scrollWizardPosition;
      });
      this
        .start(this.Grid)
          .addClass(this.myClass('fix-grid'))
          .start(this.GUnit, { columns: 4 })
            // TODO: deprecate this hide-X-status class
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
            .start()
              .call(function () {
                self.onDetach(this.state$.sub(() => {
                  console.log('state', this.state)
                  if ( this.state.cls_ == foam.u2.LoadedElementState ) {
                    self.mainScrollElement = this.el();
                    self.scrollWizardPosition$.get();
                  }
                }));
              })
              .on('scroll', function (e) {
                self.scrollPosition = e.srcElement.scrollTop;
              })
              .addClass(this.myClass('mainView'))
              // TODO: deprecate this hide-X-entry class
              .addClass(this.hideX ? this.myClass('hide-X-entry') : this.myClass('entry'))
              .add(this.slot(function (data$wizardlets) {
                return self.renderWizardlets(this.E(), data$wizardlets);
              }))
            .end()
          .end()
        .end()
        ;
    },
    function renderWizardlets(e, wizardlets) {
      var self = this;
      return e.forEach(wizardlets, function (wizardlet, wi) {
        this.add(wizardlet.slot(function (isAvailable, isVisible) {
          if ( ! isVisible ) return self.E();
          var e2 = self.renderWizardletHeading(self.E(), wizardlet);
          return self.renderWizardletSections(e2, wizardlet, wi);
        }));
      });
    },
    function renderWizardletHeading(e, wizardlet) {
      // ???: should properties of 'this.data' be read here? Does it matter?
      var isCurrent = wizardlet == this.data.currentWizardlet;
      var self = this;
      return e
        .start()
          .add(wizardlet.slot(function (indicator) {
            return self.E()
              .style({
                // TODO: move to CSS axiom
                display: 'inline-block',
                float: 'left',
                'margin-right': '15px'
              })
              .start(self.CircleIndicator, self.configureIndicator(
                wizardlet, isCurrent, self.calculateWizardletDisplayNumber(
                  wizardlet, self.data.wizardlets)
              ))
              .end()
          }))
          .start('h2') // ???: Should this really be h2?
            .add(wizardlet.title)
          .end()
        .end()
    },
    function renderWizardletSections(e, wizardlet, wi) {
      var self = this;
      return e.forEach(wizardlet.sections, function (section, si) {
        var position = self.WizardPosition.create({
          wizardletIndex: wi,
          sectionIndex: si,
        });
        this.add(section.createView().call(function () {
          this.onDetach(this.state$.sub(() => {
            if ( this.state.cls_ == foam.u2.LoadedElementState ) {
              self.wizardPositionElements$set(position.hash(), {
                section: this,
                position: position
              });
            }
          }));
        }));
      });
    }
  ]
});
