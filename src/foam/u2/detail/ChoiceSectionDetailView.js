/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.detail',
  name: 'ChoiceSectionDetailView',
  extends: 'foam.u2.detail.AbstractSectionedDetailView',

  requires: [
    'foam.core.ArraySlot',
    'foam.u2.borders.CardBorder',
    'foam.u2.detail.SectionView',
    'foam.u2.layout.Grid',
    'foam.u2.layout.GUnit',
    'foam.u2.Tab',
    'foam.u2.Tabs',
    'foam.u2.view.ChoiceView'
  ],

  css: `
    ^ .foam-u2-Tabs-content > div {
      background: white;
      padding: 14px 16px
      overflow-x: scroll;
      white-space: nowrap;
    }

    ^ .foam-u2-view-ScrollTableView table {
      width: 100%;
    }

    ^ .foam-u2-Tabs-tabRow {
      overflow-x: scroll;
      white-space: nowrap;
    }

    ^ .foam-u2-tag-Select {
        text-align-last:center;
      }
    ^ .foam-u2-tag-Select:after {
        text-align-last:center;
      }

    .choicePosition {
      text-align: center;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
    }

    .action-button {
      width: 100px;
      font-size: 20px;
      font-weight: bold;
      padding: 5px;
      border-radius: 10px;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'defaultSectionLabel',
      value: 'Uncategorized'
    },
    {
      name: 'currentIndex',
      preSet: function(o,n) {
        debugger;
        if ( n < 1 ) return 0;
        if ( n >= this.newSections.length ) return this.newSections.length - 1;
        return n;
      },
      value: 0
    },
    {
      name: 'newSections',
    }
  ],

  methods: [
    function initE() {
      var self = this;

      this.SUPER();
      this
        .addClass(this.myClass())
        .add(this.slot(function(sections, data) {
          if ( ! data ) return;

          var arraySlot = foam.core.ArraySlot.create({
            slots: sections.map((s) => s.createIsAvailableFor(self.data$))
          });

          return self.E()
            .add(arraySlot.map((visibilities) => {
              self.newSections = sections.filter((s, i) => {
                return visibilities[i]
              })
              return this.E()
                .startContext({ controllerMode: 'EDIT' })
                  .start().addClass('choicePosition')
                    .start('button').addClass('action-button').add('<').on('click', () => {
                      this.currentIndex -= 1;
                    }).end()
                    .tag(this.ChoiceView, {
                      choices: sections.filter( (s,i) => {
                        return visibilities[i]
                      }).map( (s,i) => [i,s.title] ),
                      data$: self.currentIndex$,
                    })
                    .start('button').addClass('action-button').add('>').on('click', () => {
                      this.currentIndex += 1;
                    }).end()
                  .end()
                .endContext()
                  .add(this.slot(function (currentIndex) {
                    return this.E().tag(self.SectionView, {
                            data$: self.data$,
                            section: this.newSections[this.currentIndex],
                            showTitle: true})
                  }))
            }))
        }));
    }
  ]
});
