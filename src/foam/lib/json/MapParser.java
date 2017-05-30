package foam.lib.json;

import foam.lib.parse.*;

public class MapParser extends ProxyParser {
  public MapParser() {
    super(
          new Seq1(2,
                   new Whitespace(),
                   new Literal("{"),
                   new Repeat(
                              new Seq2(1, 5,
                                       new Whitespace(),
                                       new AnyKeyParser(),
                                       new Whitespace(),
                                       new Literal(":"),
                                       new Whitespace(),
                                       new AnyParser()),
                              new Seq0(new Whitespace(), new Literal(","))),
                   new Whitespace(),
                   new Literal("}"))
          );
  }

  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);

    if ( ps != null ) {
      Object[] values = (Object[])ps.value();
      java.util.Map map = new java.util.HashMap(values.length);

      for ( int i = 0 ; i < values.length ; i++ ) {
        Object[] item = (Object[])values[i];

        map.put(item[0], item[1]);
      }

      return ps.setValue(map);
    }

    return ps;
  }
}
