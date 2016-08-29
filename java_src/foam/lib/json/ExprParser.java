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
                                                       new KeyParser("source"),
                                                       new Whitespace(),
                                                       new Literal(":"),
                                                       new Whitespace(),
                                                       new Parser() {
                        private Parser delegate = new StringParser();
                        public PStream parse(PStream ps, ParserContext x) {
                          ps = delegate.parse(ps, x);
                          if ( ps != null ) {
                            x.set("classId", ps.value());
                          }
                          return ps;
                        }
                      },
                                                       new Whitespace(),
                                                       new Literal(","),
                                                       new Whitespace(),
                                                       new KeyParser("name"),
                                                       new Literal(":"),
                                                       new Whitespace(),
                                                       new Parser() {
                                                         private Parser delegate = new StringParser();
                                                         public PStream parse(PStream ps, ParserContext x) {
                                                           ps = delegate.parse(ps, x);
                                                           if ( ps != null ) {
                                                             x.set("propName", ps.value());
                                                           }
                                                           return ps;
                                                         }
                                                       },
                                                       new Whitespace(),
                                                       new Literal("}"));
                    public PStream parse(PStream ps, ParserContext x) {
                      ps = delegate.parse(ps, x);
                      if ( ps != null ) {
                        Class cls;
                        try {
                          cls = Class.forName((String)x.get("classId"));
                        } catch(ClassNotFoundException e) {
                          throw new RuntimeException(e);
                        }

                        String prop = (String)x.get("propName");
                        // TODO(adamvy): Use the context to resolve the class rather than reflection
                        // TODO(adamvy): Better handle errors.

                        ClassInfo info;
                        try {
                          info = (ClassInfo)cls.getMethod("getOwnClassInfo").invoke(null);
                        } catch(Exception e) {
                          throw new RuntimeException(e);
                        }

                        return ps.setValue(info.getAxiomByName(prop));
                      }
                      return null;
                    }
                  },
                  new FObjectParser()));
  }
}
