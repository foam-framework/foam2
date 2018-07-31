/**
 * @license Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;
import foam.core.ClassInfo;

public class PropertyReferenceParser
  extends ProxyParser
{
  public PropertyReferenceParser() {
    super(new Seq0(
      new Whitespace(),
      new Literal("{"),
      new Whitespace(),
      new KeyParser("class"),
      new Whitespace(),
      new Literal(":"),
      new Whitespace(),
      new Literal("\"__Property__\""),
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
          if ( ps != null ) {
            x.set("forClass_", ps.value());
          }
          return ps;
        }
      },
      new Literal(","),
      new Whitespace(),
      new KeyParser("name"),
      new Whitespace(),
      new Literal(":"),
      new Parser() {
        private Parser delegate = new StringParser();

        public PStream parse(PStream ps, ParserContext x) {
          ps = ps.apply(delegate, x);
          if ( ps != null ) {
            x.set("name", ps.value());
          }
          return ps;
        }
      },
      new Whitespace(),
      new Literal("}")));
  }

  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);

    if ( ps != null ) {
      String classId = (String) x.get("forClass_");
      String propName = (String) x.get("name");

      Class cls;
      try {
        cls = Class.forName(classId);
      } catch (ClassNotFoundException e) {
        throw new RuntimeException(e);
      }

      // TODO(adamvy): Use the context to resolve the class rather than reflection
      // TODO(adamvy): Better handle errors.

      ClassInfo info;
      try {
        info = (ClassInfo) cls.getMethod("getOwnClassInfo").invoke(null);
      } catch (Exception e) {
        throw new RuntimeException(e);
      }

      Object axiom = info.getAxiomByName(propName);

      if ( axiom == null ) {
        System.err.println("Unknown Property Reference: " + classId + "." + propName);
      }

      return ps.setValue(axiom);
    }

    return ps;
  }
}
