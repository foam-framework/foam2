/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig',
  name: 'DIG',

  documentation: 'Data Integration Gateway - Perform DAO operations against a web service',

  tableColumns: [
    'id',
    'daoKey',
    'cmd',
    'format',
    'owner'
  ],

  searchColumns: [],

  properties: [
    {
        class: 'String',
        name: 'id',
        displayWidth: 40
    },
    {
      class: 'String',
      name: 'daoKey',
      label: 'DAO',
      view: function(_, X) {
        var E = foam.mlang.Expressions.create();
        return foam.u2.view.ChoiceView.create({
          dao: X.nSpecDAO
            .where(E.ENDS_WITH(foam.nanos.boot.NSpec.ID, 'DAO'))
            .orderBy(foam.nanos.boot.NSpec.ID),
          objToChoice: function(nspec) {
            return [nspec.id, nspec.id];
          }
        });
      }
    },
    {
      class: 'Enum',
      of: 'foam.nanos.dig.Command',
      name: 'cmd'
    },
    {
      class: 'Enum',
      of: 'foam.nanos.dig.Format',
      name: 'format'
    },
    {
        class: 'String',
        name: 'key'
    },
    {
      class: 'EMail',
      name: 'email'
    },
    {
      class: 'String',
      name: 'data'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'owner',
      hidden: true
      // TODO: set tableCellRenderer
    },
    {
      class: 'URL',
      name: 'url',
      label: 'URL',
      displayWidth: 100
    }
  ]

  methods: [
  ]
});
