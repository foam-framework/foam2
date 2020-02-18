foam.CLASS({
  package: 'foam.u2.crunch',
  name: 'CapabilityStoreSection',
  
  properties: [
    {
      name: 'label',
      class: 'String'
    },
    {
      name: 'previewDAO',
      class: 'foam.dao.DAOProperty',
      documentation: `
        DAO Property to display a preview of capabilities on the main
        page. It should be reasonably quick to select all entries from
        this DAO.
      `
    },
    {
      name: 'fullDAO',
      class: 'foam.dao.DAOProperty',
      documentation: `
        DAO Property to find all capabilities in this section.
      `
    }
  ]
});