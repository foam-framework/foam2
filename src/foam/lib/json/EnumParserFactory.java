/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.core.ClassInfo;
import foam.core.PropertyInfo;
import foam.lib.parse.*;
import java.lang.reflect.InvocationTargetException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;

public class EnumParserFactory {
  private static HashMap<Class, Parser> parsers_ = new HashMap<Class, Parser>();

  public static Parser getInstance(Class c) {
    if ( parsers_.containsKey(c) ) {
      return parsers_.get(c);
    }

    Parser parser = buildInstance_(c);
    parsers_.put(c, parser);
    return parser;
  }

  public static Parser buildInstance_(Class c) {
    return new Repeat0(new Seq0(
                                new Whitespace(),
                                new Alt(
                                        new Parser() {
                                          Parser delegate = new KeyValueParser("ordinal", new IntParser());

                                          public PStream parse(PStream ps, ParserContext x) {
                                            ps = ps.apply(delegate, x);

                                            if ( ps != null ) {
                                              Class c = (Class)x.get("enum");
                                              Object value = null;

                                              try {
                                                java.lang.reflect.Method forOrdinal = c.getDeclaredMethod("forOrdinal", int.class);

                                                value = forOrdinal.invoke(null, 1);
                                              } catch(NoSuchMethodException | IllegalAccessException | java.lang.reflect.InvocationTargetException e) {
                                                throw new RuntimeException(e);
                                              }

                                              x.set("obj", value);

                                              ps = ps.setValue(value);
                                            }

                                            return ps;
                                          }
                                        },
                                        new KeyValueParser0())), // ignore unknown properties.
                       new Literal(","));
  }
}
