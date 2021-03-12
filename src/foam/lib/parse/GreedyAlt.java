/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package foam.lib.parse;


public class GreedyAlt
  implements Parser
{
  protected Parser[] parsers_;

  public GreedyAlt(Parser... args) {
    parsers_ = args;
  }

  public PStream parse(PStream ps, ParserContext x) {
    int retPos = 0;
    PStream finalRet =null;
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
