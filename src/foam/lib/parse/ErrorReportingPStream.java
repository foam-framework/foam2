/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.parse;

public class ErrorReportingPStream
    extends ProxyPStream
{
  protected int pos;
  protected char head;
  protected ErrorReportingNodePStream tail_ = null;

  public ErrorReportingPStream(PStream delegate) {
    this(delegate, 0);
  }

  public ErrorReportingPStream(PStream delegate, int pos) {
    setDelegate(delegate);
    this.pos = pos;
  }

  @Override
  public PStream tail() {
    if ( tail_ == null ) tail_ = new ErrorReportingNodePStream(this, super.tail(), pos + 1);
    return tail_;
  }

  @Override
  public PStream setValue(Object value) {
    return new ErrorReportingNodePStream(this, super.setValue(value), pos);
  }

  @Override
  public PStream apply(Parser ps, ParserContext x) {
    PStream result = ps.parse(this, x);
    return ( result == null ) ? null : new ErrorReportingPStream(result);
  }

  public void report(ErrorReportingNodePStream ernps, Parser parser) {
    pos = Math.max(pos, ernps.pos);
    head = ernps.head();
  }

  public String getMessage() {
    return "Invalid character '" + head + "' found at " + pos;
  }
}