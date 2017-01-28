foam.CLASS({
  package: 'foam.doc',
  name: 'ClassDocView',
  extends: 'foam.u2.View',

  methods: [
    function initE() {
      this.SUPER();
      this.add('CLASS: ', this.data.name);
    }
  ]
});

foam.doc.ClassDocView.create({data: foam.core.Property}).write();
