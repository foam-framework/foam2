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
        .add(this.slot(function (data$wizardlets, data$subStack$pos) {
          let elem = this.E();

          let afterCurrent = false;

          for ( let w = 0 ; w < data$wizardlets.length ; w++ ) {
            let wizardlet = this.data.wizardlets[w];
            let isCurrent = wizardlet === this.data.currentWizardlet;

            let baseCircleIndicator = {
              size: 24,
              borderThickness: 2,
              label: '' + (1 + w),
            };
            elem = elem
              .start()
                .addClass(self.myClass('item'))

                // Render circle indicator
                .start(this.CircleIndicator,
                  isCurrent ? {
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
                .start('span')
                  .add(wizardlet.title)
                  .style({
                    'font-weight': isCurrent ? 'bold' : 'normal',
                    'color': isCurrent ? this.theme.primary1 : 'inherit'
                  })
                .end();
            
            // Get section index to highlight current section
            let indices = this.data.screenIndexToSection(data$subStack$pos);
            
            // Render section labels
            let sections = this.data.sections[w];

            for ( let s = 0 ; s < sections.length ; s++ ) {
              let section = sections[s];
              elem = self.renderSectionLabel(
                elem,
                section, s+1,
                indices[1] === s && isCurrent
              );
            }

            elem = elem
              .end();

            if ( isCurrent ) afterCurrent = true;
          }

          return elem;
        }))
    },
    function renderSectionLabel(elem, section, index, highlight) {
      let title = section.title;
      if ( ! title || ! title.trim() ) title = "Part " + index;
      return elem
        .start()
          .addClass(this.myClass('sub-item'))
          .style({
            'color': highlight ? this.theme.primary1 : 'inherit',
            'font-weight': highlight ? 'bold' : 'inherit'
          })
          .add(title)
        .end();
    }
  ]
});