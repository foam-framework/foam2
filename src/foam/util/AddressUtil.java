/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


package foam.util;

import java.util.regex.Pattern;

public class AddressUtil {

  protected static final Pattern suitePattern = Pattern.compile("/\\d+/g");
  protected static final Pattern replacePattern = Pattern.compile("/[#\"]/g");

  public static String[] parseAddress(String address1, String address2) {

    if ( address1.indexOf("Unit") > 0) {
      var parts = address1.split("Unit");
      address1 = parts[0].trim();
      address2 = parts[1].trim();
    }
    if ( address1.endsWith(",") ) {
      address1 = address1.split(",")[0];
    }
    if ( address1.indexOf(',') > 0) {
      var parts = address1.split(",");
      address1 = parts[0];
      address2 = parts[1];
    }
    var street = address1;
    var suite = "";

    try {
      suite = suitePattern.matcher(address2).group(0);
    } catch(IllegalStateException ignored) {}

    if ( address1.indexOf('-') > 0) {
      var parts = address1.split("-");
      suite = suitePattern.matcher(parts[0]).group(0);
      street = parts[1].trim();
    }

    var newString = replacePattern.matcher(street).replaceAll("");
    var n = newString.indexOf(' ');
    return new String[] { newString.substring(0,n), newString.substring(n+1) };
  }

}
