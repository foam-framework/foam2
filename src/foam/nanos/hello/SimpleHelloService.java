package foam.nanos.hello;

public class SimpleHelloService implements HelloService {
  @Override
  public String hello(String name) {
    return "hello" + name;
  }
}
