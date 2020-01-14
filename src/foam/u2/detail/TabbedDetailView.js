/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.detail',
  name: 'TabbedDetailView',
  extends: 'foam.u2.detail.AbstractSectionedDetailView',

  requires: [
    'foam.core.ArraySlot',
    'foam.u2.borders.CardBorder',
    'foam.u2.detail.SectionView',
    'foam.u2.layout.Grid',
    'foam.u2.layout.GUnit',
    'foam.u2.Tab',
    'foam.u2.Tabs'
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
  `,

  properties: [
    {
      class: 'String',
      name: 'defaultSectionLabel',
      value: 'Uncategorized'
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
              return this.E()
                .start(self.Tabs)
                  .forEach(sections, function(s, i) {
                    if ( ! visibilities[i] ) return;
                    this
                      .start(self.Tab, { label: s.title || self.defaultSectionLabel })
                        .call(function() {
                          this.tag(self.SectionView, {
                            data$: self.data$,
                            section: s,
                            showTitle: false
                          })
                        })
                      .end();
                  })
                .end();
            }))
        }));
    }
  ]
});
