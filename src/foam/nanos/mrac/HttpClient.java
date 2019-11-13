package foam.nanos.mrac;

import java.io.IOException;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;

public class HttpClient {

    public static int CHUNK_SIZE = 8388608;

    public String postRequest(String dest, Object object) {
        HttpURLConnection conn;
        try {
            URL url = new URL(dest);
            conn = (java.net.HttpURLConnection)url.openConnection();
            conn.setDoOutput(true);
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Accept", "application/json");
            conn.setRequestProperty("Content-Type", "application/json");

            OutputStreamWriter output = 
                new java.io.OutputStreamWriter(
                    conn.getOutputStream(),
                    java.nio.charset.StandardCharsets.UTF_8
                );
            
            output.write(object.toString());
            output.close();

            byte[] buf = new byte[CHUNK_SIZE];
            java.io.InputStream input = conn.getInputStream();

            int off = 0;
            int len = buf.length;
            int read = -1;
            while ( len != 0 && ( read = input.read(buf, off, len) ) != -1 ) {
                off += read;
                len -= read;
            }

            if ( len == 0 && read != -1 ) {
                throw new RuntimeException("Message too large.");
            }

            return new String(buf, 0, off, java.nio.charset.StandardCharsets.UTF_8);

        } catch ( IOException e ) {
            throw new RuntimeException(e);
        }
    }
}