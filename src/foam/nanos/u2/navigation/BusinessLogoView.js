foam.CLASS({
  package: 'foam.nanos.u2.navigation',
  name: 'BusinessLogoView',
  extends: 'foam.u2.View',

  imports: [ 'logo' ],

  documentation: 'View to display business logo and name.',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          width: 175px;
          display: inline-block;
          text-align: center;
          padding-top: 3px;
          padding-left: 25px;
        }
        ^ img {
          height: 30px;
          padding-top: 10px;
        }
        ^ span{
          position: relative;
          font-weight: 300;
          font-size: 16px;
          margin-left: 10px;
        }
        ^business-name{
          width: 70%;
          text-align: left;
          overflow: hidden;
          text-overflow: ellipsis;
          position: relative;
          white-space: nowrap;
          top: -35;
          height: 20px;
          display: inline-block;
          vertical-align: middle;
          margin-top: 32px;
          margin-left: 5px;
        }
        ^placeholder-business{
          width: 40px;
          height: 40px;
          margin: 5px;
          border-radius: 50%;
          background: white;
        }
      */}
    })
  ],

  methods: [
    function initE() {
      var self = this;

      this
        .addClass(this.myClass())
        .start()
          .start({ class: 'foam.u2.tag.Image', data: this.logo }).end()
        .end();
    }
  ]
});
