/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

/** JSON Utility methods. **/
public class Util {

  /**
   * Helper method to block copy ranges of characters.
   * Doing so increases performance by 30%.
   **/
  protected static int copy(int start, int end, String src, StringBuilder dst) {
    dst.append(src, start, end);
    return end+1;
  }

  /** Append src string to dst StringBuilder as an escaped JSON string. **/
  public static void escape(String src, StringBuilder dst) {
    int start = 0;
    int len   = src.length();
    for ( int i = 0 ; i < len ; i++ ) {
      char c = src.charAt(i);

      switch ( c ) {
        case '\t':
          start = copy(start, i, src, dst);
          dst.append("\\t");
          break;
        case '\r':
          start = copy(start, i, src, dst);
          dst.append("\\r");
          break;
        case '\n':
          start = copy(start, i, src, dst);
          dst.append("\\n");
          break;
        case '\\':
          start = copy(start, i, src, dst);
          dst.append("\\\\");
          break;
        case '\"':
          start = copy(start, i, src, dst);
          dst.append("\\\"");
          break;
        default:
          if ( c < ' ' ) {
            start = copy(start, i, src, dst);
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

    copy(start, len, src, dst);
  }

}
