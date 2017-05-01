ni
==

script to simplify node-inspector debugger workflow. Does [this](https://github.com/node-inspector/node-inspector#enable-debug-mode) and [this steps](https://github.com/node-inspector/node-inspector#debugging) for you by spawning node with debugger agent, 
node-inspector server and browser with UI (using [browser-launcher](https://github.com/substack/browser-launcher))

Installation
============

[![Greenkeeper badge](https://badges.greenkeeper.io/sidorares/ni.svg)](https://greenkeeper.io/)

    npm install -g ni
    

Usage
=====
    ni script-to-debug.js
    
    
TODO
====
 - handle automatically coffe-script and mocha
 - command line switches
 - attach to pid


