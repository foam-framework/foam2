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
      class: 'String',
      name: 'dataType',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.exportDriverRegistryDAO.where(X.data.predicate),
          objToChoice: function(a) {
            return [a.id, a.id];
          }
        });
      },
      value: 'CSV'
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
      view: { class: 'foam.u2.CheckBox',  label: 'Export all columns '},
      class: 'Boolean'
    },
    'exportDriverReg',
    {
      class: 'Boolean',
      name: 'isConvertAvailable'
    },
    {
      class: 'Boolean',
      name: 'isDownloadAvailable'
    },
    {
      class: 'Boolean',
      name: 'isOpenAvailable'
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

      self.exportDriverRegistryDAO.where(self.predicate).select().then(function(val) {
        self.exportDriverRegistryDAO.find(val.array[0].id).then(function(val) {
          self.exportDriverReg = val;
        });
      });

      self.dataType$.sub(function() {
        self.exportDriverRegistryDAO.find(self.dataType).then(function(val) {
          self.exportDriverReg = val;
        });
      });
      
      self.exportDriverReg$.sub(function() {
        self.isConvertAvailable =  self.exportDriverReg.isConvertible;
        self.isDownloadAvailable = self.exportDriverReg.isDownloadable;
        self.isOpenAvailable = self.exportDriverReg.isOpenable;
      });
      

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
            self.slot(function(exportDriverReg$exportAllColumns) {
              if ( exportDriverReg$exportAllColumns ) {
                return self.E().start().addClass('label').startContext({ data: self }).tag(self.EXPORT_ALL_COLUMNS).endContext().end();
              }
            })
          )
          .start(this.Cols).style({ 'justify-content': 'flex-start' }).addClass(this.myClass('buttons'))
            .start(this.DOWNLOAD).end()
            .start(this.CONVERT).end()
            .start(this.OPEN).end()
          .end()
        .end()
      .endContext();
    }
  ],

  actions: [
    {
      name: 'convert',
      isAvailable: function(isConvertAvailable) { 
        return isConvertAvailable; 
      },
      code: async function() {
        if ( ! this.exportData && ! this.exportObj ) {
          console.log('Neither exportData nor exportObj exist');
          return;
        }
  
        var filteredColumnsCopy = this.filteredTableColumns;
        if ( this.exportAllColumns )
          this.filteredTableColumns = null;
  
        var exportDriver = foam.lookup(this.exportDriverReg.driverName).create();
  
        try {
          this.note = this.exportData ?
            await exportDriver.exportDAO(this.__context__, this.exportData) :
            await exportDriver.exportFObject(this.__context__, this.exportObj);
        } finally {
          if ( this.exportAllColumns )
            this.filteredTableColumns = filteredColumnsCopy;
        }
      }
    },
    {
      name: 'download',
      isAvailable: function(isDownloadAvailable) { 
        return isDownloadAvailable; 
      },
      code: async function download() {
        var self = this;
        if ( ! this.exportData && ! this.exportObj ) {
          console.log('Neither exportData nor exportObj exist');
          return;
        }
  
        var filteredColumnsCopy = this.filteredTableColumns;
        if ( this.exportAllColumns )
          this.filteredTableColumns = null;
  
        var exportDriver    = foam.lookup(this.exportDriverReg.driverName).create();
  
        var p = this.exportData ?
          exportDriver.exportDAO(this.__context__, this.exportData) :
          Promise.resolve(exportDriver.exportFObject(this.__context__, this.exportObj));
  
        p.then(result => {
          var link = document.createElement('a');
          var href = '';
          if ( self.exportDriverReg.mimeType && self.exportDriverReg.mimeType.length != 0 ) {
            var prefix = 'data:' + self.exportDriverReg.mimeType + ',';
            href = encodeURI(prefix + result);
          } else {
            href = result;
          }
          
          if ( href.length > 524288 ) {
            self.note = result;
            alert('Results exceed maximum download size.\nPlease cut and paste response data.');
          } else {
            link.setAttribute('href', href);
            link.setAttribute('download', 'data.' + self.exportDriverReg.extension);
            document.body.appendChild(link);
            link.click();
          }
        }).finally(() => {
          if ( this.exportAllColumns )
            this.filteredTableColumns = filteredColumnsCopy;
        });
      }
    },
    {
      name: 'open',
      isAvailable: function(isOpenAvailable) { 
        return isOpenAvailable; 
      },
      code: async function() {
        
        var filteredColumnsCopy = this.filteredTableColumns;
        if ( this.exportAllColumns )
          this.filteredTableColumns = null;

        var exportDriver    = foam.lookup(this.exportDriverReg.driverName).create();
        try {
          var url = this.exportData ?
            await exportDriver.exportDAO(this.__context__, this.exportData) :
            await exportDriver.exportFObject(this.__context__, this.exportObj);
        } finally {
          if ( this.exportAllColumns )
            this.filteredTableColumns = filteredColumnsCopy;
        }
        if ( url && url.length > 0 )
          window.location.replace(url);
      }
    }
  ]

});
