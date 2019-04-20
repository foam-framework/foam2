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
    if ( ( ps = super.parse(ps, x)) == null ) {
      return null;
    }

    String classId = (String) ps.value();
    // NOTE: ClassReferenceParser expects fully qualified name of a modelled class for class lookup
    // and returns ClassInfo of the modelled class if found, otherwise return null.
    //
    // Eg.,
    // When parsing { "class": "__Class__", "forClass_": "foam.nanos.auth.User" }
    // it would return User.getOwnClassInfo() instead of the actual User class.
    //
    // And when parsing { "class": "__Class__", "forClass_": "java.lang.Object" }
    // it would return null because java.lang.Object is not a modelled class.
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
