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
  imports: [
    'data as parentData',
  ],
  exports: [
    'parentData as data',
  ],
  properties: [
    {
      class: 'Array',
      name: 'views'
    },
    'prop'
  ],
  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.add(this.slot(function(views) {
        return self.E().forEach(views, function(v) {
          return this.start(v, { data$: self.data$ })
            .call(function() {
              self.prop && this.fromProperty && this.fromProperty(self.prop);
            })
            .end();
        });
      }));
    },
    function fromProperty(prop) {
      this.prop = prop;
    }
  ]
});
