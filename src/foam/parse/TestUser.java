/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.parse;

import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;

import foam.core.EmptyX;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.lib.parse.PStream;
import foam.lib.parse.ParserContext;
import foam.lib.parse.ParserContextImpl;
import foam.lib.parse.StringPStream;
import foam.nanos.auth.User;

public class TestUser {
  public static void main(String[] args) {
    // QueryParser parser = new QueryParser(TestModel.getOwnClassInfo());
    QueryParser parser = new QueryParser(User.getOwnClassInfo());//TODO create my own example

    // create a data source
    DAO dao = new foam.dao.MapDAO(User.getOwnClassInfo());

    // add some data test
    User u1 = new User();
    u1.setId(6);
    u1.setFirstName("Simon");
    u1.setLastName("Keogh");
    u1.setOrganization("nanopay");
    u1.setBusinessName("programmer");
    u1.setLanguage("en");
    Date date = new GregorianCalendar(2010, 8, 10).getTime();//September
    u1.setBirthday(date);
    int yyyy,mm,d;
    Calendar clend = new java.util.GregorianCalendar().getInstance();
    yyyy = clend.get(Calendar.YEAR);
    mm   = clend.get(Calendar.MONTH) ;
    d    = clend.get(Calendar.DAY_OF_MONTH);
    date = new GregorianCalendar(yyyy, mm, d).getTime();
    u1.setLastLogin(date);
    dao.put(u1);

    User u2 = new User();
    u2.setId(7);
    u2.setFirstName("Wassim");
    dao.put(u2);

    User u3 = new User();
    u3.setId(8);
    u3.setFirstName("Hassene");
    u3.setEmailVerified(true);
    dao.put(u3);

    String[][] q ={
        {"id=6"," ( ( id =  ?  ) ) "},
        {"-id=6"," ( ( NOT ( id =  ?  ) ) ) "},
        {"Not id=6"," ( ( NOT ( id =  ?  ) ) ) "},
        {"id=20"," ( ( id =  ?  ) ) "},
        {"id>20"," ( ( id >  ?  ) ) "},
        {"id<20"," ( ( id <  ?  ) ) "},
        {"id>=20"," ( ( id >=  ?  ) ) "},
        {"id<=20"," ( ( id <=  ?  ) ) "},
        {"id-after:20"," ( ( id >=  ?  ) ) "},
        {"id-before:20"," ( ( id <=  ?  ) ) "},
        {"firstName=Simon"," ( ( firstname =  ?  ) ) "},
        {"firstName:Sim"," ( ( 'firstname' like '% ? %' ) ) "},

        {"birthday=2020/09/10"," ( ( ( birthday >=  ?  )  AND  ( birthday <=  ?  ) ) ) "},
        {"birthday=2020-09-10"," ( ( ( birthday >=  ?  )  AND  ( birthday <=  ?  ) ) ) "},
        {"birthday<2020-09-10"," ( ( birthday <  ?  ) ) "},
        {"birthday<=2020-09-10"," ( ( birthday <=  ?  ) ) "},
        {"birthday>2020-09-10"," ( ( birthday >  ?  ) ) "},
        {"birthday=2011"," ( ( ( birthday >=  ?  )  AND  ( birthday <=  ?  ) ) ) "},//
        {"birthday=2020"," ( ( ( birthday >=  ?  )  AND  ( birthday <=  ?  ) ) ) "},
        {"lastLogin=today"," ( ( ( lastlogin >=  ?  )  AND  ( lastlogin <=  ?  ) ) ) "},
        {"lastLogin=today-2"," ( ( ( lastlogin >=  ?  )  AND  ( lastlogin <=  ?  ) ) ) "},
        {"lastLogin=2010-9-10..2020-9-10"," ( ( ( lastlogin >=  ?  )  AND  ( lastlogin <=  ?  ) ) ) "},

        {"id=6 or firstName=Simon"," ( ( id =  ?  ) )  OR  ( ( firstname =  ?  ) ) "},
        {"-id=6 | firstName=Simon"," ( ( NOT ( id =  ?  ) ) )  OR  ( ( firstname =  ?  ) ) "},
        {"firstName=abc or id=20 "," ( ( firstname =  ?  ) )  OR  ( ( id =  ?  ) ) "},
        {"firstName=abc and id=20"," ( ( firstname =  ?  )  AND  ( id =  ?  ) ) "},
        {"id=20 and firstName=adam11 OR id<5 and firstName=john"," ( ( id =  ?  )  AND  ( firstname =  ?  ) )  OR  ( ( id <  ?  )  AND  ( firstname =  ?  ) ) "},
        {"id=20 firstName=adam11 OR id<5 firstName=john"," ( ( id =  ?  )  AND  ( firstname =  ?  ) )  OR  ( ( id <  ?  )  AND  ( firstname =  ?  ) ) "},
        {"firstName=abc or id=20 "," ( ( firstname =  ?  ) )  OR  ( ( id =  ?  ) ) "},

        {"((id<30) or (id>20))"," ( ( id <  ?  ) )  OR  ( ( id >  ?  ) ) "},
        {"(id<30 or id>20)"," ( ( id <  ?  ) )  OR  ( ( id >  ?  ) ) "},
//        {"(((id<30) or (id>20)) and ((firstName=john) or (id>20)))"," ( ( ( ( ( ( ( ( id <  ?  ) ) ) )  OR  ( ( ( ( id >  ?  ) ) ) ) )  AND  ( ( ( firstname =  ?  ) ) ) ) ) ) "},//Not supported
        {"(id=20)"," ( ( id =  ?  ) ) "},
        {"(firstName=adam)"," ( ( firstname =  ?  ) ) "},//TODO
        {"((firstName=abc and id=20) or (firstName=abc and id=20))"," ( ( firstname =  ?  )  AND  ( id =  ?  ) )  OR  ( ( firstname =  ?  )  AND  ( id =  ?  ) ) "},
        {"(firstName=adam)"," ( ( firstname =  ?  ) ) "},
        {"(id=20)"," ( ( id =  ?  ) ) "},
        {"firstName=adam11 and id=20 or firstName=john id=5"," ( ( firstname =  ?  )  AND  ( id =  ?  ) )  OR  ( ( firstname =  ?  )  AND  ( id =  ?  ) ) "},

        {"has:businessName"," ( ( (businessname <> '') is not true ) ) "},
        {"is:emailVerified"," ( ( emailverified =  ?  ) ) "},
//        {"id=me"," ( ( id =  ?  ) ) "},

        {"firstName=Simon,Wassim"," ( ( ( firstname =  ?  )  OR  ( firstname =  ?  ) ) ) "},
//        {"id=(6|7)"," ( ( ( id =  ?  )  OR  ( id =  ?  ) ) ) "},
//        {"id=(6|7)"," ( ( ( id =  ?  )  OR  ( id =  ?  ) ) ) "},//TODO add alises

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
