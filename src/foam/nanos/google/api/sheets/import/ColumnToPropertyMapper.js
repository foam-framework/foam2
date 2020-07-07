/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.google.api.sheets',
  name: 'ColumnToPropertyMapper',
  properties: [
    {
      name: 'maxIteration',
      class: 'Int',
      value: 3
    }
  ],
  methods: [
    {
      name: 'mapColumnNamesToProperties',
      javaType: 'foam.nanos.google.api.sheets.GoogleSheetsImportConfig[]',
      args: [
        {
          name: 'of',
          javaType: 'foam.core.ClassInfo'
        },
        {
          name: 'columnNames',
          javaType: 'String[]'
        }
      ],
      javaCode: `
        return null;
      `
    },
    {
      name: 'mapColumnNameToProperty',
      javaType: 'foam.nanos.google.api.sheets.GoogleSheetsImportConfig',
      args: [
        {
          name: 'of',
          javaType: 'foam.core.ClassInfo'
        },
        {
          name: 'columnName',
          javaType: 'String'
        }
      ],
      code: function(of, columnName) {
        var prop = of.getAxiomByName(columnName);
        //if prop found
        if ( prop ) return prop;
        var propsToCheck = this.gatherSecondLevelProps(of);
        
      },
      javaCode: `
        return null;
      `
    },
    function gatherSecondLevelProps(of) {
      return of.getAxiomsByClass(foam.core.Property).filter(p => ( foam.core.FObjectProperty.isInstance(p) || foam.core.Reference.isInstance(p) ) && ! p.networkTransient);
    }
  ]
});