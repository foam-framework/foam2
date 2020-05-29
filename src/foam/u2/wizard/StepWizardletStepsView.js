foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'StepWizardletStepsView',
  extends: 'foam.u2.View',

  css: `
    ^item {
      margin-bottom: 15px;
    }
    ^item > .circle {
      margin-right: 15px;
    }
    ^sub-item {
      padding-left: calc(24px + 15px + 4px);
      line-height: 40px;
    }
  `,

  imports: [
    'theme'
  ],

  requires: [
    'foam.u2.detail.AbstractSectionedDetailView',
    'foam.u2.wizard.util.CircleIndicator'
  ],

  methods: [
    function initE() {
      var self = this;
      this
        .add(this.slot(function (data$wizardlets) {
          let elem = this.E();

          let afterCurrent = false;
          let displayNumber = 1;
          data$wizardlets.forEach(wizardlet => {
            let isCurrent = wizardlet === this.data.currentWizardlet;

            let baseCircleIndicator = {
              size: 24,
              borderThickness: 2,
              label: '' + displayNumber,
            };
            elem = elem
              .start()
                .addClass(self.myClass('item'))

                // Render circle indicator
                .start(this.CircleIndicator,
                  wizardlet === this.data.currentWizardlet ? {
                    ...baseCircleIndicator,
                    borderColor: this.theme.primary1
                  } : afterCurrent ? {
                    ...baseCircleIndicator,
                    borderColor: this.theme.grey2,
                  } : {
                    ...baseCircleIndicator,
                    borderColor: wizardlet.readyToSubmit()
                      ? this.theme.approval2 : this.theme.warning2
                  }
                )
                  .addClass('circle')
                .end()

                // Render title
                .add(wizardlet.title);
            
            // Render section labels
            let sections = null;
            (() => {
              let tmpAbstractSDV = this.AbstractSectionedDetailView.create({
                of: wizardlet.of,
              });
              sections = tmpAbstractSDV.sections;
            })();

            for ( let s = 0 ; s < sections.length ; s++ ) {
              let section = sections[s];
              elem = self.renderSectionLabel(elem, section, s+1);
            }

            elem = elem
              .end();

            // Prepare for next item
            displayNumber++;
            if ( isCurrent ) afterCurrent = true;
          })

          return elem;
        }))
    },
    function renderSectionLabel(elem, section, index) {
      let title = section.title;
      if ( ! title ) title = "Part " + index;
      return elem
        .start()
          .addClass(this.myClass('sub-item'))
          .add(section.title)
        .end();
    }
  ]
});