/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.parse;

import foam.nanos.logger.Logger;
import foam.nanos.logger.StdoutLogger;

import java.util.stream.Collectors;
import java.util.stream.IntStream;

public class TracingPStream
    extends ProxyPStream
{
  protected int pos;
  protected int depth;
  protected Logger logger;
  protected TracingPStream tail_ = null;

  public static Logger createLogger() {
    StdoutLogger logger = new StdoutLogger();
    logger.start();
    return logger;
  }

  public TracingPStream() {
    this(null);
  }

  public TracingPStream(PStream delegate) {
    this(delegate, createLogger(), 0, 0);
  }

  public TracingPStream(PStream delegate, Logger logger, int pos, int depth) {
    setDelegate(delegate);
    this.logger = logger;
    this.pos = pos;
    this.depth = depth;
  }

  @Override
  public PStream tail() {
    if ( tail_ == null ) tail_ = new TracingPStream(super.tail(), logger, pos + 1, depth);
    return tail_;
  }

  @Override
  public PStream setValue(Object value) {
    return new TracingPStream(super.setValue(value), logger, pos, depth + 1);
  }

  @Override
  public PStream apply(Parser ps, ParserContext x) {
    char char1 = ( this.valid() ) ? this.head() : ' ';
    logger.debug(getIndentation() + "Parsing '" + char1 + "' at position: " + pos + " using " + ps.getClass().getSimpleName());

    PStream result = ps.parse(this, x);
    if ( result == null ) {
      logger.error("Parse error");
    } else {
      logger.info("result = " + result.value());
    }
    return result;
  }

  public String getIndentation() {
    return IntStream.range(1, ( depth * 2 ) + 1).mapToObj(i -> "")
        .collect(Collectors.joining(" "));
  }
}
