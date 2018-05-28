foam.CLASS({
  package: 'foam.nanos.notification.notifications',
  name: 'NotificationScriptNotificationView',
  extends: 'foam.nanos.notification.NotificationView',

  imports: [
    'stack',
    'scriptDAO'
  ],

  exports: [
    'as data',
    'scriptDAO as dao'
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
      .addClass(this.myClass())
        .start(this.LINK).end();
    }
  ],
  actions: [
    {
      name: 'link',
      label: 'Go to script',
      code: function() {
        var self = this;
        self.stack.push({ class: 'foam.comics.DAOUpdateControllerView', key: this.data.script.id }, this );
      }
    }
  ]
})