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
    'foam.core.ConstantSlot',
    'foam.core.ProxySlot',
    'foam.layout.Section',
    'foam.u2.detail.SectionedDetailPropertyView',
    'foam.u2.layout.Cols',
    'foam.u2.layout.Grid',
    'foam.u2.layout.GUnit',
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
    }
  ],
  methods: [
    function initE() {
      var self = this;
      self.SUPER();
      var proxySlot = self.ProxySlot.create({ delegate: self.ConstantSlot.create({ value: [] }) });
      var firstVisibleIndexSlot = proxySlot.map((arr) => arr.indexOf(true));
      var lastVisibleIndexSlot  = proxySlot.map((arr) => arr.lastIndexOf(true));

      self
        .addClass(self.myClass())
        .add(self.slot(function(section, showTitle, section$title) {
          if ( ! section ) return;
          var slots = [];
          var elm = self.Rows.create()
            .show(section.createIsAvailableFor(self.data$))
            .callIf(showTitle && section$title, function() {
              this.start('h2').add(section$title).end();
            })
            .start(self.Grid)
              .forEach(section.properties, function(p, index) {
                this.start(self.GUnit, { columns: p.gridColumns })
                  .start(self.SectionedDetailPropertyView, {
                    prop: p,
                    data$: self.data$
                  })
                    .call(function() { slots.push(this.visibilitySlot); })
                    .enableClass('first', firstVisibleIndexSlot.map((value) => value === index))
                    .enableClass('last',   lastVisibleIndexSlot.map((value) => value === index))
                  .end()
                .end();
              })
            .end()
            .start(self.Cols)
              .style({ 'justify-content': 'end' })
              .forEach(section.actions, function(a) {
                this.add(a);
              })
            .end();
          proxySlot.delegate = self.ArraySlot.create({ slots: slots });
          return elm;
        }));
    }
  ]
});
