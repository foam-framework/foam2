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

public class Seq2 implements Parser {
  private Parser[] parsers;
  private int index1;
  private int index2;

  public Seq2(int i, int j, Parser... args) {
    parsers = args;
    index1 = i;
    index2 = j;
  }

  public PStream parse(PStream ps, ParserContext x) {
    Object[] value = new Object[2];

    for ( int i = 0 ; i < parsers.length ; i++ ) {
      ps = parsers[i].parse(ps, x);
      if ( ps == null ) return null;
      if ( i == index1 ) value[0] = ps.value();
      if ( i == index2 ) value[1] = ps.value();
    }

    return ps.setValue(value);
  }
}
