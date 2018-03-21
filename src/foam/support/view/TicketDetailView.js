foam.CLASS({
  package: 'foam.support.view',
  name: 'TicketDetailView',
  extends: 'foam.u2.View',

  imports: [
    'stack'
  ],
  
  exports: [
    'as data'
  ],

  css: `
    ^ {
      width: 992px;
      margin-top: 25px;
    }
    ^ .foam-u2-UnstyledActionView-backAction {
      width: 135px;
      height: 40px;
      border: 1px solid lightgrey;
      background-color: rgba(164, 179, 184, 0.1);
      vertical-align: top;
      position: sticky;
      z-index: 10;
    }
  `,

  methods: [
    function initE(){
      var self = this;
      
      console.log(this.data)
      this.addClass(this.myClass())
      .start(this.BACK_ACTION).end()
      // note to ANUBHAV, ticket object is stored in this.data
      .start().add(this.data.id).end()
      .start().add(this.data.createdAt).end()
      .add(this.data.status)

    }
  ],
  actions: [
    {
      name: 'backAction',
      label: 'Back',
      code: function(X){
        X.stack.push({ class: 'foam.support.view.TicketView'});
      }
    }
  ]
});