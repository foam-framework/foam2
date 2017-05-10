PM:
Records inforamtion and is sent to PMLogger
class PM {
    PM(this.class, name) -> marks down time
    getName() -> returns name
    getClass() -> returns classtype
    getTime() -> returns time taken
    log(X) -> records time since creation {
                 PMLogger logger = (PMLogger) X.get('PMLogger');
                 logger.log(this);
               }
};


PMInfo:
A collection of data that is accessed through the PMDao
records ->
    the class, and name associated with the PM
    number of occurences
    maximum time
    minimum time
    average time
    total time


Interface PMLogger:
class PMLogger {
    Log(PM) -> attmepts to find a PMInfo in the PMDao, if it finds it, it will update it, if it can't it will create a new one.
}

Log(PM) will need to be implemented, for example a DAOPMLogger will take the PM, and use the PMDao to update a PMInfo


PMDao:
Provides an interface to the PMInfo database for reading and writing
