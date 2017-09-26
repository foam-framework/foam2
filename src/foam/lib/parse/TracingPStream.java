/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.parse;

import foam.nanos.logger.Logger;
import foam.nanos.logger.StdoutLogger;

public class TracingPStream
    extends ProxyPStream
{
  protected int pos = 0;
  protected Logger logger;

  public TracingPStream(PStream delegate) {
    setDelegate(delegate);
    this.logger = new StdoutLogger();
  }

  public TracingPStream(PStream delegate, Logger logger) {
    setDelegate(delegate);
    this.logger = logger;
  }

  @Override
  public PStream apply(Parser ps, ParserContext x) {
    PStream result = super.apply(ps, x);
    if ( result == null ) {
      // TODO: print using logger
    }
    return result;
  }
}
