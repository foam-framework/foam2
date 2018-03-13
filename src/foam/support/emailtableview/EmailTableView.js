foam.CLASS({
    package:'foam.support.emailtableview',
    name:'EmailTableView',
    extends:'foam.u2.View',
    requires:['foam.u2.ListCreateController',
  'foam.support.emailtableview.EmailSupportTableView'],

  imports:['supportEmailDAO'],
    methods:[
            function initE(){
                this.addClass(this.myClass())
                .tag({
                  class: 'foam.u2.ListCreateController',
                  dao: this.supportEmailDAO,
                  summaryView: this.EmailSupportTableView,
                })
              }
    ]
})

foam.CLASS({
    package:'foam.support.emailtableview',
    name: 'EmailSupportTableView',
    extends: 'foam.u2.View',
    requires: [
      'foam.u2.TableView',
      'foam.support.model.SupportEmail',
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