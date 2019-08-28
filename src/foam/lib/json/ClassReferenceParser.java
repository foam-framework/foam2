/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.core.ClassInfo;
import foam.lib.parse.*;

public class ClassReferenceParser
  extends ProxyParser
{
  public ClassReferenceParser() {
    super(new Alt(
      new NullParser(),
      new Seq1(15,
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
        new Literal("}")),
      new StringParser()
    ));
  }

  public PStream parse(PStream ps, ParserContext x) {
    if ( ( ps = super.parse(ps, x)) == null ) {
      return null;
    }

    String classId = (String) ps.value();
    // Expects classId be a fully qualified name of a modelled class
    // with Java code generation for class lookup and returns 
    // ClassInfo of the modelled class if found, otherwise return null.
    //
    // Eg.,
    // When parsing "foam.nanos.auth.User", returns User.getOwnClassInfo().
    //
    // And when parsing "java.lang.Object", returns null
    // because java.lang.Object is not a modelled class.
    try {
      Class cls = Class.forName(classId);
      ClassInfo info = (ClassInfo) cls.getMethod("getOwnClassInfo") .invoke(null);
      return ps.setValue(info);
    } catch ( Throwable t ) {
      System.err.println(classId + " is not a modelled class.");
      return null;
    }
  }
}
