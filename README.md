# LiveMessenger

**This is a school assignment for WESWEB01**<br>
*Linus Romland, Svante Jonsson & Markus Simonsen*

*** ***Currently in development*** ***

LiveMessenger is a site that automatically shows new messages without reload required. It also has a secure login system with passportJS and saves messages in a MongoDB Database. <br><br>
Live preview is available on:
> https://livemsg.romland.space/

# How it works

LiveMessenger starts up and by default connects to MongoDB on 127.0.0.1 (localhost) without authentication. This could however be turned on. (Check Authentication MongoDB). You could then access the site on port 3006. (127.0.0.1:3006 on local machine). You can then create a account or login to a existing one. Then you could access different rooms (and create new ones) and chat with your friends!

# Usage

**LiveMessenger** is very easy to use. 

You need to have NodeJS, npm and MongoDB installed on your system.
https://nodejs.org/en/download/
https://www.npmjs.com/get-npm
https://www.mongodb.com/try/download/community?tck=docs_server

You download the project by git clone or downloading the zip. 
Then you go to the server folder and run:

> npm install 

This will install all the dependencies the project is using.
Then you run:
>  npm run start


# MongoDB Authentication

By default **LiveMessenger** does not use authentication to MongoDB.

If you have your MongoDB Database with authentication turned on you could use that with **LiveMessenger**.
To do this copy the file named **mongoauth.json.example** and name it **mongoauth.json** and then specify your credentials in the file

**LiveMessenger** only supports authentication with username and password. Auth DB must be admin!


## License

**LiveMessenger** is under MIT License.
 For information about the MIT License check out the following link:
  https://github.com/linusromland/LiveMessenger/blob/master/LICENSE

