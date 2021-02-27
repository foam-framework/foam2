/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.parse;

import foam.core.EmptyX;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.lib.parse.PStream;
import foam.lib.parse.ParserContext;
import foam.lib.parse.ParserContextImpl;
import foam.lib.parse.StringPStream;
import foam.nanos.auth.Region;

public class TestRegion {
  public static void main(String[] args) {
    
    QueryParser parser = new QueryParser(Region.getOwnClassInfo());

    // create a data source
    DAO dao = new foam.dao.MapDAO(Region.getOwnClassInfo());

    // p({"class":"foam.nanos.auth.Region", "code":"ON", "name":"Ontario",
    // "countryId":"CA"})
    // p({"class":"foam.nanos.auth.Region", "code":"QC", "name":"Quebec",
    // "countryId":"CA"})
    // p({"class":"foam.nanos.auth.Region", "code":"AB", "name":"Alberta", "countryId":"CA"})
    // add some data test
    Region rgn1 = new Region();
    rgn1.setId("QN");
    rgn1.setCode("ON");
    rgn1.setName("Ontario");
    rgn1.setCountryId("CA");
    dao.put(rgn1);

    Region rgn2 = new Region();
    rgn2.setId("QC");
    rgn2.setCode("QC");
    rgn2.setName("Quebec");
    rgn2.setCountryId("CA");
    dao.put(rgn2);

    Region rgn3 = new Region();
    rgn3.setId("AB");
    rgn3.setCode("AB");
    rgn3.setName("Alberta");
    rgn3.setCountryId("CAB");
    dao.put(rgn3);

    String[][] q ={       
        {"name=Ontario"," ( ( name =  ?  ) ) "},
        {"code=AB"," ( ( code =  ?  ) ) "},
        {"id=AB"," ( ( id =  ?  ) ) "},
        {"countryId=CA"," ( ( countryid =  ?  ) ) "},
        {"countryId:C"," ( ( 'countryid' like '% ? %' ) ) "},
    };

    for ( int i = 0; i < q.length; i++ ) {
      StringPStream sps = new StringPStream();
      sps.setString(q[i][0]);
      PStream ps = sps;
      ParserContext x = new ParserContextImpl();
      ps = parser.parse(ps, x);
      if ( ps == null ) {
        System.out.println("Failed to parse.");
        return;
      }

      foam.mlang.predicate.Nary result = (foam.mlang.predicate.Nary) ps.value();
      System.out.println("Result: " + result.createStatement());

      parser.setX(EmptyX.instance());
      ArraySink listDao = (ArraySink) dao.where(result).select(new ArraySink());

      // show data
      System.out.println("queryParser " + q[i][0] + " -> number of result " + listDao.getArray().size());
      System.out.println();
      if ( !q[i][1].equalsIgnoreCase(result.createStatement()) ) { throw new ArithmeticException("Not conform "); // Not
                                                                                                                  // conform
      }
    }
  }
}
