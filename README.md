<p align="center">
   <img src="readmeImg/codebeamer-cards.png" alt="codebeamer cards"/>
</p>

<p align="center">
  <a href="https://github.com/codeBeamer-Extensions-and-Addons/codebeamer-miro/blob/refactor/react#installation">Installation</a> |
  <a href="https://github.com/codeBeamer-Extensions-and-Addons/codebeamer-miro/blob/refactor/react/CHANGELOG.md">Changelog</a>
</p>

<h3 align="center">Visualize your codeBeamer issues in Miro</h3>

<p align="center">
    This is a Plugin for <a href="https://miro.com">Miro</a> that allows you to sync Issues managed on a <a href="https://codebeamer.com">codeBeamer</a> instance, <br/> visualizing them as App Cards on your boards.
</p>

<p align="center">
<a href="[https://www.npmjs.com/package/cypress](https://dashboard.cypress.io/projects/cumqrv/runs)">
    <img src="https://img.shields.io/endpoint?url=https://dashboard.cypress.io/badge/detailed/cumqrv&style=flat&logo=cypress" alt="tests"/>
 </a>
</p>

---

# Features

The App is entirely focused around the functionality to:

-   **Import codebeamer Items into Miro and visualize them as AppCards**

which is subsidized by following functionality:

-   **Support for self-hosted instances**
    -   Connect to any codebeamer instance
-   **Filtering Items**
    -   Select any Project, then
    -   Filter Items by a Tracker and
        -   Filter by any of the Tracker's fields with a codebeamer-like interface
-   **Configure AppCards**
    -   Configure what data the AppCards display
-   **Relation visualization** (to be re-added)
    -   see associations and hierarchical relations between your Items visualized with differently styled lines

[image: import modal left, result right]

