/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.detail',
  name: 'SectionView',
  extends: 'foam.u2.View',

  requires: [
    'foam.core.ArraySlot',
    'foam.core.SimpleSlot',
    'foam.layout.Section',
    'foam.u2.detail.SectionedDetailPropertyView',
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows',
    'foam.u2.Visibility'
  ],

  css: `
    ^ .foam-u2-detail-SectionedDetailPropertyView {
      padding: 12px 0;
    }

    ^ .foam-u2-detail-SectionedDetailPropertyView.first {
      padding-top: 0;
    }

    ^ .foam-u2-detail-SectionedDetailPropertyView.last {
      padding-bottom: 0;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'sectionName'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.layout.Section',
      name: 'section',
      expression: function(data, sectionName) {
        if ( ! data ) return null;
        var of = data.cls_;
        var a = of.getAxiomByName(sectionName);
        return this.Section.create().fromSectionAxiom(a, of);
      }
    },
    {
      class: 'Boolean',
      name: 'showTitle',
      value: true
    },
    {
      class: 'FObjectProperty',
      of: 'foam.core.ArraySlot',
      name: 'visibilitySlots_',
      documentation: `
        An array of slots used to control the visibility of the child
        SectionedDetailPropertyViews of this view. Used internally to figure out
        which children are the first and last ones visible so we can adjust the
        padding on those elements to make sure nested
        SectionedDetailPropertyViews don't cause unnecessary padding.
      `,
      factory: function() {
        return this.ArraySlot.create();
      }
    },
    {
      class: 'Int',
      name: 'firstVisibleIndex_',
      expression: function(visibilitySlots_) {
        return visibilitySlots_.get().indexOf(true);
      }
    },
    {
      class: 'Int',
      name: 'lastVisibleIndex_',
      expression: function(visibilitySlots_) {
        return visibilitySlots_.get().lastIndexOf(true);
      }
    }
  ],
  methods: [
    function initE() {
      var self = this;
      var slots = [];
      self.SUPER();
      self
        .addClass(self.myClass())
        .add(self.slot(function(section, showTitle, section$title) {
          if ( ! section ) return;
          return self.Rows.create()
            .show(section.createIsAvailableFor(self.data$))
            .callIf(showTitle && section$title, function() {
              this.start('h2').add(section$title).end();
            })
            .forEach(section.properties, function(p, index) {
              var slot = self.SimpleSlot.create({}, self);
              this.start(self.SectionedDetailPropertyView, {
                prop: p,
                data$: self.data$
              }, slot)
                .enableClass('first', self.firstVisibleIndex_$.map((value) => value === index))
                .enableClass('last', self.lastVisibleIndex_$.map((value) => value === index))
              .end();
              slots.push(slot.get().visibilitySlot);
            })
            .start(self.Cols)
              .forEach(section.actions, function(a) {
                this.add(a);
              })
            .end();
        }));
      this.visibilitySlots_ = self.ArraySlot.create({ slots: slots });
    }
  ]
});
