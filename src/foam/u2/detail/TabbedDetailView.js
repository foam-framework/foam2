/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.detail',
  name: 'TabbedDetailView',
  extends: 'foam.u2.detail.AbstractSectionedDetailView',

  imports: [
    'memento'
  ],

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
      padding: 14px 16px;
      border-bottom-left-radius: 6px;
      border-bottom-right-radius: 6px;
    }

    ^ .foam-u2-view-ScrollTableView table {
      width: 100%;
    }

    ^ .foam-u2-Tabs-tabRow {
      overflow-x: scroll;
      white-space: nowrap;
      border-top-left-radius: 6px;
      border-top-right-radius: 6px;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'defaultSectionLabel',
      value: 'Uncategorized'
    },
    'tabs'
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
              var e = this.E()
                .start(self.Tabs, {}, self.tabs$)
                  .forEach(sections, function(s, i) {
                    if ( ! visibilities[i] ) return;
                    var title$ = foam.Function.isInstance(s.title) ?
                      foam.core.ExpressionSlot.create({
                        obj: self.data,
                        code: s.title
                      }) :
                      s.title$;
                    this
                      .start(self.Tab, { label$: title$ || self.defaultSectionLabel, selected: self.memento.paramsObj.selectedTab && self.memento.paramsObj.selectedTab === s.title })
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
              self.tabs.updateMemento = true;
              return e;
            }))
        }));
    }
  ]
});
