package foam.nanos.hello;

import foam.box.HTTPBox;
import foam.core.X;

public class HelloTest extends foam.nanos.test.Test {

  @Override
  public void runTest(X x) {
    ClientHelloService helloService = new ClientHelloService.Builder(x).setDelegate(new HTTPBox.Builder(x).setUrl("http://localhost:8080/service/hello").build()).build();
    String result = helloService.hello("Java");
    test( result.equals("helloJava"), "ClientHelloService succeed");
  }
}
