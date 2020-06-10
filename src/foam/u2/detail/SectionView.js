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
    'foam.core.SimpleSlot',
    'foam.layout.Section',
    'foam.u2.detail.SectionedDetailPropertyView',
    'foam.u2.DisplayMode',
    'foam.u2.layout.Cols',
    'foam.u2.layout.Grid',
    'foam.u2.layout.GUnit',
    'foam.u2.layout.Rows'
  ],

  css: `
    .subtitle {
      color: /*%GREY2%*/ #8e9090;
      font-size: 14px;
      line-height: 1.5;
      margin-bottom: 15px;
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

      self
        .addClass(self.myClass())
        .add(self.slot(function(section, showTitle, section$title, section$subTitle) {
          if ( ! section ) return;
          return self.Rows.create()
            .show(section.createIsAvailableFor(self.data$))
            .callIf(showTitle && section$title, function() {
              var slot$ = foam.Function.isInstance(self.section.title) ?
                foam.core.ExpressionSlot.create({
                  obj$: self.data$,
                  code: section.title
                }) : section.title$;
              this.start('h2').add(slot$).end();
            })
            .callIf(section$subTitle, function() {
              var slot$ = foam.Function.isInstance(self.section.subTitle) ?
              foam.core.ExpressionSlot.create({
                obj$: self.data$,
                code: section.subTitle
              }) : section.subTitle$;
              this.start().addClass('subtitle').add(slot$).end();
            })
            .start(self.Grid)
              .forEach(section.properties, function(p, index) {
                var s1 = self.SimpleSlot.create();
                var s2 = self.SimpleSlot.create();
                this.start(self.GUnit, { columns: p.gridColumns }, s1)
                  .tag(self.SectionedDetailPropertyView, {
                    prop: p,
                    data$: self.data$
                  }, s2)
                .end();
                s1.get().show(self.ProxySlot.create({ delegate$: s2.get().visibilitySlot$ }).map((mode) => mode !== self.DisplayMode.HIDDEN));
              })
            .end()
            .start(self.Cols)
              .style({
                'justify-content': 'end',
                'margin-top': section.actions.length ? '4vh' : 'initial'
              })
              .forEach(section.actions, function(a) {
                this.add(a);
              })
            .end();
        }));
    }
  ]
});
