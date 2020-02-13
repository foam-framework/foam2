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
  private final static Parser instance__ = new ClassReferenceParser();

  public static Parser instance() { return instance__; }

  private ClassReferenceParser() {
    super(new Alt(
      NullParser.instance(),
      new Seq1(15,
        Whitespace.instance(),
        Literal.create("{"),
        Whitespace.instance(),
        new KeyParser("class"),
        Whitespace.instance(),
        Literal.create(":"),
        Whitespace.instance(),
        Literal.create("\"__Class__\""),
        Whitespace.instance(),
        Literal.create(","),
        Whitespace.instance(),
        new KeyParser("forClass_"),
        Whitespace.instance(),
        Literal.create(":"),
        Whitespace.instance(),
        StringParser.instance(),
        Whitespace.instance(),
        Literal.create("}")),
      StringParser.instance()
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
