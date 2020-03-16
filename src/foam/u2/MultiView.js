/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'MultiView',
  extends: 'foam.u2.View',

  documentation: `
    A view that binds multiple views to the same data and renders them all.
  `,

  imports: [ 'data as parentData' ],

  exports: [ 'parentData as data' ],

  css: `
    ^container {
      margin: 2px 8px 2px 0;
    }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'horizontal',
      value: true
    },
    {
      class: 'Array',
      name: 'views',
      adapt: function(_, a) {
        return foam.Array.isInstance(a) ? a.map((o) => foam.String.isInstance(o) ? { class: o } : o) : a;
      }
    },
    'prop'
  ],

  methods: [
    function initE() {
      this.SUPER();

      var self = this;

      this.addClass(this.myClass());

      this.add(this.slot(function(views) {
        return self.E().forEach(views, function(v) {
          return this.
            start().
              addClass(self.myClass('container')).
              callIf(self.horizontal, function() { this.style({float: 'left'}); }).
              start(v, { data$: self.data$ }).
                call(function() {
                  self.prop && this.fromProperty && this.fromProperty(self.prop);
                }).
              end().
            end();
        });
      }));
    },

    function fromProperty(prop) {
      this.prop = prop;
    }
  ]
});
