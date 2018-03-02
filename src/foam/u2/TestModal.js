
foam.CLASS({
  package: 'foam.u2',
  name: 'TestModal',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.ModalHeader'
  ],

  methods: [
    function initE(){
      this.SUPER();
      var self = this;
          
      this
      .tag(this.ModalHeader.create({
        title: 'Email'
      }))
      .add("you")
    } 
  ]
});