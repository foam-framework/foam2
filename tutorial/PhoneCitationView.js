foam.CLASS({
  package: 'tutorial',
  name: 'PhoneCitationView',
  extends: 'foam.u2.DetailView',

  methods: [
    function initE() {
      this
        .start('li')
          .start('a')
            .attrs({ href: '#' + this.data.id })
            .start({ class: 'foam.u2.tag.Image', data: this.data.imageUrl }).addClass('thumb').end()
          .end()
          .start('a')
            .attrs({ href: '#' + this.data.id })
            .add(this.data.name)
          .end()
          .start()
            .add(this.data.snippet)
          .end()
        .end();
    }
  ]
});
