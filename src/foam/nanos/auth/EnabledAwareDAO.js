/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// TODO: Test
foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'EnabledAwareDAO',
  extends: 'foam.dao.FilteredDAO',

  properties: [
    {
      name: 'predicate',
      factory: function() {
        return this.EQ(this.EnabledAware.ENABLED, true);
      }
    }
  ]
});
