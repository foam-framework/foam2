package foam.lib.query;

import foam.lib.parse.*;

public class Test {
  public static void main(String[] args) {
    QueryParser parser = new QueryParser(TestModel.getOwnClassInfo());

    String query = "name:adam age>20 OR age<5 name:john";

    StringPStream sps = new StringPStream();
    sps.setString(query);

    PStream ps = sps;

    ParserContext x = new ParserContextImpl();

    ps = parser.parse(ps, x);

    if ( ps == null ) {
      System.out.println("Failed to parse.");
      return;
    }

    foam.mlang.predicate.Nary result = (foam.mlang.predicate.Nary)ps.value();

    System.out.println("Result: " + result.createStatement());
  }
}
