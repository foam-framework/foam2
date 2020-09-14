/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'StepWizardletStepsView',
  extends: 'foam.u2.View',

  css: `
    ^item {
      margin-bottom: 15px;
    }
    ^item > .circle {
      display: inline-block;
      margin-right: 15px;
      vertical-align: middle;
    }
    ^sub-item {
      padding-left: calc(24px + 15px + 4px);
      padding-top: 8px;
      font-style: italic;
    }
    ^sub-item:hover {
      cursor: pointer;
      font-weight: bold;
    }
    ^sub-item:first-child {
      padding-top: 16px;
    }
    ^title {
      display: inline-block;
      margin: 0;
      vertical-align: middle;
    }
  `,

  imports: [
    'theme'
  ],

  requires: [
    'foam.u2.detail.AbstractSectionedDetailView',
    'foam.u2.tag.CircleIndicator',
    'foam.u2.wizard.WizardPosition'
  ],

  methods: [
    function initE() {
      var self = this;
      this
        .add(this.slot(function (
          data$wizardlets,
          data$wizardPosition,
          data$availabilityInvalidate
        ) {
          let elem = this.E();

          let afterCurrent = false;

          // Fixes the sidebar number if a wizardlet is skipped
          let wSkipped = 0;

          for ( let w = 0 ; w < data$wizardlets.length ; w++ ) {
            let wizardlet = this.data.wizardlets[w];
            let isCurrent = wizardlet === this.data.currentWizardlet;

            if (
              this.data.countAvailableSections(w) < 1
              || ! wizardlet.isAvailable
            ) {
              console.log('skip');
              wSkipped++;
              continue;
            }

            let baseCircleIndicator = {
              size: 24,
              borderThickness: 2,
              label: '' + (1 + w - wSkipped),
            };
            elem = elem
              .start()
                .addClass(self.myClass('item'))

                // Render circle indicator
                .start(this.CircleIndicator, {
                  ...baseCircleIndicator,
                  ...(isCurrent ? {
                    borderColor: this.theme.primary1
                  } : afterCurrent ? {
                    borderColor: this.theme.grey2,
                  } : wizardlet.validate() ? {
                    borderColor: this.theme.approval3,
                    backgroundColor: this.theme.approval3,
                    icon: this.theme.glyphs.checkmark.getDataUrl({
                      fill: this.theme.white
                    }),
                    label: ''
                  } : {
                    borderColor: this.theme.warning2
                  })
                })
                  .addClass('circle')
                .end()

                // Render title
                .start('p').addClass(self.myClass('title'))
                  .add(wizardlet.title)
                  .style({
                    'font-weight': isCurrent ? 'bold' : 'normal',
                    'color': isCurrent || ! afterCurrent ? this.theme.primary1 : this.theme.grey2
                  })
                .end();

            // Get section index to highlight current section
            let wi = data$wizardPosition.wizardletIndex;
            let si = data$wizardPosition.sectionIndex;

            // Render section labels
            let sections = this.data.sections[w];

            for ( let s = 0 ; s < sections.length ; s++ ) {
              let pos = this.WizardPosition.create({
                wizardletIndex: w,
                sectionIndex: s,
              })
              let section = sections[s];
              let isCurrentSection = isCurrent && si === s;
              let isBeforeCurrentSection = w < wi || isCurrent && s < si;

              let allowedToSkip = self.data.canSkipTo(pos);
              let slot = section.createIsAvailableFor(
                wizardlet.data$
              ).map(function (isAvailable) {
                return isAvailable ? self.renderSectionLabel(
                  self.E().addClass(self.myClass('sub-item')),
                  section, s+1,
                  isCurrentSection,
                  isBeforeCurrentSection,
                  allowedToSkip
                ).on('click', () => {
                  if ( isCurrentSection ) return;
                  if ( allowedToSkip ) {
                    self.data.skipTo(pos);
                  }
                  return;
                }) : self.E('span');
              })
              elem.add(slot);
            }

            elem = elem
              .end();

            if ( isCurrent ) afterCurrent = true;
          }

          return elem;
        }))
    },
    function renderSectionLabel(elem, section, index, isCurrent, isBeforeCurrentSection, isClickable) {
      let title = section.title;
      if ( ! title || ! title.trim() ) title = "Part " + index;
      return elem
        .start()
          .style({
            'color': isCurrent || isBeforeCurrentSection
              ? this.theme.primary1
              : isClickable
                ? this.theme.grey2
                : this.theme.grey3,
            'font-weight': isCurrent ? 'bold' : 'inherit'
          })
          .add(title)
        .end();
    }
  ]
});
