/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ReadOnlyEnumView',
  extends: 'foam.u2.View',

  documentation: 'A read-only view for foam.core.Enum properties.',

  methods: [
    function initE() {
      this.SUPER();

      this.add(this.slot((data) => {
        if ( ! data ) return '';
        return this.E().addClasses(data.classes()).style(data.toStyle()).add(data.label);
      }));
    }
  ]
});
