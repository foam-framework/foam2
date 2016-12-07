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

import java.util.ArrayList;

public class Repeat implements Parser{
  private Parser p;
  private Parser delim;
  private int min;
  private int max;

  public Repeat(Parser parser) {
    this(parser, null);
  }

  public Repeat(Parser parser, Parser delimiter) {
    this(parser, delimiter, -1, -1);
  }

  public Repeat(Parser parser, Parser delimiter, int minimum) {
    this(parser, delimiter, minimum, -1);
  }

  public Repeat(Parser parser, Parser delimiter, int minimum, int maximum) {
    p = parser;
    delim = delimiter;
    min = minimum;
    max = maximum;
  }

  public PStream parse(PStream ps, ParserContext x) {
    ArrayList values = new ArrayList();
    PStream result;

    for ( int i = 0 ; max == -1 || i < max ; i++ ) {
      if ( delim != null && values.size() != 0 ) {
        result = delim.parse(ps, x);
        if ( result == null ) break;
        ps = result;
      }

      result = p.parse(ps, x);
      if ( result == null ) break;

      values.add(result.value());
      ps = result;
    }

    if ( min != -1 && values.size() < min ) return null;

    return ps.setValue(values.toArray());
  }
}
