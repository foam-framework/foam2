/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.INTERFACE({
  package: 'foam.core',
  name: 'ValidationPropertyExport',

  documentation: `
    A model should implement this interface if you would like to give a model the capability to 
    export the validation placed on it's properties.
  `,

  requires: [
    'foam.dao.MDAO',
    'foam.dao.EasyDAO',
    'foam.nanos.export.CSVDriver'
  ],

  classes: [
    {
      name: 'exportModel',

      tableColumns: [
        'propName',
        'errorStrings',
        'maxStrLength',
        'minStrLength',
        'minNumLength',
        'maxNumLength'
      ],

      properties: [
        'id',
        'fieldName',
        {
          class: 'Array',
          name: 'criteria'
        },
        {
          name: 'minStrLength',
          label: 'Min String Length'
        },
        {
          name: 'maxStrLength',
          label: 'Max String Length'
        },
        {
          name: 'minNumLength',
          label: 'Min Number Length'
        },
        {
          name: 'maxNumLength',
          label: 'Max Number Length'
        }
      ]
    }
  ],

  properties: [
    {
      name: 'dao',
      hidden: true,
      factory: function() {
        return this.EasyDAO.create({
          seqNo: true,
          autoIndex: true,
          daoType: this.MDAO,
          of: this.exportModel
        });
      }
    },
    {
      name: 'csvDriver',
      hidden: true,
      factory: function() {
        return this.CSVDriver.create();
      }
    }
  ],

  actions: [
    async function exportValidation(X) {
      var properties = this.cls_.getAxiomsByClass(foam.core.Property);
      properties.forEach((p) => {
        var export_ = this.exportModel.create({
          fieldName: p.label,
          minStrLength: p.minLength,
          maxStrLength: p.maxLength,
          minNumLength: p.min,
          maxNumLength: p.max
        });
        if ( p.validationPredicates.length > 0 ) {
          p.validationPredicates.forEach((pred) => {
            export_.criteria.push(pred.errorString);
          });
        }
        this.dao.put(export_);
      });

      this.csvDriver.exportDAO(this.__context__, this.dao)
      .then(function(result) {
        let encodedUri = encodeURIComponent(result);
        let uri = 'data:text/csv;charset=utf-8,' + encodedUri;
        var link = document.createElement('a');
        link.setAttribute('href', uri);
        link.setAttribute('download', 'data.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }
  ]
});
