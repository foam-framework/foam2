/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.query;

import foam.core.ClassInfo;
import foam.lib.parse.Literal;
import foam.lib.parse.PStream;
import foam.lib.parse.ParserContext;
import foam.lib.parse.Seq;
import foam.mlang.predicate.IsInstanceOf;

public class IsInstanceOfParser extends foam.lib.parse.ProxyParser {

  public IsInstanceOfParser() {
      setDelegate(new Seq(new Literal("instance"),
                          new Literal(":"),
                          new StringParser()));
  }

  @Override
  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse ( ps, x );
    if ( ps == null ) return ps;

    if ( ps.value() instanceof Object[] &&
         ((Object[]) ps.value()).length > 2 &&
         String.valueOf(((Object[]) ps.value())[0]).equals("instance") ) {

      // REVIEW(joel): Class, ClassInfo Copied from PropertyReferenceParser
      Class cls;
      try {
        cls = Class.forName(String.valueOf(((Object[])ps.value())[2]).trim());
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

      return ps.setValue(new IsInstanceOf(info));
    }

    return null;
  }
}
