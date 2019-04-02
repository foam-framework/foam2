foam.CLASS({
  package: 'foam.nanos.logger',
  name: 'LogMessageController',
  extends: 'foam.comics.DAOController',

  documentation: `
    A custom DAOController to work with log messages.

    Customizations:
      * Sort the DAO by creation date
  `,

  requires: ['foam.nanos.logger.LogMessage'],

  imports: ['logMessageDAO'],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data',
      factory: function() {
        return this.logMessageDAO.orderBy(this.LogMessage.CREATED);
      }
    }
  ]
});
