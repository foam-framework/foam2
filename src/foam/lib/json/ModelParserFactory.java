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

public class ModelParserFactory {
  protected static HashMap<Class, Parser> parsers_ = new HashMap<Class, Parser>();

  public static Parser getInstance(Class c) {
    if ( parsers_.containsKey(c) ) return parsers_.get(c);

    ClassInfo info = null;

    try {
      info = (ClassInfo) c.getMethod("getOwnClassInfo").invoke(null);
    } catch(NoSuchMethodException|IllegalAccessException|InvocationTargetException e) {
      throw new RuntimeException("Failed to build parser for " + info.getId(), e);
    }

    Parser parser = buildInstance_(info);
    parsers_.put(c, parser);
    return parser;
  }

  public static Parser buildInstance_(ClassInfo info) {
    List     properties      = info.getAxiomsByClass(PropertyInfo.class);
    Parser[] propertyParsers = new Parser[properties.size() + 1];
    Iterator iter            = properties.iterator();
    int      i               = 0;

    while ( iter.hasNext() ) {
      propertyParsers[i] = new PropertyParser((PropertyInfo) iter.next());
      i++;
    }

    // Prevents failure to parse if unknown property found
    propertyParsers[i] = new UnknownPropertyParser();

    return new Repeat0(
        new Seq0(new Whitespace(), new Alt(propertyParsers)),
        new Literal(","));
  }
}
