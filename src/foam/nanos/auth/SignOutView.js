foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'SignOutView',
  extends: 'foam.u2.View',

  documentation: 'Sign Out View',

  imports: [
    'auth',
    'window'
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.auth.logout().then(function() {
        self.window.location.hash = '';
        self.window.location.reload();
      });
    }
  ]
});
