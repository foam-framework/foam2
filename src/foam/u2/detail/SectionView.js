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
      color: /*%GREY2%*/ #9ba1a6;
      font-size: 14px;
      line-height: 1.5;
      margin-bottom: 15px;
      white-space: pre-line;
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
      name: 'config'
      // Map of property-name: {map of property overrides} for configuring properties
      // values include 'label', 'units', and 'view'
    },
    {
      class: 'Function',
      name: 'evaluateMessage',
      documentation: `Evaluates model messages without executing potentially harmful values`,
      factory: function() {
        var obj = this.data.clone();
        return (msg) => msg.replace(/\${(.*?)}/g, (x, str) => {
          return this.getNestedPropValue(obj, str);
        });
      }
    },
    {
      class: 'Function',
      name: 'getNestedPropValue',
      documentation: `
        Finds the value of an object in reference to the property path provided
        ex. 'obj.innerobj.name' will return the value of 'name' belonging to 'innerobj'.
      `,
      factory: function() {
        return (obj, path) => {
          if ( ! path ) return obj;
          const props = path.split('.');
          return this.getNestedPropValue(obj[props.shift()], props.join('.'))
        }
      }
    },
    {
      class: 'Boolean',
      name: 'loadLatch',
      factory: function() {
        return this.selected;
      }
    },
    {
      class: 'Boolean',
      name: 'selected',
      postSet: function() {
        if ( this.selected )
          this.loadLatch = this.selected;
      },
      value: true
    }
  ],

  methods: [
    function initE() {
      var self = this;
      self.SUPER();

      self
        .addClass(self.myClass())
        .callIf(self.section, function() {
          self.addClass(self.myClass(self.section.name))
        })
        .add(self.slot(function(section, showTitle, section$title, section$subTitle) {
          if ( ! section ) return;
          return self.Rows.create()
            .show(section.createIsAvailableFor(self.data$))
            .callIf(showTitle && section$title, function() {
              if ( foam.Function.isInstance(self.section.title) ) {
                const slot$ = foam.core.ExpressionSlot.create({
                  args: [ self.evaluateMessage$, self.data$ ],
                  obj$: self.data$,
                  code: section.title
                });
                if ( slot$.value ) {
                  this.start('h2').add(slot$.value).end();
                }
              } else {
                this.start('h2').add(section.title).end();
              }
            })
            .callIf(section$subTitle, function() {
              if ( foam.Function.isInstance(self.section.subTitle) ) {
                const slot$ = foam.core.ExpressionSlot.create({
                  args: [ self.evaluateMessage$, self.data$ ],
                  obj$: self.data$,
                  code: section.subTitle
                });
                if ( slot$.value ) {
                  this.start().addClass('subtitle').add(slot$.value).end();
                }
              } else {
                this.start().addClass('subtitle').add(section.subTitle).end();
              }
            })
            .add(this.slot(function(loadLatch) {
              var view = this.E().start(self.Grid);

              if ( loadLatch ) {
                view.forEach(section.properties, function(p, index) {
                  var config = self.config && self.config[p.name];

                  if ( config ) {
                    p = p.clone();
                    for ( var key in config ) {
                      if ( config.hasOwnProperty(key) ) {
                        p[key] = config[key];
                      }
                    }
                  }
                  this.start(self.GUnit, { columns: p.gridColumns })
                    .show(p.createVisibilityFor(self.data$, self.controllerMode$).map(mode => mode !== self.DisplayMode.HIDDEN))
                    .tag(self.SectionedDetailPropertyView, {
                      prop: p,
                      data$: self.data$
                    })
                  .end();
                });
              }

              return view;
            }))
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
