/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;

public class ClassReferenceParser
  extends ProxyParser
{
  public ClassReferenceParser() {
    super(new Seq0(
      new Whitespace(),
      new Literal("{"),
      new Whitespace(),
      new KeyParser("class"),
      new Whitespace(),
      new Literal(":"),
      new Whitespace(),
      new Literal("\"__Class__\""),
      new Whitespace(),
      new Literal(","),
      new Whitespace(),
      new KeyParser("forClass_"),
      new Whitespace(),
      new Literal(":"),
      new Whitespace(),
      new Parser() {
       private Parser delegate = new StringParser();
       public PStream parse(PStream ps, ParserContext x) {
         ps = ps.apply(delegate, x);
         if ( ps != null ) x.set("forClass_", ps.value());
         return ps;
       }
      },
      new Whitespace(),
      new Literal("}")));
  }

  public PStream parse(PStream ps, ParserContext x) {
    try {
      if ( ( ps = super.parse(ps, x)) == null ) {
        return null;
      }

      String classId = (String) x.get("forClass_");
      Class cls = Class.forName(classId);
      return cls != null ? ps.setValue(cls) : null;
    } catch ( Throwable t ) {
      return null;
    }
  }
}
