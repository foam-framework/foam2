/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.parse;

import java.util.ArrayList;
import java.util.List;

import foam.core.X;
import foam.lib.parse.Alt;
import foam.lib.parse.PStream;
import foam.lib.parse.Parser;
import foam.lib.parse.ParserContext;
import foam.lib.parse.ProxyParser;
import foam.mlang.predicate.Predicate;

public class FObjectParser extends ProxyParser {
  public FObjectParser(final Class defaultClass) {

    super(new Parser() {
          private Parser delegate = new Alt();

          public PStream parse(PStream ps, ParserContext x) {
          PStream ps1 = ps.apply(delegate, x);
          Class   c   = null;

          try {
            c = ps1 != null ? Class.forName(ps1.value().toString())
                      : x.get("defaultClass") != null ? (Class) x.get("defaultClass") : defaultClass;
            if (c == null) {
              throw new RuntimeException(
                 "No class specified and/or no defaultClass available for the query to be able to parse.");
            }
          } catch (ClassNotFoundException e) {
                throw new RuntimeException(e);
          }

          if (ps1 != null) {
            ps = (PStream) ps1;
          }

          ParserContext subx = x.sub();
          Parser subParser;

          if (c.isEnum()) {
            subx.set("enum", c);
            subParser = EnumParserFactory.getInstance(c);
          } else {
            //TODO create Predicate
            Object obj1 = ((X) x.get("X")).create(c);
            subx.set("obj", obj1);
            Predicate p;
            List<Predicate> predicateArray = new ArrayList<Predicate>();
            Class<? extends List> lClsPredicate = predicateArray.getClass();
            Object obj = ((X) x.get("X")).create(lClsPredicate);
            x.set("objPar", obj);
            subParser = ModelParserFactory.getInstance(c);
          }
          ps = ps.apply(subParser, subx);

          if (ps != null) {
              return ps.setValue(subx.get("obj"));
          }
              return null;
          }
    });
  }

  public FObjectParser() {
    this(null);
  }
}
