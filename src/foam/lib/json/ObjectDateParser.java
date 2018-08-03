/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;

import java.util.Date;

/**
 * Create a second date parser specifically for Properties of type Object that
 * get set to a Date. We use a "long form" structure like so:
 *
 *   {
 *     class: '__Timestamp__',
 *     value: 1533135788921
 *   }
 *
 * Instead of simply sending the timestamp:
 *
 *   1533135788921
 *
 * or date string:
 *
 *   "2018-08-01T15:04:31.467Z"
 *
 * which would be much more efficient. The reason we can't do that here is
 * because if you're the server trying to parse the value of an Object property,
 * you don't know if a long is a timestamp or just a long, or if a string is a
 * date string or just a string. It's ambiguous. Therefore we have to sacrifice
 * performance to avoid ambiguity.
 *
 * The reason we can use the more efficient formats in other places is that the
 * server knows that those properties are of type Date and therefore it's not
 * ambiguous.
 *
 * Now that we've proven the need for an unambiguous date parser, why wouldn't
 * we just replace the original date parser with this one? Why have two? We do
 * so in the name of performance. The original date parser uses less space,
 * meaning less bandwidth is used and less time is spent serializing and
 * deserializing.
 */
public class ObjectDateParser
  extends ProxyParser
{
  public ObjectDateParser() {
    super(new Seq0(
      new Whitespace(),
      new Literal("{"),
      new Whitespace(),
      new KeyParser("class"),
      new Whitespace(),
      new Literal(":"),
      new Whitespace(),
      new Literal("\"__Timestamp__\""),
      new Whitespace(),
      new Literal(","),
      new Whitespace(),
      new KeyParser("value"),
      new Whitespace(),
      new Literal(":"),
      new Whitespace(),
      new Parser() {
       private Parser delegate = new LongParser();
       public PStream parse(PStream ps, ParserContext x) {
         ps = ps.apply(delegate, x);
         if ( ps != null ) x.set("value", ps.value());
         return ps;
       }
      },
      new Whitespace(),
      new Literal("}")));
  }

  public PStream parse(PStream ps, ParserContext x) {
    try {
      if ((ps = super.parse(ps, x)) == null) return null;
      long timestamp = (long) x.get("value");
      return ps.setValue(new Date(timestamp));
    } catch ( Throwable t ) {
      return null;
    }
  }
}
