/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.parse;

import java.io.IOException;
import java.util.Date;
import java.util.GregorianCalendar;

import foam.core.ContextAwareSupport;
import foam.core.EmptyX;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ListSink;
import foam.lib.json.JSONParser;
import foam.mlang.MLang;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.User;

public class QueryParserTest {
  private static X x;

  public static void main(String[] args) throws IOException, ClassNotFoundException {

    x = EmptyX.instance();
    ContextAwareSupport ctx = new ContextAwareSupport();

    // create a data source
    DAO dao = new foam.dao.MapDAO(User.getOwnClassInfo());

    // add some data test
    User u = new User();
    u.setId(6);
    u.setFirstName("Simon");
    u.setLastName("Keogh");
    u.setOrganization("nanopay");
    u.setBusinessName("programmer");
    u.setLanguage("en");
    Date date = new GregorianCalendar(2010, 8, 10).getTime();
    u.setBirthday(date);
    dao.put(u);

    //UseCaseJsonParserTest(dao);

    UseCaseQueryParser(dao);

    /*
     * //equivalent in Javascript.
     * qp = foam.parse.QueryParser.create{(of:
     * 'foam.nanos.auth.User')};
     * qp.parseString("firstName=Simon");
     *
     * foam.json.stringify(qp.parseString("firstName=Simon"))
     *
     * query=qp.parseString("firstName=Simon");
     *
     * ctrl.userDAO.where(query).select(console);
     *
     * query=qp.parseString("firstName=Simon");
     *
     * ctrl.userDAO.where(query).select(console);
     */
  }

  private static void UseCaseQueryParser(DAO dao) {

    QueryParser qp = null;
    try {
      qp = new QueryParser("foam.nanos.auth.User");
    } catch (ClassNotFoundException e) {
      e.printStackTrace();
    }
    //Json date = "LogDate":"2009-02-15T00:00:00Z"
   int result[] = {1,0,1,1,1,0,0,0,1,1
                  ,0,0,0,0,0,1,1,0,0,1
                  ,1,1,1,1,0,1,1,1,1};
    String[] testData ={//"id=6 *",
        "id=6",
        "id!=6",
        "id!=6 or firstName=Simon",
        "firstName=Simon",
        "firstName:Sim",
        "firstName:Azerty",
        "birthday:201",//not correct
        "birthday=2011",
        "birthday=2010/09/10",
        "birthday>=2010-09-10",
        "birthday=2010-09-10T00:00:00Z",//not correct
        "birthday=2010-09-10T00:00Z",//not correct
        "id=6 AND NOT firstName=Simon",
        "id=6 AND -firstName=Simon",
        "id!=6 | firstName!=Simon",
        "id!=6 | firstName=Simon",
        "id=6 firstName=Simon",
        "id=6 firstName!=Simon",
        "id!=6 firstName=Simon",
        "id=6 and firstName=Simon",
        "id=6 or firstName=Simon",
        "id!=6 or firstName=Simon or lastName=Keogh",
        "birthday>=2010-09-10T00:00:00Z",
        "birthday:2010",
        "birthday:2010-5",
        "birthday:2010-9",
        "birthday:2010/9",
        "birthday:2010-9-10",
        "birthday>=2010-09-10",
        };

    for (int i = 0; i < testData.length; i++) {
      qp.setX(EmptyX.instance());
      Predicate predicate = qp.parseString(testData[i], User.class);
      ListSink listDao = (ListSink) dao.where(predicate).select(new ListSink());

      // show data
      System.out.println("queryParser "+testData[i] +" -> number of result " + listDao.getData().size());
      if (result[i]!= listDao.getData().size()) {
        throw new NullPointerException();
      }
    }

   /* for (String data : testData) {
      qp.setX(EmptyX.instance());
      Predicate predicate = qp.parseString(data, User.class);

      ListSink listDao = (ListSink) dao.where(predicate).select(new ListSink());

      // show data
      System.out.println("queryParser "+data +" -> number of result " + listDao.getData().size());
    }*/
  }

  private static void UseCaseJsonParserTest(DAO dao) {
    JSONParser jsonPr = new JSONParser();
    String data = "{id:6,\"firstName\":\"Simon\"}";

    jsonPr.setX(EmptyX.instance());
    User query = (User) jsonPr.parseString(data, User.class);
    ListSink listDao = (ListSink) dao.where(MLang.EQ(User.ID, query.getId())).select(new ListSink());
  }
}
