foam.CLASS({
  package: 'foam.u2.view',
  name: 'ImageView',
  extends: 'foam.u2.Element',
  properties: [
    'data',
    ['nodeName', 'img']
  ],
  methods: [
    function initE() {
      this.attrs({ src: this.data$ });
    }
  ]
});
