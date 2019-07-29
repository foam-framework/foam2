/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.parse;

import foam.core.*;
import foam.lib.parse.*;
import java.util.ArrayList;
import java.util.List;

/**
 * SQL-syntax-like parser for defining Sink's.
 * Examples:
 *   *
 *   firstName, lastName
 *   MIN(age), AVG(age), MAX(age)
 *   SUM(amount), COUNT(*)
 *   ???: GROUP BY
 **/
public class SinkParser
  extends Alt
{
  protected ClassInfo info_;
  protected String selectedProps_;

  public SinkParser(ClassInfo info) {
    info_ = info;

    parsers_ = new Parser[] {
      starParser(),
      expressionListParser()
    };
  }

  public SinkParser(ClassInfo info, String selectedProps) {
    info_ = info;
    selectedProps_ = selectedProps;

    parsers_ = new Parser[] {
      expressionListselectedPropsParser()
    };
  }

  public Parser starParser() {
    return new Literal("*");
  }

  public Parser expressionListParser() {
    return new Repeat(expressionParser(), ",", 1);
  }

  public Parser expressionParser() {
    List         properties = info_.getAxiomsByClass(PropertyInfo.class);
    List<Parser> parsers    = new ArrayList<Parser>();

    for ( Object prop : properties ) {
      PropertyInfo info = (PropertyInfo) prop;

      parsers.add(new LiteralIC(info.getName()));
    }

    return new Alt(parsers);
  }

  public Parser expressionListselectedPropsParser() {
    return new Repeat(selectedPropsParser(), ",", 1);
  }

  public Parser selectedPropsParser() {
    List         properties = info_.getAxiomsByClass(PropertyInfo.class);
    List<Parser> parsers    = new ArrayList<Parser>();

    String[] digColumns = selectedProps_.split(",");
    for ( int i = 0; i < digColumns.length; i++ ) {
      for ( int j = 0; j < properties.size(); j++ ) {
        PropertyInfo info = (PropertyInfo) properties.get(j);
        if ( digColumns[i].equals(info.getName()) )
          parsers.add(new LiteralIC(info.getName()));
      }
    }

    return new Alt(parsers);
  }

  @Override
  public PStream parse(PStream ps, ParserContext x) {
    x = x.sub();
    x.set("classInfo", info_);

//    get
//    ps = super.parse(ps, x);

    if ( ps == null ) return null;

    while ( ps.valid() ) {

    }

    return ps.setValue(ps.value());
  }
}
