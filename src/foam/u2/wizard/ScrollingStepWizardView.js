foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'ScrollingStepWizardView',
  extends: 'foam.u2.wizard.IncrementalStepWizardView',
  documentation: `Displays all wizardlets in a scrolling page.`,

  requires: [
    'foam.u2.wizard.WizardPosition'
  ],

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
          if ( test_visible(el) ) {
            if ( ! minTopPosition || pos.compareTo(minTopPosition) < 0 )
              minTopPosition = pos;
          }
        }

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
      this.scrollWizardPosition$.get();
      this
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
            .start()
              .call(function () {
                self.onDetach(this.state$.sub(() => {
                  console.log('state', this.state)
                  if ( this.state.cls_ == foam.u2.LoadedElementState ) {
                    self.mainScrollElement = this.el();
                  }
                }));
              })
              .on('scroll', function (e) {
                self.scrollPosition = e.srcElement.scrollTop;
              })
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
        this.add(wizardlet.slot(function (isAvailable, isVisible, indicator) {
          if ( ! isVisible ) return self.E();
          return self.renderWizardletSections(self.E(), wizardlet, wi);
        }));
      });
    },
    function renderWizardletSections(e, wizardlet, wi) {
      var self = this;
      return e.forEach(wizardlet.sections, function (section, si) {
        var position = self.WizardPosition.create({
          wizardletIndex: wi,
          sectionIndex: si,
        });
        this.add(section.createView().call(function () {
          self.wizardPositionElements$set(position.hash(), {
            section: this,
            position: position
          });
        }));
      });
    }
  ]
});
