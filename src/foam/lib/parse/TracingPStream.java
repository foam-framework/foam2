/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.parse;

import foam.nanos.logger.Logger;
import foam.nanos.logger.StdoutLogger;

import java.io.OutputStream;
import java.io.PrintWriter;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

public class TracingPStream
    extends ProxyPStream
{
  protected int pos;
  protected int depth;
  protected PrintWriter writer;
  protected TracingPStream tail_ = null;

  public TracingPStream() {
    this(null);
  }

  public TracingPStream(PStream delegate) {
    this(delegate, new PrintWriter(System.out), 0, 0);
  }

  public TracingPStream(PStream delegate, PrintWriter writer, int pos, int depth) {
    setDelegate(delegate);
    this.writer = writer;
    this.pos = pos;
    this.depth = depth;
  }

  @Override
  public PStream tail() {
    if ( tail_ == null ) tail_ = new TracingPStream(super.tail(), writer, pos + 1, depth);
    return tail_;
  }

  @Override
  public PStream setValue(Object value) {
    return new TracingPStream(super.setValue(value), writer, pos, depth + 1);
  }

  @Override
  public PStream apply(Parser ps, ParserContext x) {
    String indentation = IntStream.range(1, ( depth * 2 ) + 1).mapToObj(i -> " ")
        .collect(Collectors.joining(""));

    char char1 = ( this.valid() ) ? this.head() : ' ';
    writer.println(indentation + "Parsing '" + char1 + "' at position: " + pos + " using " + ps.getClass().getSimpleName());

    PStream result = ps.parse(this, x);
    if ( result == null ) {
      writer.println(indentation + "Parse error");
    } else {
      writer.println(indentation + "Result = " + result.value());
    }
    return result;
  }
}
