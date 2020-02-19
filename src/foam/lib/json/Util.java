/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

/** JSON Utility methods. **/
public class Util {

  /** Append src string to dst StringBuilder as an escaped JSON string. **/
  public static void escape(String src, StringBuilder dst) {
    char c;
    for ( int i = 0 ; i < src.length() ; i++ ) {
      c = src.charAt(i);

      switch ( c ) {
        case '\t':
          dst.append("\\t");
          break;
        case '\r':
          dst.append("\\r");
          break;
        case '\n':
          dst.append("\\n");
          break;
        case '\\':
          dst.append("\\\\");
          break;
        case '\"':
          dst.append("\\\"");
          break;
        default:
          if ( c >= ' ' ) {
            dst.append(c);
          } else {
            dst.append("\\u00");
            char right = (char) (c & 0x0F + '0');
            char left  = (char) ((c & 0xF0) >> 4 + '0');
            if ( right > '9' ) right += 'A' - '9' - 1;
            if ( left > '9'  ) left  += 'A' - '9' - 1;
            dst.append(left);
            dst.append(right);
          }
      }
    }
  }

}
