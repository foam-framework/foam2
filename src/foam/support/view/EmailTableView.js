foam.CLASS({
    package:'foam.support.view',
    name:'EmailTableView',
    extends:'foam.u2.View',

    css:`
    ^ .foam-u2-UnstyledActionView-create {
      width: 135px;
      height: 40px;
      border-radius: 2px;
      background-color: #59a5d5;
      margin-top: 30px;
      margin-right: 620px;
      font-family: Roboto;
      font-size: 14px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 2.86;
      letter-spacing: 0.2px;
      text-align: center;
      color: #ffffff;
    }
    ^ .foam-support-view-EmailSupportTableView-table {
      height:400px
      overflow: Scroll;
    }
    ^ .foam-u2-view-TableView{
      height:400px
      overflow: Scroll;
    }
    `,
    requires: [ 'foam.u2.ListCreateController' ,
              'foam.support.view.EmailSupportTableView' ],

    imports: [ 'supportEmailDAO' , 'createLabel' ],

    methods: [
      function initE(){
        this
        .addClass(this.myClass())
        .tag({
          class: 'foam.u2.ListCreateController' ,
          dao: this.supportEmailDAO,
          summaryView: this.EmailSupportTableView,
          createLabel: 'New Email' ,
          showActions:true
      })
    }
  ]
})

foam.CLASS({
    package: 'foam.support.view',
    name: 'EmailSupportTableView',
    extends: 'foam.u2.View',
    requires: [
      'foam.u2.TableView',
      'foam.support.model.SupportEmail'
    ],
    
    exports: [ 'as data' ],

    imports: [ 'supportEmailDAO' ],
      
    methods: [
      function initE() {
        this
          .start({
            selection: this.selection$,
            class: 'foam.u2.view.TableView',
            data: this.supportEmailDAO,
          }).addClass(this.myClass('table')).end();
      }
    ],
  })