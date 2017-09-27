/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.parse;

/**
 * This is a PStream decorator that listens for errors when parsing and reports them
 * to the root ErrorReportingPStream
 */
public class ErrorReportingNodePStream
    extends ProxyPStream
{
  protected int pos;
  protected ErrorReportingPStream root;
  protected ErrorReportingNodePStream tail_ = null;

  public ErrorReportingNodePStream(ErrorReportingPStream root, PStream delegate) {
    this(root, delegate, 0);
  }

  public ErrorReportingNodePStream(ErrorReportingPStream root, PStream delegate, int pos) {
    setDelegate(delegate);
    this.root = root;
    this.pos = pos;
  }

  @Override
  public PStream tail() {
    if ( tail_ == null ) tail_ = new ErrorReportingNodePStream(root, super.tail(), pos + 1);
    return tail_;
  }

  @Override
  public PStream setValue(Object value) {
    return new ErrorReportingNodePStream(root, super.setValue(value), pos);
  }

  @Override
  public PStream apply(Parser ps, ParserContext x) {
    PStream result = ps.parse(this, x);
    if ( result == null ) {
      root.report(this, ps, x);
    }
    return result;
  }
}