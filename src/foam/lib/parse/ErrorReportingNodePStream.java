/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.parse;

public class ErrorReportingNodePStream
    extends ProxyPStream
{
  protected int pos;
  protected ErrorReportingNodePStream tail_ = null;

  public ErrorReportingNodePStream(PStream delegate) {
    this(delegate, 0);
  }

  public ErrorReportingNodePStream(PStream delegate, int pos) {
    setDelegate(delegate);
    this.pos = pos;
  }

  @Override
  public PStream tail() {
    if ( tail_ == null ) tail_ = new ErrorReportingNodePStream(super.tail(), pos + 1);
    return tail_;
  }

  @Override
  public PStream setValue(Object value) {
    return new ErrorReportingNodePStream(super.setValue(value), pos);
  }

  @Override
  public PStream apply(Parser ps, ParserContext x) {
    return super.apply(ps, x);
  }
}