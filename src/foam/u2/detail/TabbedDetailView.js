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

  exports: [
    'currentMemento_ as memento'
  ],

  requires: [
    'foam.core.ArraySlot',
    'foam.u2.borders.CardBorder',
    'foam.u2.detail.SectionView',
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
      overflow-x: auto;
      white-space: nowrap;
      border-top-left-radius: 6px;
      border-top-right-radius: 6px;
    }
    
    ^ .foam-u2-borders-CardBorder {
      padding: 14px 24px;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'defaultSectionLabel',
      value: 'Uncategorized'
    },
    'tabs',
    'currentMemento_'
  ],

  methods: [
    function initE() {
      var self = this;

      this.currentMemento_$ = this.memento$;

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
              var availableSections = visibilities.length == sections.length ? sections.filter((_, i) => visibilities[i]) : sections;
              var e = availableSections.length == 1 ? 
                this.E().start(self.CardBorder)
                  .tag(self.SectionView, { data$: self.data$, section: availableSections[0], showTitle: false })
                .end() :
                this.E()
                .start(self.Tabs, {}, self.tabs$)
                  .forEach(availableSections, function(s) {
                    var title$ = foam.Function.isInstance(s.title) ?
                      foam.core.ExpressionSlot.create({
                        obj: self.data,
                        code: s.title
                      }) :
                      s.title$;

                    var tab = foam.core.SimpleSlot.create();
                    this
                      .start(self.Tab, { label$: title$ || self.defaultSectionLabel, selected: self.memento && self.memento.tail && self.memento.tail.head === s.title }, tab)
                        .call(function() {
                          var sectionView = foam.u2.ViewSpec.createView(self.SectionView, {
                            data$: self.data$,
                            section: s,
                            showTitle: false,
                            selected$: tab.value.selected$
                          }, self, self.__subContext__.createSubContext({ memento: null }));
                          this.add(sectionView)
                        })
                      .end();
                  })
                .end();
              self.tabs && ( self.tabs.updateMemento = true );
              return e;
            }))
        }));
    }
  ]
});
