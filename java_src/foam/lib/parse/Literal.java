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

public class Literal implements Parser {
  private String string;
  private Object value;

  public Literal(String s) {
    this(s, s);
  }

  public Literal(String s, Object v) {
    string = s;
    value = v;
  }

  public PStream parse(PStream ps, ParserContext x) {
    for ( int i = 0 ; i < string.length() ; i++ ) {
      if ( ! ps.valid() ||
           ps.head() != string.charAt(i) ) {
        return null;
      }

      ps = ps.tail();
    }

    return ps.setValue(value);
  }
}
