/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'ContextSensitiveDetailView',
  extends: 'foam.u2.DetailView',
  documentation: 'A DetailView which gets its data from its context.',
  methods: [
    function initE() {
      // TODO: This should just be imports: [ 'data$' ] but DetailView
      // is not property dynamic on data/of.  In particular it sets
      // this.of when this.data is set rather than making 'of' an
      // expression on data.  This is likely due to Class properties
      // historically not supporting expressions, but that has been
      // fixed now.
      if ( ! this.data ) this.data = this.__context__.data;
      this.SUPER();
    }
  ]
});
