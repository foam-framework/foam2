foam.CLASS({
  package: 'foam.u2',
  name: 'CompositeView',
  extends: 'foam.u2.View',
  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.u2.ViewSpec',
      name: 'views'
    }
  ],
  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.add(this.slot(function(views) {
        return self.E().forEach(views, function(v) {
          return this.start(v, { data$: self.data$ }).end();
        });
      }));
    }
  ]
});