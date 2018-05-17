package foam.lib.query;

import foam.lib.parse.PStream;
import foam.lib.parse.ParserContext;
import foam.lib.parse.ParserContextImpl;
import foam.lib.parse.StringPStream;
import foam.parse.QueryParser;

public class Test {
  public static void main(String[] args) {
    QueryParser parser = new QueryParser(TestModel.getOwnClassInfo());

    //String query = "name:adam birthdate=2017/01/01..2017/12/25 OR name:adam birthdate<2017/01/12 OR name:adam birthdate>2017/03/21";
    String query = "n=adam";

    StringPStream sps = new StringPStream();
    sps.setString(query);

    PStream ps = sps;

    ParserContext x = new ParserContextImpl();
    x.set("X", foam.core.EmptyX.instance());

    ps = parser.parse(ps, x);

    if ( ps == null ) {
      System.out.println("Failed to parse.");
      return;
    }

    foam.mlang.predicate.Nary result = (foam.mlang.predicate.Nary)ps.value();

    System.out.println("Result: " + result.createStatement());
  }
}
