package foam.flinks;

import foam.core.FObject;
import foam.core.X;
import foam.flinks.model.FlinksRequest;
import foam.flinks.model.FlinksResponse;
import foam.lib.json.JSONParser;

public class TestFlinks {
  JSONParser jsonParser = new JSONParser();

  public TestFlinks(X x ) {
    jsonParser.setX(x);
  }

  public FObject test1() {
    String s = "{\"HttpStatusCode\":203,\"Institution\":\"FlinksCapital\",\"RequestId\":\"b32bb231-4d55-46af-a1c3-76758a908d3f\",\"aa\":\"true\", \"a11a\":[\"null\",null,123123213.11231,123,false,[\"null\",null,123123213.11231,123,false,[true,{\"dsaf\":[],\"dsaf1\":{},\"afdsf\":{\"adffff\":123.123}},{}],[]]]}";
    return jsonParser.parseString(s, FlinksResponse.class);
    
  }
}