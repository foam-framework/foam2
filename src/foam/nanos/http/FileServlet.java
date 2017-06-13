package foam.nanos.http;

import com.google.api.client.util.IOUtils;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;

/**
 * Created by nick on 12/06/17.
 */
public class FileServlet
    extends HttpServlet
{

  public static final String SERVLET_NAME = "file";

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
    String pathInfo = req.getPathInfo();
    String filePath = pathInfo.substring(SERVLET_NAME.length() + 2);
    String fileName = "";

    String[] paths = filePath.split("/");
    if(paths.length > 0) {
      fileName = paths[paths.length - 1];
    } else {
      fileNotFoundError(resp, filePath);
      return;
    }

    try {
      File srcFile = new File(filePath);

      String path = srcFile.getAbsolutePath();
      String cwd = System.getProperty("user.dir");

      if ( srcFile.isFile() && srcFile.canRead() && cwd.equals(path.substring(0, cwd.length())) ) {
        resp.setContentType("application/octet-stream");
        resp.setHeader("Content-Disposition", "filename=\"" + fileName + "\"");
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