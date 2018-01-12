foam.CLASS({
  name: 'TestPropView',
  extends: 'foam.u2.View',
  requires: [
    'foam.graphics.ScrollCView',
    'foam.u2.IntView',
  ],
  methods: [
    function initE() {
      this.SUPER();

      this.
        add(this.IntView.create({
          data$: this.data$
        })).
        add(this.ScrollCView.create({
          value$: this.data$,
          height: 100,
          width: 40,
          size: 500,
          extent: 1,
        }));
    },
  ],
});

