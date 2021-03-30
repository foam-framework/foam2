package foam.test;

import foam.core.ContextAware;
import foam.core.X;
import foam.nanos.test.Test;
import static foam.util.AddressUtil.parseAddress;

public class AddressUtilTests extends Test implements ContextAware {

  X x;

  @Override
  public X getX() {
    return x;
  }

  @Override
  public void setX(X x) {
    this.x = x;
  }

  @Override
  public void runTest(X x) {
    this.x = x;
    testAddressParse(x, "14 Cheltenham Mews", "", "14", "Cheltenham Mews");
    testAddressParse(x, "25 St. Dennis Drive", "Suite # 1019", "25", "St. Dennis Drive");
    testAddressParse(x, "1505 - 25 The Esplanade", "", "25", "The Esplanade");
    testAddressParse(x, "1505-19 Western Battery Rd", "", "19", "Western Battery Rd");
  }

  public void testAddressParse(X x, String address1, String address2, String number, String street) {
    var addrs1 = parseAddress(address1, address2);
    test(addrs1[0].equals(number) && addrs1[1].equals(street), "[" + address1 + "," + address2 + "] parsed to [\"" + number + "\", \"" + street + "\"]");
  }

}
