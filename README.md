# simple-middleman
Simple NodeJS server meant to handle logged url information (like with chromer). 

Even though this is not the sole possibility of working with it, it is the fastest way unless you can change your datascheme which is in your JSON object. If you want to use it in your own solution without the chromer package, you will need the following data within your JSON object:
'url'
'method'
'requestheaders'
'mime_type'
'response_code'
'request_body'

simple-middleman uses a PostgresQL database to save data. To make sure the URLs saved in the database are unique, simple-middleman will create a file within the directory called 'hashes.txt', in which it will keep MD5 hashes it made out of the URLs. This is also necessary when you decide to use this with chromer, since a chrome extension will reset itself if you refresh it. 

To get it running, clone the repository like ``git clone https://github.com/TheMMMdev/simple-middleman`` and do ``npm install``. This will install all necessary packages for this repository. Within the config.json file, you will need to add your postgres url (format is already in there) and the table you want the data to be inserted in. 

Pull requests are welcome as always. If you run into any problems, feel free to open an issue. 
