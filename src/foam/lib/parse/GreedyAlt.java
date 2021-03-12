/**

 @license
 Copyright 2021 The FOAM Authors. All Rights Reserved.
 http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.parse;

/**
Applies all parsers and returns PStream produced by the parser that consumes most of the characters
 opposed to Alt parser that returns first matched value.
 */
public class GreedyAlt
  implements Parser
{
  protected Parser[] parsers_;

  public GreedyAlt(Parser... args) {
    parsers_ = args;
  }

  public PStream parse(PStream ps, ParserContext x) {
    int retPos = 0;
    PStream finalRet = null;
    for ( int i = 0 ; i < parsers_.length ; i++ ) {
      PStream ret = ps.apply(parsers_[i], x);
      if ( ret != null && ret.pos() > retPos ) {
        retPos = ret.pos();
        finalRet = ret;
      }
    }

    return finalRet;
  }
}
