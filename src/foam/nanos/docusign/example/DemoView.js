foam.CLASS({
  package: 'foam.nanos.docusign.example',
  name: 'DemoView',
  extends: 'foam.u2.Controller',

  imports: [
    'docuSignSendToMeDAO'
  ],

  requires: [
    'foam.nanos.docusign.DocuSignEnvelope',
    'foam.nanos.docusign.DocuSignDocument',
    'foam.nanos.docusign.example.ExampleDocument',
  ],

  methods: [
    function initE() {
      this
        .add(this.AUTHENTICATE)
        .add(this.SIGN_EXAMPLE_DOCUMENT)
        ;
    }
  ],

  actions: [
    {
      name: 'authenticate',
      code: function () {
        ctrl.__subContext__.sessionDAO.find(
          foam.mlang.Expressions.create().EQ(
            foam.nanos.session.Session.USER_ID,
            ctrl.__subContext__.user.id)
        ).then(o => {
          let url = `https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature&client_id=560a0ec0-d028-4b9e-9100-75c119caa738&redirect_uri=http://localhost:8080/service/dsRedirectHandler&state=${o.id}`;
          window.open(url, '_blank');
        });
      }
    },
    {
      name: 'signExampleDocument',
      code: function () {
        console.log('in here');
        var doc = this.ExampleDocument.create();
        console.log(doc);
        this.docuSignSendToMeDAO.put(doc).then(o => {
          console.log(o.signingURL);
        });
      }
    }
  ]
});