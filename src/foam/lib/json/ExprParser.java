/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.core.*;
import foam.lib.parse.*;

public class ExprParser extends foam.lib.parse.ProxyParser {
  public ExprParser() {
    super(new Alt(
                  new Parser() {
                    private Parser delegate = new Seq0(new Whitespace(),
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
                          ps = delegate.parse(ps, x);
                          if ( ps != null ) {
                            x.set("forClass_", ps.value());
                          }
                          return ps;
                        }
                      },
                                                       new Whitespace(),
                                                       new Literal("}"));
                    public PStream parse(PStream ps, ParserContext x) {
                      ps = delegate.parse(ps, x);

                      if ( ps != null ) {
                        String forClass = (String)x.get("forClass_");
                        String classId = forClass.substring(0, forClass.lastIndexOf("."));
                        String propName = forClass.substring(forClass.lastIndexOf(".") + 1);

                        Class cls;
                        try {
                          cls = Class.forName(classId);
                        } catch(ClassNotFoundException e) {
                          throw new RuntimeException(e);
                        }

                        // TODO(adamvy): Use the context to resolve the class rather than reflection
                        // TODO(adamvy): Better handle errors.

                        ClassInfo info;
                        try {
                          info = (ClassInfo)cls.getMethod("getOwnClassInfo").invoke(null);
                        } catch(Exception e) {
                          throw new RuntimeException(e);
                        }

                        return ps.setValue(info.getAxiomByName(propName));
                      }
                      return null;
                    }
                  },
                  new FObjectParser()));
  }
}
