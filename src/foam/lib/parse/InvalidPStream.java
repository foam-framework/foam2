/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.parse;

public class InvalidPStream
    implements PStream
{
  private static InvalidPStream instance_ = null;
  public static InvalidPStream instance() {
    if ( instance_ == null ) {
      instance_ = new InvalidPStream();
    }
    return instance_;
  }

  private InvalidPStream() {}

  @Override
  public char head() {
    return 0;
  }

  @Override
  public char beforeHead() {
    return 0;
  }

  @Override
  public boolean valid() {
    return false;
  }

  @Override
  public PStream tail() {
    return null;
  }

  @Override
  public Object value() {
    return null;
  }

  @Override
  public PStream setValue(Object value) {
    return null;
  }

  @Override
  public String substring(PStream end) {
    return null;
  }

  @Override
  public PStream apply(Parser ps, ParserContext x) {
    return null;
  }

  @Override
  public int decrement() {
    return 0;
  }
}