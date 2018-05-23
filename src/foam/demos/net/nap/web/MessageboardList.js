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

  // implements: [
  //   'foam.mlang.Expressions'
  // ],

  requires: [
    'foam.demos.net.nap.web.model.Messageboard'
  ],

  imports: [
     'stack',
     'messageboardDAO',
     'messageboard'
  ],

  css: `
    ^ .inline-float-right {
      float: right;
      display: inline-block;
    }
    ^ .button-div{
      margin-bottom: 10px;
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


  `,

  properties: [
    {
      name: 'data',
      factory: function() { return this.messageboardDAO; },
      view: {
        class: 'foam.u2.view.ScrollTableView',
        columns: [
          'id', 'title', 'creator', 'createdDate'
        ]
      }
    },
    {
      class: 'String',
      name: 'query',
      view: {
        class: 'foam.u2.TextField',
        type: 'Messageboard Search',
        placeholder: 'Title',
        onKey: true
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

 this.start('table')
  .start('tr')
    .start('td')
        //.start().addClass('button-div')
          .start(this.QUERY).end()
          .start(this.CREATE).end()
          //.start().add('Create').on('click', this.onCreate).end()
        //.end()
    .end()
    .end()
  .end()


  .start('tr')
    .start('td')

      this
        .addClass(this.myClass())
        // .start()
        //   // .start('div')
        //   //   .start().addClass('button-div')
        //   //     .start(this.QUERY).end()
        //   //     .start(this.CREATE).addClass('net-nanopay-ui-ActionView').end()
        //   //     //.start().add('Create').on('click', this.onCreate).end()
        //   //   .end()
        //   // .end()
        //   .start()

            .start('table').addClass('foam-u2-view-TableView')
              .start('thead')
                .start('tr')
                  .start('td').add('').end()
                  .start('td').add('Id').end()
                  .start('td').add('Title').end()
                  .start('td').add('Creator').end()
                  .start('td').add('Date').end()
                  .start('td').add('').end()
              .end()
            .end()
            .start('tbody')
              .select(this.messageboardDAO.orderBy(this.Messageboard.ID), function(m) {
                var cb = foam.u2.md.CheckBox.create({data: m.starmark});
                cb.data$.sub(function() { self.starMessageboard(m, cb.data); });

                this.start('tr').on('dblclick', function() { self.stack.push({
                      class: 'foam.demos.net.nap.web.EditMessageboard',
                      data: m
                    }, this); } )
                  .start('td').tag(cb).end()
                  .start('td').add(m.id).end()
                  .show(self.query$.map(function(query) { query = query.trim(); return query == "" || m.title.indexOf(query) != -1; }))
                  .start('td').add(m.title).end()
                  .start('td').add(m.creator).end()
                  .start('td').add(m.createdDate.toISOString().substring(0,10)).end()
                  .start('td')
                    .callIf(m.messageboardFile[0], function(){
                      this.start().addClass('table-attachment')
                        .tag({ class: 'foam.u2.tag.Image', data: 'images/ic-attachment.svg' })
                      .end()
                    })
                  .end()

                .end()
              }).end()


          //   .end()
          // .end()

          .end()
          .end()
        .end()


         .end();
    },

    function starMessageboard(messageboard, data) {
      var dao = this.messageboardDAO;
      dao.find(messageboard).then(function(messageboard) {

        messageboard.starmark = data;
        dao.put(messageboard);
      });
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
