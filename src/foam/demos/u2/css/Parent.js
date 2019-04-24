foam.CLASS({
  package: 'foam.demos.u2.css',
  name: 'Parent',
  extends: 'foam.u2.Element',
  css: `
^ {
  background-color: red;
}
  `,
  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .add('Hello world');
    }
  ]
});