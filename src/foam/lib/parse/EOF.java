/**

 @license
 Copyright 2021 The FOAM Authors. All Rights Reserved.
 http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.parse;

public class EOF
  implements Parser
{
  protected static final Parser instance__ = new EOF();

  public static Parser instance() {
    return instance__;
  }

  private EOF() {
  }

  public PStream parse(PStream ps, ParserContext x) {
    return ps.valid() ? null : ps;
  }
}
