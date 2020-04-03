foam.CLASS({
  package: 'foam.nanos.docusign',
  name: 'DocuSignUserAccount',

  properties: [
    {
      name: 'id',
      aliases: ['account_id'],
      class: 'String'
    },
    {
      name: 'name',
      aliases: ['account_name'],
      class: 'String'
    },
    {
      name: 'baseURI',
      aliases: ['base_uri'],
      class: 'String'
    },
    {
      name: 'isDefault',
      aliases: ['is_default'],
      class: 'Boolean'
    }
  ],

  methods: [
    {
      name: 'getUrlAPI21',
      type: 'String',
      javaCode: `
        return getBaseURI() + "/restapi/2.1/accounts/"
          + getId();
      `
    }
  ]
});