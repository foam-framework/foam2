foam.CLASS({
  package: 'foam.nanos.notification',
  name: 'NotificationView',
  extends: 'foam.u2.View',
  axioms: [ foam.pattern.Faceted.create() ],
  properties: [ 'of' ],
  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        //.start('div').addClass('body').add(this.data.body).end();
        .start('div').addClass('body').add("this.data.body").end();
    }
  ]
})