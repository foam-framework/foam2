foam.CLASS({
  package: 'foam.nanos.logger',
  name: 'LogsView',
  extends: 'foam.u2.View',

  documentation: 'View displaying searchable logs',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.logger.LogMessage',
  ],

  imports: [
    'logMessageDAO',
  ],

  exports: [
    'as data',
    'filter',
    'filteredLogMessageDAO',
  ],

  css: `
    ^ {
      width: 962px;
      margin: 0 auto;
    }
    ^ h3 {
      opacity: 0.6;
      font-family: Roboto;
      font-size: 20px;
      font-weight: 300;
      line-height: 1;
      letter-spacing: 0.3px;
      text-align: left;
      color: #093649;
      margin: 0;
      display: inline-block;
      vertical-align: top;
      margin-bottom: 30px;
    }
    ^ .tableBarDiv {
      margin-top: 25px;
      margin-bottom: 10px;
    }
    ^ .titleMargin {
      margin: 0;
    }
    ^ .searchIcon {
      position: absolute;
      margin-left: 5px;
      margin-top: 8px;
    }
    ^ table {
      border-collapse: collapse;
      margin: auto;
      width: 962px;
    }
    ^ thead > tr > th {
      font-family: 'Roboto';
      font-size: 14px;
      background: %TABLECOLOR%;
      color: #093649;
      line-height: 1.14;
      letter-spacing: 0.3px;
      border-spacing: 0;
      text-align: left;
      padding-left: 15px;
      height: 40px;
    }
    ^ tbody > tr > th > td {
      font-size: 12px;
      letter-spacing: 0.2px;
      text-align: left;
      color: #093649;
      padding-left: 15px;
      height: 60px;
    }
    ^ .filter-search {
      width: 225px;
      height: 40px;
      border-radius: 2px;
      background-color: #ffffff;
      display: inline-block;
      margin-bottom: 30px;
      vertical-align: top;
      border: 0;
      box-shadow:none;
      padding: 10px 10px 10px 31px;
      font-size: 14px;
    }
    ^ .foam-u2-view-TableView-row:hover {
      cursor: pointer;
      background: %TABLEHOVERCOLOR%;
    }
    ^ .foam-u2-view-TableView-row {
      height: 40px;
    }
    ^ .foam-u2-md-OverlayDropdown {
      width: 175px;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'filter',
      view: {
        class: 'foam.u2.TextField',
        type: 'search',
        placeholder: 'Message Search',
        onKey: true
      }
    },
    {
      name: 'data',
      factory: function() {
        data = this.logMessageDAO.orderBy(this.DESC(this.LogMessage.CREATED));
        return data;
      }
    },
    {
      name: 'filteredLogMessageDAO',
      expression: function(data, filter ) {
        if ( filter ) {
          return data.where(this.CONTAINS(this.LogMessage.MESSAGE, filter)).orderBy(this.DESC(this.LogMessage.CREATED));
        }
        else {
          return data.orderBy(this.DESC(this.LogMessage.CREATED));
        }
      },
      view: {
        class: 'foam.u2.view.ScrollTableView',
        columns: [
          'created', 'severity', 'createdBy', 'lastModifiedBy', 'message'
        ]
      }
    }
  ],


  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start()
          .start().addClass('container')
            .start().addClass('button-div')
              .start({class: 'foam.u2.tag.Image', data: 'images/ic-search.svg'}).addClass('searchIcon').end()
              .start(this.FILTER).addClass('filter-search').end()
            .end()
          .end()
          .add(this.FILTERED_LOG_MESSAGE_DAO)
        .end();
    }
  ],

});
