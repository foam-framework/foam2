/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.PStream;
import foam.lib.parse.Parser;
import foam.lib.parse.ParserContext;
import foam.lib.parse.Alt;
import foam.lib.parse.Literal;
import foam.lib.parse.AnyChar;
import foam.lib.parse.Seq1;

public class StringParser
  implements Parser {
  private Parser delimiterParser = new Alt(new Literal("\"\"\""),
                                           new Literal("\""),
                                           new Literal("'"));
  private final char ESCAPE = '\\';

  // An escape is either a Unicode code like \u001a, an ASCII escape like \n or
  // just a literal escape next character.

  private Parser escapeParser = new Alt(new UnicodeParser(),
                                        new ASCIIEscapeParser(),
                                        new Seq1(1, new Literal(Character.toString(ESCAPE)), new AnyChar()));

  public PStream parse(PStream ps, ParserContext x) {
    ps = ps.apply(delimiterParser, x);
    if ( ps == null ) return null;

    Parser delimiter = new Literal((String)ps.value());

    // TODO: Use thread-local StringBuilder
    StringBuilder sb = new StringBuilder();

    PStream result;
    boolean escaping = false;

    while ( ps.valid() ) {
      char c;

      if ( escaping ) {
        ps = ps.apply(escapeParser, x);
        if ( ps == null ) return null;

        sb.append((Character)ps.value());
        escaping = false;

        continue;
      }

      result = ps.apply(delimiter, x);
      if ( result != null ) {
        ps = result;
        break;
      }

      c = ps.head();

      if ( c == ESCAPE ) {
        escaping = true;
        continue;
      }

      sb.append(c);
      ps = ps.tail();
    }

    // Internalize small strings so we don't end up with millions of distinct
    // but equivalent small strings, especially the empty string.
    return ps.setValue(sb.length() < 6 ? sb.toString().intern() : sb.toString());
  }
}
