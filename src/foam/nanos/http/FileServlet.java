package foam.nanos.http;

import com.google.api.client.util.IOUtils;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;

public class FileServlet
    extends HttpServlet
{

  public static final String SERVLET_NAME = "static";

  protected static final HashMap<String, String> extLookup;
  protected static final String                  defaultExt = "application/octet-stream";

  static {
    extLookup = new HashMap<>();

    extLookup.put("js",    "application/javascript");
    extLookup.put("class", "application/java-vm");
    extLookup.put("xml",   "application/xml");

    extLookup.put("gif",   "image/gif");
    extLookup.put("png",   "image/png");

    extLookup.put("java",  "text/x-java-source");
    extLookup.put("csv",   "text/csv");
    extLookup.put("txt",   "text/plain");
    extLookup.put("html",  "text/html");
  }

  private void fileNotFoundError(HttpServletResponse resp, String file) {
    resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
    resp.setContentType("application/json");

    try {
      PrintWriter pw = resp.getWriter();
      pw.write(
          "{\"error\": \"File not found\"," +
              "\"filename\": \""+file+"\"}");
    } catch (IOException ignore) {}
  }

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp) {
    String   pathInfo = req.getPathInfo();
    String   filePath = pathInfo.substring(SERVLET_NAME.length() + 2);

    try {
      File   srcFile = new File(filePath.isEmpty() ? "./" : filePath);
      String path    = srcFile.getAbsolutePath();
      String cwd     = System.getProperty("user.dir");

      if ( srcFile.isDirectory() && srcFile.canRead() && cwd.equals(path.substring(0, cwd.length())) ) {
        resp.setContentType(extLookup.get("html"));
        PrintWriter pw = resp.getWriter();
        pw.write(
            "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<body>\n" +
                "<ul style=\"list-style-type:disc\">");

        File[] files = srcFile.listFiles();
        if ( files != null && files.length > 0 ) {
          for ( File file : files ) {
            pw.write("<li>" + "<a href=\"/static/" + filePath + (filePath.isEmpty() ? "" : "/") + file.getName() + "\"?>"
                + file.getName()
                + "</a></li>");
          }
        }

        pw.write("</ul>  \n" +
            "</body>\n" +
            "</html>");

      } else if ( srcFile.isFile() && srcFile.canRead() && cwd.equals(path.substring(0, cwd.length())) ) {
        String tokens[] = srcFile.getName().split("\\.");

        String extension = tokens.length > 0 ? tokens[tokens.length-1 ] : "unknown";
        String ext = extLookup.get(extension);
        resp.setContentType(ext != null ? ext : defaultExt);
        resp.setHeader("Content-Disposition", "filename=\"" + srcFile.getName() + "\"");
        FileInputStream fis = new FileInputStream(srcFile);
        IOUtils.copy(fis, resp.getOutputStream());
      } else {
        fileNotFoundError(resp, filePath);
      }
    } catch (StringIndexOutOfBoundsException | IOException e) {
      fileNotFoundError(resp, filePath);
    }
  }
}
