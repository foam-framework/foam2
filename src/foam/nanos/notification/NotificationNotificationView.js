foam.CLASS({
  package: 'foam.nanos.notification',
  name: 'NotificationNotificationView',
  extends: 'foam.nanos.notification.NotificationView',
  methods: [
    function initE() {
      this
        .start('div').addClass('body').add(this.data.body).end();
    }
  ]
});
