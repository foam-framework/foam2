/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'RetryDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'DAO which will retry on exceptions and timeouts',

  javaImports: [
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger'
  ],

  properties: [
    {
      name: 'maxAttempts',
      class: 'Int',
      documentation: 'Set to -1 to infinitely retry.',
      value: 3
    },
    {
      class: 'Int',
      name: 'maxDelay',
      value: 20000
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      Object id = obj.getProperty("id");
      Logger logger = new PrefixLogger(new Object[] {
        this.getClass().getSimpleName(),
        getDelegate().getOf().getId(),
        "put_",
        id
      }, (Logger) x.get("logger"));

      int attempt = 1;
      int delay = 1;

      while ( true ) {
      try {
        logger.debug("attempt", attempt);
        return getDelegate().put_(x, obj);
      } catch ( Throwable t ) {
        if ( getMaxAttempts() > -1 &&
             attempt >= getMaxAttempts() ) {
            logger.debug("attempt >= maxAttempts", attempt, getMaxAttempts());
            throw t;
        }
        attempt += 1;

        // delay
        try {
          logger.debug("delay", delay);
          Thread.sleep(delay);
          delay *= 2;
          if ( delay > getMaxDelay() ) {
            delay = 1;
          }
        } catch(InterruptedException e) {
          Thread.currentThread().interrupt();
          logger.debug("InterruptedException");
          throw t;
        }
      }
      }
      `
    }
  ]
});
