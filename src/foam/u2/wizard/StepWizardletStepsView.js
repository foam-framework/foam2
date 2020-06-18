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
      margin-right: 15px;
    }
    ^sub-item {
      padding-left: calc(24px + 15px + 4px);
      padding-top: 15px;
    }
  `,

  imports: [
    'theme'
  ],

  requires: [
    'foam.u2.detail.AbstractSectionedDetailView',
    'foam.u2.tag.CircleIndicator'
  ],

  methods: [
    function initE() {
      var self = this;
      this
        .add(this.slot(function (data$wizardlets, data$subStack$pos) {
          let elem = this.E();

          let afterCurrent = false;

          // Fixes the sidebar number if a wizardlet is skipped
          let wSkipped = 0;

          for ( let w = 0 ; w < data$wizardlets.length ; w++ ) {
            let wizardlet = this.data.wizardlets[w];
            let isCurrent = wizardlet === this.data.currentWizardlet;

            if ( this.data.countAvailableSections(w) < 1 ) {
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

            let afterCurrentSection = false;
            for ( let s = 0 ; s < sections.length ; s++ ) {
              let section = sections[s];
              let isCurrentSection = isCurrent && indices[1] === s;
              let onClickSkips = afterCurrent || afterCurrentSection;
              let allowedToSkip = self.data.canSkipTo(w);
              let slot = section.createIsAvailableFor(
                wizardlet.data$
              ).map(function (isAvailable) {
                let e = self.E('span');
                if ( isAvailable ) e = self.renderSectionLabel(
                  e,
                  section, s+1,
                  isCurrentSection,
                  ! isCurrentSection && ( ! onClickSkips || allowedToSkip )
                ).on('click', () => {
                  let targetScreenIndex = self.data.sectionToScreenIndex(w, s);
                  if ( isCurrentSection ) return;
                  if ( onClickSkips ) {
                    if ( allowedToSkip ) {
                      self.data.skipTo(targetScreenIndex);
                    }
                    return;
                  }
                  while ( self.data.subStack.pos !== targetScreenIndex ) {
                    self.data.back();
                  }
                });
                return e;
              })
              if ( isCurrentSection ) afterCurrentSection = true;
              elem.add(slot);
            }

            elem = elem
              .end();

            if ( isCurrent ) afterCurrent = true;
          }

          return elem;
        }))
    },
    function renderSectionLabel(elem, section, index, isCurrent, isClickable) {
      let title = section.title;
      if ( ! title || ! title.trim() ) title = "Part " + index;
      return elem
        .start()
          .addClass(this.myClass('sub-item'))
          .style({
            'color': isCurrent
              ? this.theme.primary1
              : isClickable
                ? 'inherit'
                : this.theme.grey3,
            'font-weight': isCurrent ? 'bold' : 'inherit'
          })
          .add(title)
        .end();
    }
  ]
});