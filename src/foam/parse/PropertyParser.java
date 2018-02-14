/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.parse;

import java.util.List;

import foam.core.PropertyInfo;
import foam.lib.json.KeyParser;
import foam.lib.json.Whitespace;
import foam.lib.parse.Alt;
import foam.lib.parse.Literal;
import foam.lib.parse.PStream;
import foam.lib.parse.ParserContext;
import foam.lib.parse.ProxyParser;
import foam.lib.parse.Seq3;
import foam.mlang.MLang;
import foam.mlang.predicate.Predicate;

public class PropertyParser extends ProxyParser {
  private PropertyInfo property;

  public PropertyParser(PropertyInfo p) {
    super(new Seq3(4, 3,
        new Whitespace(),
        new KeyParser(
          p.getName()),
        new Whitespace(),
        new Alt(
          new Literal(":"),
          new Literal("="),
          new Literal("!="),
          new Literal("<="),
          new Literal(">="),
          new Literal("<"),
          new Literal(">"),
          new Literal("=>"),
          new Literal("=<")),
          p.queryParser(),
        new Whitespace()));
    property = p;
  }

  public PStream parse(PStream ps, ParserContext x) {
    Predicate p = null;
    ps = super.parse(ps, x);
    if (ps == null)
      return null;

    if (!(ps.value() instanceof Object[])) {
      property.set(x.get("obj"), ps.value());
      p = createPredicate(ps.operator().toString(), x);
    } else {// Just for date
      p = createDatePredicate(ps.operator().toString(), ps.value());
    }

    if (p != null) {
      // the NOT predicate is apply on property
      if (((List<Predicate>) x.get("objPar")).size() > 0) {
        Predicate lastPredicate = ((List<Predicate>) x.get("objPar"))
            .get(((List<Predicate>) x.get("objPar")).size() - 1);
        if (lastPredicate instanceof foam.mlang.predicate.Not) {
          ((List<Predicate>) x.get("objPar")).remove(((List<Predicate>) x.get("objPar")).size() - 1);
          ((List<Predicate>) x.get("objPar")).add(MLang.NOT(p));
        }
      }
      ((List<Predicate>) x.get("objPar")).add(p);
    }
    return ps;
  }

  protected Predicate createDatePredicate(String operator, Object dates) {
    Predicate p = null;
    Object date1 = ((Object[]) dates)[0];
    Object date2 = ((Object[]) dates)[1];

    switch (operator) {
    case ":":
    case "=":
      p = MLang.AND(MLang.GTE(property, date1),MLang.LTE(property, date2));
      break;
    case "!=":
      p = MLang.NOT(MLang.AND(MLang.GT(property, date1),MLang.LT(property, date2)));
      break;
    case ">":
      p = MLang.LT(property, date1);
      break;
    case ">=":
      p = MLang.LTE(property, date1);
      break;
    case "<":
      p = MLang.GT(property, date1);
      break;
    case "<=":
      p = MLang.GTE(property, date1);
      break;
    default:
      throw new IllegalArgumentException("INVALID");
    }
    return p;
  }

  protected Predicate createPredicate(String operator, ParserContext x) {
    Predicate p = null;

    switch (operator) {
    case "=":
      p = foam.mlang.MLang.EQ(property, property.get(x.get("obj")));
      break;
    case "!=":
      p = MLang.NOT(MLang.EQ(property, property.get(x.get("obj"))));
      break;
    case ">":
      p = MLang.LT(property, property.get(x.get("obj")));
      break;
    case ">=":
      p = MLang.LTE(property, property.get(x.get("obj")));
      break;
    case "<":
      p = MLang.GT(property, property.get(x.get("obj")));
      break;
    case "<=":
      p = MLang.GTE(property, property.get(x.get("obj")));
      break;
    case ":":
      if (property.get(x.get("obj")) instanceof String) {
        p = MLang.CONTAINS(property, property.get(x.get("obj")));
      } else {
        throw new IllegalArgumentException("this type is not supported with contains predicate");
      }
      break;
    default:
      throw new IllegalArgumentException("INVALID");
    }
    return p;
  }
}
