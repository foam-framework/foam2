/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.parse;

import java.io.PrintWriter;
import java.io.Writer;

public class TracingPStream
    extends ProxyPStream
{
  protected final static PrintWriter OUT = new PrintWriter(System.out);
  protected int pos;
  protected int depth;
  protected PrintWriter writer;
  protected TracingPStream tail_ = null;

  public TracingPStream(PStream delegate) {
    this(delegate, OUT/*new PrintWriter(System.out)*/, 0, 0);
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
    String format = ( depth * 2 == 0 ) ? "%s" : "%" + (depth*2) + "s";
    String indentation = String.format(format, "");

    char char1 = ( this.valid() ) ? this.head() : ' ';
    writer.println(indentation + "Parsing '" + char1 + "' at position: " + pos + " using " + ps);

    PStream result = ps.parse(this, x);
    if ( result == null ) {
      writer.println(indentation + "Parse error");
    } else {
      writer.println(indentation + "Result = " + result.value());
    }
    return result;
  }
}
