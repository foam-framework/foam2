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

public class Repeat0 implements Parser {
  private Parser p;
  private Parser delim;
  private int min;
  private int max;

  public Repeat0(Parser parser) {
    this(parser, null);
  }

  public Repeat0(Parser parser, Parser delimiter) {
    this(parser, delimiter, -1, -1);
  }

  public Repeat0(Parser parser, Parser delimiter, int minimum) {
    this(parser, delimiter, minimum, -1);
  }

  public Repeat0(Parser parser, Parser delimiter, int minimum, int maximum) {
    p = parser;
    delim = delimiter;
    min = minimum;
    max = maximum;
  }

  public PStream parse(PStream ps, ParserContext x) {
    boolean first = true;
    PStream result;
    int i;

    for ( i = 0 ; max == -1 || i < max ; i++ ) {
      if ( delim != null && ! first ) {
        result = delim.parse(ps, x);
        if ( result == null ) break;
        ps = result;
      }

      result = p.parse(ps, x);
      if ( result == null ) break;
      ps = result;
      first = false;
    }

    if ( min != -1 && i < min ) return null;

    return ps;
  }
}
