foam.CLASS({
  package: 'foam.dao',
  name: 'CountryDAOTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.Country',
  ],

  methods: [
    {
      name: 'runTest',
      javaReturns: 'void',
      javaCode: `
        X x = getX();

        DAO countryDAO = (DAO) x.get("countryDAO");

        print("Testing that countryDAO is read-only:");
        boolean threw = false;
        String message = "";
        try {
          Country nanopaylandia = new Country();
          nanopaylandia.setName("nanopaylandia");
          nanopaylandia.setCode("NANO");
          countryDAO.put(nanopaylandia);
        } catch (UnsupportedOperationException exception) {
          threw = true;
          message = exception.getMessage();
        }
        test(threw && message.equals("Cannot put into ReadOnlyDAO"), "'countryDAO.put()' throws 'UnsupportedOperationException' with appropriate message.");

        threw = false;
        message = "";
        try {
          // Try to remove Brazil.
          Country brazil = new Country();
          brazil.setName("Brazil");
          brazil.setCode("BR");
          countryDAO.remove(brazil);
        } catch (UnsupportedOperationException exception) {
          threw = true;
          message = exception.getMessage();
        }
        test(threw && message.equals("Cannot remove from ReadOnlyDAO"), "'countryDAO.remove()' throws 'UnsupportedOperationException' with appropriate message.");

        threw = false;
        message = "";
        try {
          countryDAO.removeAll();
        } catch (UnsupportedOperationException exception) {
          threw = true;
          message = exception.getMessage();
        }
        test(threw && message.equals("Cannot removeAll from ReadOnlyDAO"), "'countryDAO.removeAll()' throws 'UnsupportedOperationException' with appropriate message.");
      `
    }
  ]
});
