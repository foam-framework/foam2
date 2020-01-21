/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'DefaultRetryStrategy',

  implements: [
    'foam.dao.RetryStrategy'
  ],

  javaImports: [
    'foam.core.X',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger'
  ],

  methods: [
    {
      name: 'retry',
      javaCode: `
      Logger logger = new PrefixLogger(new Object[] {
        this.getClass().getSimpleName(),
        "retry",
      }, (Logger) x.get("logger"));

      int retryAttempt = 1;
      int retryDelay = 1;

      X y = x.put("NEW_OBJ", obj);
      while ( getWhilePredicate().f(y) ) {
        try {
          logger.debug("retryAttempt", retryAttempt);
          if ( "put".equals(op) ) {
            return dao.put_(x, obj);
          } else if ( "cmd".equals(op) ) {
            return dao.cmd_(x, obj);
          } else {
            throw new UnsupportedOperationException(op+" not supported.");
          }
        } catch ( UnsupportedOperationException e ) {
          throw e;
        } catch ( Throwable t ) {
          if ( getMaxRetryAttempts() > -1 &&
               retryAttempt >= getMaxRetryAttempts() ) {
            logger.debug("retryAttempt >= maxRetryAttempts", retryAttempt, getaxRetryAttempts());
            throw t;
          }
          retryAttempt += 1;

          // delay
          try {
            logger.debug("retryDelay", retryDelay);
            Thread.sleep(retryDelay);
            retryDelay *= 2;
            if ( retryDelay > getMaxRetryDelay() ) {
              retryDelay = 1;
            }
          } catch(InterruptedException e) {
            Thread.currentThread().interrupt();
            logger.debug("InterruptedException");
            throw t;
          }
        }
      }
      `
    },
  ]
});
