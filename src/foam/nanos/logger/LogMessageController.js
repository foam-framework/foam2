foam.CLASS({
  package: 'foam.nanos.logger',
  name: 'LogMessageController',
  extends: 'foam.comics.DAOController',

  documentation: 'A custom DAOController to work with log messages.',

  requires: ['foam.nanos.logger.LogMessage'],

  imports: ['logMessageDAO'],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data',
      factory: function() {
        return this.logMessageDAO.orderBy(this.LogMessage.CREATED);
      }
    },
    {
      name: 'summaryView',
      factory: function() {
        return this.FixedWidthScrollTableView;
      }
    }
  ],

  classes: [
    {
      name: 'FixedWidthScrollTableView',
      extends: 'foam.u2.view.ScrollTableView',

      css: `
        ^ {
          width: 968px;
        }
      `
    }
  ]
});
