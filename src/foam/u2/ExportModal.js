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
    'exportDriverRegistryDAO',
    'filteredTableColumns'
  ],

  requires: [
    'foam.u2.ModalHeader',
    'foam.u2.layout.Cols'
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
      name: 'predicate',
      factory: function() { return foam.mlang.predicate.True.create(); }
    },
    'exportData',
    'exportObj',
    {
      name: 'exportAllColumns',
      view: { class: 'foam.u2.CheckBox' },
      class: 'Boolean'
    }
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
      var self = this;
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
          .add(
            self.slot(function(dataType) {
              if ( dataType == 'CSV' ) {
                return self.E().start().addClass('label').add('Export all columns ').startContext({ data: self }).add(self.EXPORT_ALL_COLUMNS).endContext().end();
              }
            })
          )
          .start(this.Cols).style({ 'justify-content': 'flex-start' }).addClass(this.myClass('buttons'))
            .start(this.DOWNLOAD).end()
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

      var filteredColumnsCopy = this.filteredTableColumns;
      if ( this.exportAllColumns )
        this.filteredTableColumns = null;

      var exportDriver = await this.exportDriverRegistryDAO.find(this.dataType);
      exportDriver = foam.lookup(exportDriver.driverName).create();

      this.note = this.exportData ?
        await exportDriver.exportDAO(this.__context__, this.exportData) :
        await exportDriver.exportFObject(this.__context__, this.exportObj);

        if ( this.exportAllColumns )
          this.filteredTableColumns = filteredColumnsCopy;
    },

    async function download() {
      var self = this;
      if ( ! this.exportData && ! this.exportObj ) {
        console.log('Neither exportData nor exportObj exist');
        return;
      }

      var filteredColumnsCopy = this.filteredTableColumns;
      if ( this.exportAllColumns )
        this.filteredTableColumns = null;

      var exportDriverReg = await this.exportDriverRegistryDAO.find(this.dataType);
      var exportDriver    = foam.lookup(exportDriverReg.driverName).create();

      var p = this.exportData ?
        exportDriver.exportDAO(this.__context__, this.exportData) :
        Promise.resolve(exportDriver.exportFObject(this.__context__, this.exportObj));

      p.then(result => {
        var prefix = 'data:' + exportDriverReg.mimeType + ',';
        var link = document.createElement('a');
        var href = encodeURI(prefix + result);
        if ( href.length > 524288 ) {
          self.note = result;
          alert('Results exceed maximum download size.\nPlease cut and paste response data.');
        } else {
          link.setAttribute('href', href);
          link.setAttribute('download', 'data.' + exportDriverReg.extension);
          document.body.appendChild(link);
          link.click();
        }
      });

      if ( this.exportAllColumns )
        this.filteredTableColumns = filteredColumnsCopy;
    }
  ]

});