Want to give it a shot? [Install](#installation) the app, then click the <svg className="pos-adjusted-up wh-40p" enableBackground="new 0 0 256 256" version="1.1" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" height="24" width="24"><path d="m142.7 103.9c1.4 12.6 2.6 29.3 21.5 18.5 0.5-0.2 0.9-0.5 1.2-0.7 4.5-6.7-0.2-20.9 5.1-20 5.9 1-1.2 7.6 1.8 12.7 3.1-2.1 3.6-11 7.9-8.3 4.2 2.6-3.4 5.6-3.7 8.9 2.7 1.4 10.4-6 11.4-0.7 0.9 4-9.3 3.4-10.3 5.4 2.1 3.3 12.7 0.7 10.1 6-2.2 4.4-9.4-3.3-13.6-2 1.2 3.7 8.9 4.4 5.7 8-2.9 3.3-6.8-2.5-11.7-7.1-0.6 0.7-1.2 1.4-1.9 2.1-11.9 11.9-26 8.9-33.2-3.5-3.5-6-3.3-9.7-4.3-16.2-1.3 4-2.2 7.8-2.6 11.6-10.5 9.2-19.8 19.1-22.8 34.2 7-5.5 13.6-13.1 20.4-9.8 6.4 3.1 11.4 12.6 13.6 20.2 6.1-2.8 11.2-5.8 12.8-1.6 1.9 5.3-6.8 2.8-9.6 6.4 4 3.1 15.1-2.4 15.7 3.3 0.7 6.9-9.9-0.4-13.6 2.4 0.3 2.6 11.6 6.1 9.1 10.1-3.4 5.3-8.9-5.9-12.3-5.6-1.1 3.8 5.9 10.1 0.3 11.3-5.9 1.2-2.7-8.7-5.2-12.3-5.4 4.2-0.3 14.4-7.2 13.1-6-1.2 4-13.8 2.9-23-2.8-3.3-5.9-6.5-8.9-5.4-6.3 2.5-6.7 9.3-17.9 13.6 8.8 17 33.4 33.9 57.1 32.4 21.4-1.4 46-18.3 36.6-55.5-1.2-4.7-1-6.5 2.1-0.7 14.2 26.8-4.8 72.1-54.3 66.8-58.6-6.2-63.2-56.8-81.2-61.2-4-1-8.1 3.1-11.7 6.2 0.4 8.3 5.1 17.8-0.4 18.4-5.2 0.6-1-6.8-3.7-10.1-3.7 2.9-1.1 14.3-6.5 13.5-6.4-0.9 2.6-8.9 0.8-12.8-2.5-0.3-8.1 9.2-11.2 6-4.2-4.3 7.3-6.7 7.7-9.9-3.2-1.8-10.6 3.2-10.4-2.2 0.2-5.5 8.5-0.5 12.4-2-2.7-5.9-13.1-3.5-10.4-9.5 1.8-3.9 7.4 1.8 13.8 5.3 2-8.1 11.3-21.4 18-21.9 5.4-0.4 9.9 4.1 14.4 8.9-0.2-2.6-0.2-5.2-0.1-7.9 0.5-24.5 9.5-46.2 44.9-61.1 1.4-10.4-9.9-13.4-8-20.8 1.6-5.7 9.5-10.9 16.3-12.7-2.9-5.5-6.5-10.2-2.8-11.9 4.4-2 2.8 5.7 6.1 7.8 2.4-3.6-3-12.7 1.9-13.6 5.8-1 0.2 8.4 2.9 11.4 2.2-0.4 4.4-10.3 8-8.4 4.8 2.6-4.5 7.9-3.9 10.8 3.3 0.7 8.2-5.7 9.6-1 1.4 4.9-7.3 2.8-10.2 5.2 3.9 4.4 12.3-0.5 11.6 5.4-0.6 4.9-10.8-1.8-18.5-1.2-3.3 2.5-7.2 6.1-7 9.4 0.3 5 6.7 9 10.6 13.4 7.4-3.2 6.6-10.9 12-13.8 20-11 51.4 6.3 51.6 14.9 0.1 8.2-17.3 19.7-32.1 23.2-3.5 0.8-6.1-0.5-8.4-1.8-8.8-5.3-11.7 3.1-18.3 9.4" fill="#000"/></svg> Salamander it in the left Toolbar (initially hidden under `>>`) on Miro.

<!--
* Less might very well be more here.
* Why bother making a long and intricate manual? Just make the app a good UX and self-explanatory.
 -->

### Relation Color Table

The lines that visualize relations between Items are colored as follows:

| Type                         | Color                                                     |
| ---------------------------- | --------------------------------------------------------- |
| depends on                   | <span style="color: #FF1500;">Red - #FF1500</span>        |
| is superordinate to (parent) | <span style="color: #008c00;">Green - #008c00</span>      |
| is subordinate to (child)    | <span style="color: #FFA500;">Orange - #FFA500</span>     |
| is related to                | <span style="color: #0066CC;">Blue - #0066CC</span>       |
| is derived from              | <span style="color: #ADD8E8;">Lightblue - #ADD8E8</span>  |
| copy of                      | <span style="color: #00008b;">Darkblue - #00008b</span>   |
| violates                     | <span style="color: #c9b00e;">Darkyellow - #c9b00e</span> |
| excludes                     | <span style="color: #FF00FF;">Magenta - #FF00FF</span>    |
| invalidates                  | <span style="color: #7100FF;">Violet - #7100FF</span>     |

# Installation

The app is not (yet) available on the Miro Marketplace, so you'll have to install it in your Team directly.

If a peer of yours has already installed the app in their team, they can provide you with an link for using that installation. Just ask them for the `Installation URL`. Opening it will take you to Miro, where you can then select a Team to enable the app on.

In order to install the App on your Team directly, follow steps **two** to **four** of the [Miro Developer Getting started Guide](https://developers.miro.com/docs/getting-started).  
Make sure to copy the link to this repository's [Github-Pages](https://codebeamer-extensions-and-addons.github.io/codebeamer-miro/), where we host the plugin, and paste it in the URL field under **App URL** in your app settings.

Installing the app on your team will also give you an Installation URL to share the app with (see point five of the mentioned guide).

# Contribute

Anyone can contribute. Just branch off of `develop` and create a Pull request when your feature is ready.  
If you want to propose a feature or report a bug instead, feel free to create an [Issue](https://github.com/codeBeamer-Extensions-and-Addons/codebeamer-miro/issues).

## Tech Stack

-   The app is written in TypeScript and uses the [React](https://reactjs.org/) UI Framework.
-   Tests are [Cypress](https://cypress.io) Component tests written in TypeScript.

## Local setup

### Setup

```bat
npm i                   // install dependencies
npm run build           // build the app with vite
npm run start           // run the development server on localhost 3000 (if available)
```

To use the locally hosted app on Miro, follow Steps 2 to 4 on [Miro's Guide](https://developers.miro.com/docs/build-your-first-hello-world-app).
