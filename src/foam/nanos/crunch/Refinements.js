/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.naons.crunch',
  name: 'CapabilityRefinement',
  refines: 'foam.nanos.crunch.Capability',

  implements: [
    'foam.mlang.Expressions',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware'
  ],

  properties: [
    {
      name: 'lastModified',
      class: 'DateTime',
      section: '_defaultSection',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO'
    },
    {
      name: 'lastModifiedBy',
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      section: '_defaultSection',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      tableCellFormatter: function(value, obj) {
        obj.userDAO
          .where(obj.EQ(foam.nanos.auth.User.ID, value))
          .limit(1)
          .select(obj.PROJECTION(foam.nanos.auth.User.LEGAL_NAME))
          .then(function(result) {
            if ( ! result || result.array.size < 1 || ! result.array[0]) {
              this.add(value);
              return;
            }
            this.add(result.array[0]);
          }.bind(this));
      }
    }
  ]
});
