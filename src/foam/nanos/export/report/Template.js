/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.export.report',
  name: 'Template',

  imports: [
    'columnConfigToPropertyConverter',
  ],

  requires: [
    'foam.mlang.predicate.Eq'
  ],

  properties: [
    {
      name: 'id',
      class: 'String',
      documetation: 'file id'
    },
    {
      name: 'daoKey',
      class: 'String'
    },
    {
      name: 'name',
      class: 'String',
    },
    {
      class: 'StringArray',
      name: 'columnLabels',
      label: 'Table Columns',
      documentation: 'List of property labels which required for template',
      postSet: async function(o, n) {
        var dao = await this.__subContext__.nSpecDAO.find(this.Eq.create({ arg1: foam.nanos.boot.NSpec.NAME, arg2: this.daoKey }));
        if ( ! dao )
          return;
        var client = JSON.parse(dao.client);
        var of =  foam.lookup(client.of);
        var columnConfigToPropertyConverter = this.columnConfigToPropertyConverter;
        if ( ! columnConfigToPropertyConverter )
          columnConfigToPropertyConverter = foam.nanos.column.ColumnConfigToPropertyConverter.create();
        if ( of )
          this.columnNames = n.map( l => columnConfigToPropertyConverter.returnPropertyNameForLabel(of, l));
      }
    },
    {
      class: 'StringArray',
      name: 'columnNames',
      transient: true,
      hidden: true,
      documentation: 'List of property names which required for template'
    }
  ]
});