foam.CLASS({
  package:'foam.support.view',
  name:'SupportEmailView',
  extends:'foam.u2.View',

  requires: [ 
    'foam.u2.ListCreateController',
    'foam.u2.dialog.Popup'
  ],

  imports: [ 
    'supportEmailDAO', 
    'createLabel',  
    'ctrl' 
  ],

  exports: [
    'as data'
  ],

  css:`
    ^ {
      padding: 2px;
    }
    ^ .foam-u2-UnstyledActionView-create {
      display: none;
    }
    ^ .foam-u2-UnstyledActionView-newEmail{
      width: 135px;
      height: 40px;
      border-radius: 2px;
      background-color: #59a5d5;
      margin-top: 30px;
      margin-right: 600px;
      font-family: Roboto;
      font-size: 14px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 2.86;
      letter-spacing: 0.2px;
      text-align: center;
      color: #ffffff;
      position: relative;
      margin: auto;
      margin-left: 
    }
    ^ .btn-mid{
      width: 100%;
      text-align: center;
      margin-top: 20px;
      margin-bottom: 23px;
    }
    ^ .Rectangle-11-Copy {
      width: 1027px;
      border-radius: 2px;
      background-color: #ffffff;
      margin: auto;
    }
    ^ .title{
      width: 100%;
      height: 20px;
      opacity: 0.6;
      font-family: Roboto;
      font-size: 20px;
      font-weight: 300;
      font-style: normal;
      font-stretch: normal;
      line-height: 1;
      letter-spacing: 0.3px;
      text-align: left;
      color: #093649;
      padding-left: 10px;
      padding-right: 10px;
      padding-top: 30px;
    }
    ^ .title1{
      padding: 2px;
      margin: 28px;
    }
    ^ .align{
      margin-left: 10px;
      margin-right: 10px;
      margin-bottom: 30px;
    }
    ^ .input-container-half{
      width: 960px;
      height: 35px;
      border-radius: 2px;
      background-color: #ffffff;
    }
    ^ .No-support-email-con{
      width: 183px;
      height: 16px;
      font-family: Roboto;
      font-size: 14px;
      font-weight: 300;
      font-style: normal;
      font-stretch: normal;
      line-height: normal;
      letter-spacing: 0.2px;
      text-align: left;
      color: #093649;
      margin-left: 389px;
      margin-right: 388px
    }
    ^ .foam-u2-view-TableView-th-connectedTime{
      width: 140px;
    }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'emptyDAO',
    }
  ],

  methods: [
    function initE(){
      var self = this;
      this.supportEmailDAO.limit(1).select().then(function(a){ 
        self.emptyDAO = a.array.length == 0;
      });

      this
      .addClass(this.myClass())
      .start().addClass('Rectangle-11-Copy')
        .start().addClass('title1')
          .start().add('Support Email Management').addClass('title').end()
          .start().addClass('align').end() 
          .start({
            class: 'foam.u2.ListCreateController',
            dao: this.supportEmailDAO,
            summaryView: this.EmailSupportTableView.create(),
            showActions: false
          }).hide(this.emptyDAO$).end()
          .start().addClass('input-container-half').show(this.emptyDAO$)
            .start().add('No Email Support Connected').addClass('No-support-email-con').end()
          .end()
          .start().addClass('btn-mid')
            .start(this.NEW_EMAIL).end()
          .end()
        .end()   
      .end()
    }
  ],

  actions: [
    {
      name: 'newEmail',
      label: 'New Email',
      code: function(){
        this.ctrl.add(this.Popup.create().tag({ class: 'foam.support.modal.NewEmailSupportModal'}));
      }
    }
  ],

  classes: [
    {
      name: 'EmailSupportTableView',
      extends: 'foam.u2.View',
      
      exports: [ 'as data' ],
      
      imports: [ 'supportEmailDAO' ],
      
      properties: [
        'selection'
      ],
      
  methods: [
      function initE() {
        this
          .start({
            selection$: this.selection$,
            class: 'foam.u2.view.ScrollTableView',
            height: 20,
            data: this.supportEmailDAO,
            columns: ['id', 'email', 'status', 'connectedTime']
          }).addClass(this.myClass('table')).end();
          }
        ] 
      }
    ]
  });