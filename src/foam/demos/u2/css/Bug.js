foam.CLASS({
  package: 'foam.demos.u2.css',
  name: 'Bug',
  extends: 'foam.u2.Element',
  requires: [
    'foam.demos.u2.css.Child',
    'foam.demos.u2.css.Parent'
  ],
  methods: [
    function initE() {
      this.SUPER();
      this
        // SWITCH THE ORDER OF THE FOLLOWING LINES TO SEE DIFFERENT STYLINGS
        .tag(this.Parent)
        .tag(this.Child)
    }
  ]
});