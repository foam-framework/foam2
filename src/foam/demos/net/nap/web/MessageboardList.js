/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.demos.net.nap.web',
  name: 'MessageboardList',
  extends: 'foam.u2.Controller',

  documentation: 'Messageboard List',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.demos.net.nap.web.model.Messageboard'
  ],

  imports: [
     'messageboard',
     'messageboardDAO',
     'stack'
  ],

  exports: [
    'dblclick',
    'filter',
    'filteredMessageboardDAO'
  ],

  css: `
    ^ {
      width: 962px;
      margin: 0 auto;
    }
    ^ .button-div{
      margin-bottom: 10px;
      margin-left: 15px;
    }
    ^ .net-nanopay-ui-ActionView-create{
      margin-bottom: 10px;
      float: right;
    }
   ^ table {
     border-collapse: collapse;
     margin: auto;
     width: 962px;
     max-height:200px;
     overflow-y:auto;
   }
   ^ .foam-u2-view-TableView {
    border-spacing: 14px 8px;
    overflow: scroll;
   }
   ^ table > tbody:nth-child(even) {
     background: #f6f9f9;
   }
   ^ td {
    font-family: Roboto;
    font-size: 12px;
    line-height: 1.33;
    letter-spacing: 0.2px;
    padding-left: 15px;
    font-size: 12px;
    color: #093649;
   }
  ^ tr {
    display: table-row;
    vertical-align: inherit;
    border-color: inherit;
    height: 20px;
  }
  ^ .table-attachment {
    width: 20px;
    height: 20px;
    float: left;
    padding: 10px 0 0 10px;
  }
  ^ thead {
    width: 962px;
    background-color: rgba(110, 174, 195, 0.2);
    padding-bottom: 10px;
    margin: 0;
  }
  ^ table > thead > tr {
    height: 40px;
  }
  ^ table > tbody > tr {
    height: 35px;
  }
  ^ .net-nanopay-ui-ActionView {
    background: #59aadd;
    color: white;
    margin-right: 4px;
  }
  ^ .filter-search {
    width: 450px;
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
  ^ .searchIcon {
    position: absolute;
    margin-left: 5px;
    margin-top: 8px;
  }



  `,

  properties: [
    {
      name: 'data',
      factory: function() { return this.messageboardDAO; },
      // view: {
      //   class: 'foam.u2.view.ScrollTableView',
      //   columns: [
      //     'mark', 'id', 'title', 'creator', 'createdDate'
      //   ]
      // }
    },
    {
      class: 'String',
      name: 'filter',
      view: {
        class: 'foam.u2.TextField',
        type: 'Messageboard Search',
        placeholder: 'Title',
        onKey: true
      }
    },
    {
      name: 'filteredMessageboardDAO',
      expression: function(data, filter) {
        return this.messageboardDAO.where(this.CONTAINS_IC(this.Messageboard.TITLE, filter));//.orderBy(this.DESC(this.Messageboard.CREATED_DATE));
      },
      view: {
        class: 'foam.u2.view.ScrollTableView',
        columns: [
          'mark', 'id', 'title', 'creator', 'createdDate'
        ]
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .start()
          .start().addClass('container')
            .start().addClass('button-div')
              //.start(this.QUERY).end()
              .start({class: 'foam.u2.tag.Image', data: 'images/ic-search.svg'}).addClass('searchIcon').end()
              .start(this.FILTER).addClass('filter-search').end()
              .start(this.CREATE).end()
            .end()
          .end()
          .add(this.FILTERED_MESSAGEBOARD_DAO)
          .tag({ class: 'net.nanopay.ui.Placeholder', dao: this.data, message: this.placeholderText, image: 'images/person.svg'})
      .end();
    },
  function dblclick(messageboard) {
    this.stack.push({ class: 'foam.demos.net.nap.web.EditMessageboard', data: messageboard });
  }
  ],

  actions: [
    {
      name: 'create',
      label: 'Create',
      code: function(X) {
        var self = this;

        self.stack.push({ class: 'foam.demos.net.nap.web.MessageboardForm' });
      }
    }
  ],

  listeners: [
 ]
});
