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
  properties: [
    {
      class: 'Array',
      name: 'views'
    }
  ],
  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.add(this.slot(function(views) {
        return self.E().forEach(views, function(v) {
          return this.start(v, { data$: self.data$ }).end();
        });
      }));
    }
  ]
});