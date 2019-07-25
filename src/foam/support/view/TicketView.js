/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.support.view',
  name: 'TicketView',
  extends: 'foam.u2.View',

  requires: [
    'foam.support.view.CreateTicketView',
    'foam.support.view.TicketDetailView',
    'foam.u2.ListCreateController'
  ],

  imports: [ 'user' ,'createLabel'],

  exports: [ 'hideSummary' ],

  css:`
    ^ {
      width: 970px;
      margin: auto;
    }
    ^ .foam-support-view-SummaryCard{
      width: 15.8%;
    }
    ^ .foam-u2-ActionView-create {
      float: right;
      width: 135px;
      height: 40px;
      color: white;
      background-color: #59a5d5;
      border: none;
      margin: 0 20px 20px;
    }
    ^ .foam-u2-view-TableView-row:hover {
      cursor: pointer;
      background: /*%GREY4%*/ #e7eaec;
    }
    ^ .foam-u2-view-TableView-row {
      height: 40px;
    }
    ^ .button-div{
      height: 40px;
    }
    ^ .foam-u2-view-TableView td{
      width: 8px;
    }
    ^ .foam-u2-ListCreateController{
      top: 30px;
      position: relative;
    }
    ^ .foam-u2-view-TableView-th-editColumns{
      width: 10px;
    }
    ^ .foam-u2-view-TableView-th-id{
      width: 125px;
    }
    ^ .foam-u2-view-TableView-th-requestorEmail{
      width: 200px;
    }
    ^ .foam-u2-view-TableView-th-requestorName{
      width: 200px;
    }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'hideSummary'
    }
  ],

  methods: [
    function initE(){

      this.addClass(this.myClass())
      .start().hide(this.hideSummary$)
        .tag({ class: 'foam.support.view.TicketSummaryView' })
      .end()
      .tag({
        class: 'foam.u2.ListCreateController',
        dao: this.user.tickets,
        detailView: this.TicketDetailView,
        summaryView: this.TicketTableView,
        createDetailView: this.CreateTicketView,
        createLabel:'New Ticket',
        showActions: false
      })
    }
  ],
  
  classes: [
    {
      name: 'TicketTableView',
      extends: 'foam.u2.View',

      requires: [
        'foam.u2.view.ScrollableTableView',
        'foam.support.model.Ticket',
      ],
      
      imports: [ 'user'],

      properties: [
        'selection'
      ],

      methods: [
        function initE() {
          this
            .start({
              selection$: this.selection$,
              class: 'foam.u2.view.ScrollTableView',
              data: this.user.tickets,
            }).addClass(this.myClass('table')).end();
        }
      ]
    }
  ]
});

