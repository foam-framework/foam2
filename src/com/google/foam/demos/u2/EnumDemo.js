/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  name: 'TestEnum',

  documentation: 'Color Enum example.',

  values: [
    { name: 'UNKNOWN', label: 'Unknown', color: 'white',  background: 'gray', isItalic: true },
    { name: 'LOW',     label: 'Low' },
    { name: 'MEDIUM',  label: 'Medium',  color: 'yellow', background: 'gray'  },
    { name: 'HIGH',    label: 'High',    color: 'red',    background: 'black', isBold: true, extraClasses: [ 'important' ] }
  ]
});


foam.CLASS({
  name: 'SampleData',

  tableColumns: [ 'id', 'priority', 'description' ],

  properties: [
    {
      name: 'id'
    },
    {
      class: 'Enum',
      of: 'TestEnum',
      name: 'priority'
    },
    {
      class: 'String',
      name: 'description'
    }
  ]
});


foam.CLASS({
  name: 'EnumDemo',
  extends: 'foam.u2.Controller',

  requires: [ 'foam.dao.EasyDAO' ],

  properties: [
    {
      class: 'Enum',
      of: 'TestEnum',
      name: 'enumValue'
    },
    {
      name: 'dao',
      view: 'foam.u2.view.TableView',
      factory: function() {
        return this.EasyDAO.create({
          of: SampleData,
          daoType: 'MDAO',
          testData: [
            { id: 1, priority: 'UNKNOWN', description: 'The unknown.' },
            { id: 2, priority: 'LOW',     description: 'Something trivial.' },
            { id: 3, priority: 'MEDIUM',  description: 'An inconvenience.' },
            { id: 4, priority: 'HIGH',    description: 'Something really bad.' }
          ]
        });
      }
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this
        .add(this.ENUM_VALUE)
        .br()
        .add(this.enumValue$.dot('name'))
        .br()
        .tag({class: 'foam.u2.view.ReadOnlyEnumView'}, { data$: this.enumValue$})
        .br()
        .add(this.slot(function (enumValue) {
          return self.E().addClasses(enumValue.classes()).style(enumValue.toStyle()).add(enumValue.name);
        }))
        .add(this.DAO);
    }
  ]
});
