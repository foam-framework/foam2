foam.CLASS({
  package: 'foam.nanos.alarming',
  name: 'AlarmConfigOMNameSink',
  extends: 'foam.dao.ProxySink',

  javaImports: [
    'foam.util.SafetyUtil'
  ],

  methods: [
    {
      name: 'put',
      javaCode: `
        getDelegate().put(obj, sub);

        AlarmConfig config = (AlarmConfig) obj;
        if ( config == null ) return;

        if ( ! SafetyUtil.isEmpty(config.getPreRequest()) ) {
          dao_.put(new OMName(config.getPreRequest()));
        }
        if ( ! SafetyUtil.isEmpty(config.getPostRequest()) ) {
          dao_.put(new OMName(config.getPostRequest()));
        }
        if ( ! SafetyUtil.isEmpty(config.getTimeOutRequest()) ) {
          dao_.put(new OMName(config.getTimeOutRequest()));
        }
      `
    }
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          protected foam.dao.DAO dao_;

          public AlarmConfigOMNameSink(foam.core.X x, foam.dao.Sink delegate, foam.dao.DAO dao) {
            super(x, delegate);
            dao_ = dao;
          }
        `);
      }
    }
  ]
});
