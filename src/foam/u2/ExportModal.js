/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'ExportModal',
  extends: 'foam.u2.View',

  documentation: 'Export Modal',

  imports: [
    'exportDriverRegistryDAO'
  ],

  requires: [
    'foam.u2.ModalHeader',
    'foam.u2.layout.Cols',
  ],

  properties: [
    {
      name: 'dataType',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.exportDriverRegistryDAO.where(X.data.predicate),
          objToChoice: function(a) {
            return [a.id, a.id];
          }
        });
      }
    },
    {
      name: 'note',
      view: 'foam.u2.tag.TextArea',
      value: ''
    },
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      name: 'predicate'
    },
    'exportData',
    'exportObj'
  ],

  css: `
    ^{
      width: 448px;
      margin: auto;
    }
    ^ .foam-u2-tag-Select {
      width: 125px;
      height: 40px;
      border-radius: 0;
      margin-left: 25px;
      padding: 12px 20px;
      border: solid 1px rgba(164, 179, 184, 0.5);
      background-color: white;
      outline: none;
    }
    ^ .foam-u2-tag-Select:hover {
      cursor: pointer;
    }
    ^ .foam-u2-tag-Select:focus {
      border: solid 1px #59A5D5;
    }
    ^ .label{
      margin: 10px 0px 0px 25px;
    }
    ^ .note {
      height: 150px;
      width: 398px;
      margin-left: 25px;
    }
    ^buttons {
      padding: 12px;
    }

    ^ .foam-u2-ActionView-primary {
      margin: 12px;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();

      this
      .tag(this.ModalHeader.create({
        title: 'Export'
      }))
      .addClass(this.myClass())
      .startContext({ data: this })
        .start()
          .start().addClass('label').add('Data Type').end()
          .start(this.DATA_TYPE).end()
          .start().addClass('label').add('Response').end()
          .start(this.NOTE).addClass('input-box').addClass('note').end()
          .start(this.Cols).style({ 'justify-content': 'flex-start' }).addClass(this.myClass('buttons'))
            .start(this.DOWNLOAD_CSV).end()
            .start(this.CONVERT).end()
          .end()
        .end()
      .endContext();
    }
  ],

  actions: [
    async function convert() {
      if ( ! this.exportData && ! this.exportObj ) {
        console.log('Neither exportData nor exportObj exist');
        return;
      }

      var exportDriver = await this.exportDriverRegistryDAO.find(this.dataType);
      exportDriver = foam.lookup(exportDriver.driverName).create();

      this.note = this.exportData 
                    ? await exportDriver.exportDAO(this.__context__, this.exportData)
                    : await exportDriver.exportFObject(this.__context__, this.exportObj);
    },

    async function downloadCSV() {
      if ( ! this.exportData && ! this.exportObj ) {
        console.log('Neither exportData nor exportObj exist');
        return;
      }

      var exportDriver = await this.exportDriverRegistryDAO.find(this.dataType);
      exportDriver = foam.lookup(exportDriver.driverName).create();

      var p = this.exportData 
                ? exportDriver.exportDAO(this.__context__, this.exportData)
                : Promise.resolve(exportDriver.exportFObject(this.__context__, this.exportObj));

      p.then(result => {
        result = 'data:text/csv;charset=utf-8,' + result;
        var link = document.createElement('a');
        link.setAttribute('href', encodeURI(result));
        link.setAttribute('download', 'data.csv');
        document.body.appendChild(link);
        link.click();
      })
    }
  ]

});
