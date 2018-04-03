/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.parse;

import java.lang.reflect.InvocationTargetException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

import foam.core.ClassInfo;
import foam.core.PropertyInfo;
import foam.lib.json.Whitespace;
import foam.lib.parse.Alt;
import foam.lib.parse.Optional;
import foam.lib.parse.Parser;
import foam.lib.parse.Repeat0;
import foam.lib.parse.Seq;
import foam.lib.parse.Seq1;

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

    Parser[] propertyParsers = new Parser[properties.size() + 1];

    Iterator iter = properties.iterator();
    int i = 0;
    while(iter.hasNext()) {
      propertyParsers[i] = new PropertyParser((PropertyInfo)iter.next());
      i++;
    }

    Parser logicalOperator = new OperatorParser();
    Parser notExpression = new NotExpression();

    propertyParsers[i] = new UnknownPropertyParser();

    // TODO: Don't fail to parse if we find an unknown property.
    return new Repeat0(
               new Seq1(3,
                  new Optional(
                     new Seq(
                       new Whitespace(),
                       new Alt(notExpression))),
                     new Alt(
                       propertyParsers),
                     new Alt(
                       logicalOperator
                       )
                   ));
  }
}
