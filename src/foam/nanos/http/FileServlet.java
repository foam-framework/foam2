/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import foam.nanos.boot.NSpec;
import foam.nanos.boot.NSpecAware;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class FileServlet
  extends HttpServlet
  implements NSpecAware
{
  protected static final String                  DEFAULT_EXT  = "application/octet-stream";
  protected static final HashMap<String, String> EXTS         = new HashMap();

  protected NSpec nspec_;

  static {
    EXTS.put("js",    "application/javascript");
    EXTS.put("class", "application/java-vm");
    EXTS.put("xml",   "application/xml");

    EXTS.put("gif",   "image/gif");
    EXTS.put("png",   "image/png");
    EXTS.put("svg",   "image/svg+xml");

    EXTS.put("java",  "text/x-java-source");
    EXTS.put("csv",   "text/csv");
    EXTS.put("txt",   "text/plain");
    EXTS.put("html",  "text/html");
  }

  protected void fileNotFoundError(HttpServletResponse resp, String file) {
    resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
    resp.setContentType("application/json");

    try {
      resp.getWriter().write("{\"error\": \"File not found\"," + "\"filename\": \"" + file + "\"}");
    } catch (IOException ignore) {}
  }

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp) {
    String pathInfo;
    try {
      pathInfo = req.getRequestURI();
    } catch(Exception e) {
      e.printStackTrace();
      pathInfo = req.getPathInfo();
    }

    String filePath = pathInfo.substring(nspec_.getName().length() + (pathInfo.startsWith("/" + nspec_.getName() + "/") ? 2 : 1));
    try {
      File   srcFile = new File(filePath.isEmpty() ? "./" : filePath);
      String path    = srcFile.getAbsolutePath();
      String cwd     = System.getProperty("user.dir");

      if ( srcFile.isDirectory() && srcFile.canRead() && cwd.equals(path.substring(0, cwd.length())) ) {
        resp.setContentType(EXTS.get("html"));
        PrintWriter pw = resp.getWriter();
        pw.write(
            "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<body>\n" +
                "<ul style=\"list-style-type:disc\">");

        File[] files = srcFile.listFiles();

        if ( files != null && files.length > 0 ) {
          for ( File file : files ) {
            pw.write("<li>" + "<a href=\"/static/" + filePath
                + ( ! filePath.isEmpty() && ! filePath.endsWith("/") ? "/" : "" )
                + file.getName() + "\"?>" + file.getName() + "</a></li>");
          }
        }

        pw.write("</ul>  \n" +
            "</body>\n" +
            "</html>");

      } else if ( srcFile.isFile() && srcFile.canRead() && cwd.equals(path.substring(0, cwd.length())) ) {
        String          tokens[]  = srcFile.getName().split("\\.");
        String          extension = tokens.length > 0 ? tokens[tokens.length-1 ] : "unknown";
        String          ext       = EXTS.get(extension);
        FileInputStream fis       = new FileInputStream(srcFile);

        resp.setContentType(ext != null ? ext : DEFAULT_EXT);
        resp.setHeader("Content-Disposition", "filename=\"" + srcFile.getName() + "\"");

        byte[] buffer = new byte[4096];
        int bytesread;
        while ( (bytesread = fis.read(buffer)) != -1 ) {
          resp.getOutputStream().write(buffer, 0, bytesread);
        }

        fis.close();
      } else {
        fileNotFoundError(resp, filePath);
      }
    } catch (StringIndexOutOfBoundsException | IOException e) {
      fileNotFoundError(resp, filePath);
    }
  }

  @Override
  public void setNSpec(NSpec spec) {
    nspec_ = spec;
  }
}
