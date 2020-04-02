foam.CLASS({
  package: 'foam.nanos.docusign',
  name: 'DocuSignSendToMeDAO',
  extends: 'foam.dao.AbstractDAO',

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.User'
  ],

  properties: [
    {
      name: 'docuSignSessionId',
      class: 'Long'
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        // Get current DocuSignSession for sender user
        DocuSignSession dsSession = (DocuSignSession)
          ((DAO) x.get("docuSignSessionDAO")).find(getDocuSignSessionId());

        if ( dsSession == null ) {
          throw new RuntimeException("docuSignSessionId not found");
        }

        // Get user from context to set recipient
        User user = (User) x.get("user");

        // Override the list of recipients
        DocuSignDocument document = (DocuSignDocument) obj;
        String documentSource = document.getDocuSignHTML();

        DocuSignEnvelope envelope = new DocuSignEnvelope.Builder(x)
          .setDocuments(new DocuSignDocumentEntry[] {
            new DocuSignDocumentEntry.Builder(x)
              .setHtmlDefinition(
                new DocuSignHTMLDefinition.Builder(x)
                  .setSource(documentSource)
                  .build()
              )
              .build()
          })
          .build();

        envelope.setRecipients(new DocuSignEnvelopeRecipients.Builder(x)
          .setSigners(new DocuSignRecipient[] {
            new DocuSignRecipient.Builder(x)
              .setName(user.getFirstName() + " "
                + user.getLastName())
              .setEmail(user.getEmail())
              .setClientUserId(String.valueOf(user.getId()))
              .build()
          })
          .build());

        // Send request to DocuSign API

        // Return document with signing url set
        document.setSigningURL("test value");
        System.out.println("e");
        return document;
      `
    },
    {
      name: 'remove_',
      javaCode: `throw new UnsupportedOperationException("Cannot remove from DocuSignSendEnvelopeDAO");`,
    },
    {
      name: 'removeAll_',
      javaCode: `throw new UnsupportedOperationException("Cannot removeAll from DocuSignSendEnvelopeDAO");`,
    },
    {
      name: 'select_',
      javaCode: `throw new UnsupportedOperationException("Cannot select on DocuSignSendEnvelopeDAO");`,
    },
    {
      name: 'select_',
      javaCode: `throw new UnsupportedOperationException("Cannot select on DocuSignSendEnvelopeDAO");`,
    },
    {
      name: 'find_',
      javaCode: `return null;`,
    },
  ]
});