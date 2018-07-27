/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.demos.net.nap.web',
  name: 'RegulatoryNoticeList',
  extends: 'foam.u2.Controller',

  documentation: 'RegulatoryNotice List',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.demos.net.nap.web.model.RegulatoryNotice',
    'foam.demos.net.nap.web.model.RegulatoryNoticeAudit',
    'foam.nanos.auth.Group'
  ],

  imports: [
     'auth',
     'groupDAO',
     'regulatoryNotice',
     'regulatoryNoticeAudit',
     'regulatoryNoticeDAO',
     'regulatoryNoticeAuditDAO',
     'stack',
     'user'
  ],

  exports: [
    'dblclick',
    'filter',
    'filteredRegulatoryNoticeDAO'
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
      factory: function() { return this.regulatoryNoticeDAO; }
    },
    {
      class: 'String',
      name: 'filter',
      view: {
        class: 'foam.u2.TextField',
        type: 'search',
        placeholder: 'Search : Title, Content, Creator',
        onKey: true
      }
    },
    {
      name: 'filteredRegulatoryNoticeDAO',
      expression: function(data, filter) {
        return this.regulatoryNoticeDAO.where(this.OR(this.CONTAINS_IC(this.RegulatoryNotice.TITLE, filter), this.CONTAINS_IC(this.RegulatoryNotice.CONTENT, filter))).orderBy(this.DESC(this.RegulatoryNotice.CREATED_DATE));
      },
      view: {
        class: 'foam.u2.view.ScrollTableView',
        columns: [
          'starmark', 'id', 'title', 'creator', 'createdDate', 'hits'
        ]
      }
    },
    {
      class: 'String',
      name: 'viewer'
    },
    {
      class: 'Boolean',
      name: 'rwPermission',
      value: false
    },
    {
      class: 'Boolean',
      name: 'rPermission',
      value: false
    },
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this.groupDAO.find(this.user.group).then(function (group) { if ( group.implies('*') || group.implies('regulatoryNotice.write.*') ) { self.rwPermission = true; }
                                                                  if ( group.implies('*') || group.implies('regulatoryNotice.read.*') ) { self.rPermission = true; }
                                              } )

      this
        .addClass(this.myClass())
        .start()
          .start().addClass('container')
            .start().addClass('button-div')
              .start({class: 'foam.u2.tag.Image', data: 'images/ic-search.svg'}).addClass('searchIcon').end()
              .start(this.FILTER).addClass('filter-search').end()
              .start(this.CREATE).show(self.rwPermission$).end()
            .end()
          .end()
          .add(this.FILTERED_REGULATORY_NOTICE_DAO)
      .end();
    },
    function dblclick(regulatoryNotice) {
      if ( !( self.rwPermission || !self.rPermission ) ) {
        return;
      }

      var regulatoryNoticeAudit = this.RegulatoryNoticeAudit.create({
        userId: this.user.id,
        regulatoryNoticeId: regulatoryNotice.id
      });

      var message = this.RegulatoryNotice.create({
        id : regulatoryNotice.id,
        starmark : regulatoryNotice.starmark,
        title: regulatoryNotice.title,
        content: regulatoryNotice.content,
        creator : regulatoryNotice.creator,
        createdDate : regulatoryNotice.createdDate,
        data : Array.from(regulatoryNotice.data),
        hits: regulatoryNotice.hits + 1
      });

      this.regulatoryNoticeAuditDAO.put(regulatoryNoticeAudit);
      this.regulatoryNoticeDAO.put(message);
      this.stack.push({ class: 'foam.demos.net.nap.web.EditRegulatoryNotice', data: regulatoryNotice });
    }
  ],

  actions: [
    {
      name: 'create',
      code: function(X) {
        var self = this;

        self.stack.push({ class: 'foam.demos.net.nap.web.RegulatoryNoticeForm' });
      }
    }
  ]
});
