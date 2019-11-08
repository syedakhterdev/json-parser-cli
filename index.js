#!/usr/bin/env node

var fs = require('fs');
var chalk = require('chalk');
var found = [];
try {
    const fileData = fs.readFileSync('./SystemViewController.json');
    const jsonData = JSON.parse(fileData);
    var standard_input = process.stdin;

    // Set input character encoding.
    standard_input.setEncoding('utf-8');
    
    // Prompt user to input data in console.
    console.log("Please enter selector.");
    
    // When user input data and click enter key.
    standard_input.on('data', function (selector) {
        selector = selector.replace(/\r?\n|\r/g, '');
        // User input exit.
        if(selector === 'exit'){
            // Program exit.
            console.log("User input complete, program exit.");
            process.exit();
        }

        switch(selector[0]) {
            case ".":
                found = [];
                const className = selector.replace(/\./g, '');
                deepSearch(jsonData, 'classNames', (k, v) => v.indexOf(className) > -1 , true).then((f) => {
                    console.dir(f, {depth: null, colors: true});
                    nextSelectorMessage();
                });
                break;
            case "#":
                found = [];
                const identifier = selector.replace(/\#/g, '');
                const callback = (k, v) =>   v === identifier;
                deepSearch(jsonData, 'identifier', callback, true).then((f) => {
                    console.dir(f, {depth: null, colors: true});
                    nextSelectorMessage();
                });
                break;
            default:
                if(selector.indexOf('#') > 0 || selector.indexOf('.') > 0) {
                    const splitId = selector.indexOf('#') > 0 ? selector.split('#') : selector.split('.');
                    const callback = selector.indexOf('#') > 0 ? (k, v) =>  v === splitId[1] : (k, v) => v.indexOf(splitId[1]) > -1;
                    let promises = [];
                    deepSearch(jsonData, 'class', (k, v) =>  v === splitId[0], true).then((view) => {
                        if(view.length > 0) {
                            view.forEach((c) => {
                                    deepSearch(c, selector.indexOf('#') > 0 ? 'identifier':'classNames', callback, false).then((f) => {
                                        if(f.length > 0){
                                            console.dir(f, {depth: null, colors: true});
                                            nextSelectorMessage();
                                        }
                                    });
                            });

                        }
                    });
                } else {
                    deepSearch(jsonData, 'class', (k, v) =>  v === selector, true).then((f) => {
                        console.dir(f, {depth: null, colors: true});
                        nextSelectorMessage();
                    });
                }

        }
    });

} catch(err) {
        const log = chalk.red(err.message);
        console.log(log);
        process.exit();
}

function nextSelectorMessage() {
    const log = chalk.green('==============================================================');
    console.log(log);
    // console.log("Please enter selector.");
}

function  deepSearch (object, key, predicate, isDeepSearch) {
    return new Promise((resolve, reject) => {
        if(!isDeepSearch) found = [];
        if (object.hasOwnProperty(key) && predicate(key, object[key]) === true) {
            found.push(object);
            if(!isDeepSearch) {
                resolve(found);
                return;
            }
        }

        for (let i = 0; i < Object.keys(object).length; i++) {
            if (typeof object[Object.keys(object)[i]] === "object") {
                deepSearch(object[Object.keys(object)[i]], key, predicate, isDeepSearch).then((o) => {
                    // resolve(o);
                })
            }
        }
        resolve(found);
    })
}
