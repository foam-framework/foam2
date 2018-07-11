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

import java.util.List;

public class Seq
  implements Parser
{
  protected Parser[] parsers_;

  public Seq(List<Parser> parsers) {
    parsers_ = new Parser[parsers.size()];
    parsers.toArray(parsers_);
  }

  public Seq(Parser... args) {
    parsers_ = args;
  }

  public PStream parse(PStream ps, ParserContext x) {
    Object[] values = new Object[parsers_.length];

    for ( int i = 0 ; i < parsers_.length ; i++ ) {
      ps = ps.apply(parsers_[i], x);
      if ( ps == null ) return null;
      values[i] = ps.value();
    }

    return ps.setValue(values);
  }
}
