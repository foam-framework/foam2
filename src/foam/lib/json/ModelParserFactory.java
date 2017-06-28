package foam.lib.json;

import java.util.HashMap;
import java.util.List;
import java.util.LinkedList;
import java.util.Iterator;

import java.lang.reflect.InvocationTargetException;

import foam.core.ClassInfo;
import foam.core.PropertyInfo;
import foam.lib.parse.*;

public class ModelParserFactory {
  private static HashMap<Class, Parser> parsers_ = new HashMap<Class, Parser>();

  public static Parser getInstance(Class c) {
    if ( parsers_.containsKey(c) ) {
      return parsers_.get(c);
    }

    ClassInfo info = null;

    try {
      info = (ClassInfo)c.getMethod("getOwnClassInfo").invoke(null);
    } catch(NoSuchMethodException|IllegalAccessException|InvocationTargetException e) {
      throw new RuntimeException("Failed to build parser for " + info.getId(), e);
    }

    Parser parser = buildInstance_(info);
    parsers_.put(c, parser);
    return parser;
  }

  public static Parser buildInstance_(ClassInfo info) {
    List properties = info.getAxiomsByClass(PropertyInfo.class);

    Parser[] propertyParsers = new Parser[properties.size()];

    Iterator iter = properties.iterator();
    int i = 0;
    while(iter.hasNext()) {
      propertyParsers[i] = new PropertyParser((PropertyInfo)iter.next());
      i++;
    }

    // TODO: Don't fail to parse if we find an unknown property.

    return new Repeat0(
                       new Seq0(
                                new Whitespace(),
                                new Alt(propertyParsers)),
                       new Literal(","));
  }
}
