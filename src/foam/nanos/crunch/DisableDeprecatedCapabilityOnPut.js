foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'DisableDeprecatedCapabilityOnPut',

  documentation: 'set enabled to false on deprecated capabilities',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityCapabilityJunction',
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      DAO capabilityDAO = (DAO) x.get("capabilityDAO");
      String deprecatedId = ((CapabilityCapabilityJunction) obj).getSourceId();
      final Capability deprecated = (Capability) ((capabilityDAO.find(deprecatedId)).fclone());
      deprecated.setEnabled(false);

      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          ((DAO) x.get("capabilityDAO")).put(deprecated);
        }
      }); 
      `
    }
  ]
});