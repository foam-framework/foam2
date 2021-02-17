/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'foam.nanos.logger',
  name: 'LogMessageCreatedSink',
  extends: 'foam.dao.ProxySink',
  implements: [ 'foam.core.ContextAware' ],
  
  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  public LogMessageCreatedSink(foam.core.X x, foam.dao.Sink delegate, foam.dao.DAO dao) {
    super(x, delegate);
    setDao(dao);
  }
          `
        }));
      }
    }
  ],

  properties: [
    {
      name: 'dao',
      class: 'foam.dao.DAOProperty'
    },
    {
      documentation: `2021-02-16T15:15:37.005-0500`,
      name: 'formatter',
      class: 'Object',
      javaFactory: `
      return new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZ");
      `
    }
  ],
  
  methods: [
    {
      documentation: 'Calculated date from timestamp. Also save back to delegate',
      name: 'put',
      javaCode: `
      LogMessage msg = (LogMessage) obj;
      if ( msg.getCreated() == null ) {
        try {
          var formatter = (java.text.SimpleDateFormat) getFormatter();
          msg = (LogMessage) msg.fclone();
          msg.setCreated(formatter.parse(msg.getTimestamp()));
          msg = (LogMessage) getDao().put_(getX(), msg);
        } catch (java.text.ParseException e) {
          System.err.println(this.getClass().getSimpleName()+",Failed to parse,"+msg);
        }
      }
      if ( msg != null ) {
        getDelegate().put(msg, sub);
      }
      `
    }
  ]
});
