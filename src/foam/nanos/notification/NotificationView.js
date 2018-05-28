foam.CLASS({
  package: 'foam.nanos.notification',
  name: 'NotificationView',
  extends: 'foam.u2.View',
  axioms: [ foam.pattern.Faceted.create() ],

  css: `
   .body {
    word-wrap: break-word;
    padding-bottom: 0;
    padding-top: 20;
    line-height: 1.4;
    padding-left: 20px;
    width: 414px;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    display: -webkit-box;
    text-overflow: ellipsis;
    margin-right: 10;
    overflow: hidden;
    color: #093649;
  }`,

  properties: [ 'of' ],
  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .start('div').on('click', this.onClick).addClass('body').add(this.data.body).end();
    }
  ],
  listeners: [
    function onClick () {
      if ( this.getElementById(this.childNodes[0].id).style.display == "block" ) {
        this.getElementById(this.childNodes[0].id).style.display = "-webkit-box";
      }
      else
        this.getElementById(this.childNodes[0].id).style.display = "block";
    }
  ]
})