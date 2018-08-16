foam.CLASS({
  package: 'foam.u2',
  name: 'ExportModal',
  extends: 'foam.u2.View',

  documentation: 'Export Modal',

  imports: [
    'exportDriverRegistryDAO'
  ],

  requires: [
    'foam.u2.ModalHeader'
  ],

  properties: [
    {
      name: 'dataType',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.exportDriverRegistryDAO,
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
      margin-top: 10px;
    }
    ^ .note {
      height: 150px;
      width: 398px;
      margin-left: 25px;
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
          .start(this.CONVERT).addClass('blue-button').addClass('btn').end()
        .end()
      .endContext();
    }
  ],

  actions: [
    async function convert() {
      var exportDriver = await this.exportDriverRegistryDAO.find(this.dataType);
      exportDriver = foam.lookup(exportDriver.driverName).create();

      if ( this.exportData ) {
        this.note = await exportDriver.exportDAO(this.__context__, this.exportData);
      } else {
        this.note = await exportDriver.exportFObject(this.__context__, this.exportObj);
      }
    }
  ]
});
