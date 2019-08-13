/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.parse;

public class CSVParser
    extends foam.lib.parse.ProxyParser
    implements foam.core.Detachable {

  boolean detached = false;
  public void detach() {
    detached = true;
  }

  public CSVParser(foam.core.ClassInfo info, foam.dao.Sink sink) {
    Parser escapedQuote = new Literal("\"\"");
    Parser quotedText = new Seq1(1,
      new Literal("\""),
      new Repeat(
        new Alt(new Parser[] {
          escapedQuote,
          new NotChar('"')
        })
      ),
      new Literal("\"")
    );
    Parser unquotedText = new Repeat(new NotChars(",\n\r"));
    Parser field = new Join(
      new Alt(
        quotedText,
        unquotedText
      )
    );
    Parser csvRow = new Repeat(field, new Chars(","));

    foam.core.Detachable detach = this;

    setDelegate(new Parser() {
      public PStream parse(PStream ps, ParserContext px) {
        ps = csvRow.parse(ps, px);
        if ( ps == null ) return null;

        Object[] headers = (Object[]) ps.value();
        ps = ps.tail();

        while ( ! detached && ps.valid() ) {
          ps = csvRow.parse(ps, px);
          if ( ps == null ) break;
          Object[] values = (Object[]) ps.value();
          try {
            foam.core.FObject obj = (foam.core.FObject) info.newInstance();
            for ( int i = 0 ; i < Math.min(values.length, headers.length) ; i++ ) {
              obj.setProperty((String)headers[i], values[i]);
            }
            sink.put(obj, detach);
          } catch ( Exception e ) {
            return null;
          }
          ps = ps.tail();
        }

        return ps;
      }
    });
  }
}
