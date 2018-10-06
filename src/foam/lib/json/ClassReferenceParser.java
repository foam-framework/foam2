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
    super(new Seq1(15,
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
      new StringParser(),
      new Whitespace(),
      new Literal("}")));
  }

  public PStream parse(PStream ps, ParserContext x) {
    try {
      if ( ( ps = super.parse(ps, x)) == null ) {
        return null;
      }

      String classId = (String) ps.value();
      Class cls = Class.forName(classId);
      return cls != null ? ps.setValue(cls) : null;
    } catch ( Throwable t ) {
      return null;
    }
  }
}
