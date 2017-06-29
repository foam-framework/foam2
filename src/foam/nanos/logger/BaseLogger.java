/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.logger;

import foam.nanos.*;

public class BaseLogger extends NanoLogger {
    public BaseLogger() {
    	FileLogger fl = new FileLogger();
    	StdoutLogger stdl = new StdoutLogger();
    	fl.start();
    	stdl.start();
    	add(fl);
    	add(stdl);
    }

}