# Miro plugin: codeBeamer integration

This is a codeBeamer <-> Miro integration web-plugin to be installed on Miro.\
It allows to import codeBeamer items to a Miro board, displaying any associations between the items.

The goal is to make this plugin at least as powerful as the [Miro-Jira plugin](https://miro.com/works-with-atlassian/)

More info to come! Stay tuned...

# Build and Run locally
## Setup
Run `npm install` in the root directory of the repository to install all dependencies

## Build
Run `npm run build` (on Windows) or `npm run build-linux` depending on your OS.\
Afterward, you can run `npm run watch` to continuously watch the TS files for changes and autocompile on save.

## Host locally and use on Miro
To run on Miro, you will need to host the contents of the **dist** directory via HTTP**S**. This can be achieved by running it on http locally and then tunneling to it using ngrok.

Run `npm run start` in a separate terminal to start a local http server on port 8081 \
Run `npm run ngrok` in yet another terminal (the third terminal :) ) to get an ngrok address that points to your localhost. Only you will be able to browse this.

Now you can set the address of your dev environment miro-plugin to the temporary ngrok address. \
To develop and see the changes directly on Miro, have one terminal watch the code using the watch command above. After saving a script, Ctrl+F5 the ngrok address in a browser to force it to reload it (Miro will not do this very often). Now refresh Miro and voila.

If you make a change to any of the html files, you will need to stop the http server (to release the dist folder), rerun the build process (it will rebuild the dist folder) and start the http server back up. I have observed that sometimes, you need to manually clear the browser cache completely for Miro to notice the change.

![Console Commands](readmeImg/consoleCommands.jpg "Three consoles with the commands to run")
![Running Consoles](readmeImg/consoleRunning.jpg "The running consoles when running locally")


# Contribute
You can simply create a branch, make your changes and submit a pull request to master.

# How to Install and Use
We are not yet on the Miro Marketplace - we will submit once we are happy with the state of the project \
To install, follow steps 2,3 and 4 of the [Miro Developer Getting started Guide](https://developers.miro.com/docs/getting-started) \
Copy the [link of the Github-Pages page of this repo](https://max-poprawe.github.io/codebeamer-miro/) and paste it in the URL field under `Web-plugin` in your app settings.