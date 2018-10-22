/*
    Rewriter.js
    Scans AST and builds internal model
    (c) 2013-2018 musictheory.net, LLC
    MIT license, http://www.opensource.org/licenses/mit-license.php
*/

"use strict";

const _          = require("lodash");
const esprima    = require("../ext/esprima");
const Syntax     = esprima.Syntax;

const Traverser  = require("./Traverser");
const Modifier   = require("./Modifier");


module.exports = class Checker {

constructor(file, contents)
{
    this._file = file;
    this._contents = contents;
}



parse()
{
    let ast = null;
    let contents = this._contents;

    try {
        ast = esprima.parse(contents, { loc: true });
    } catch (e) {
        console.log(e);
        return false;
    }

    this._ast = ast;
    this._modifier = new Modifier(contents.split("\n"));

    return true;
}


check()
{
    let file          = this._file;
    let traverser     = new Traverser(this._ast);
    let modifier      = this._modifier;
    let classNames    = { };
    let protocolNames = { };

    function addWarning(node, reason) {
        let line   = 0;
        let column = 0;

        if (node && node.loc) {
            line    = node.loc.start.line;
            column  = node.loc.start.col;
        }

        let result  = "";

        if (file)   result += file;
        if (line)   result += ":" + line;
        if (column) result += ":" + column;
        if (reason) result += " " + reason;

        console.log(result)
    }

    function checkType(node, type) {
        if (_.includes([ "double", "float", "int", "char", "short", "long" ], type)) {
            addWarning(node, "Use of alised type '" + type + "', change to Number");
        }

        if (_.includes([ "Bool", "bool" ], type)) {
            addWarning(node, "Use of alised type '" + type + "', change to BOOL or Boolean");
        }
    }


    function handleNSClassImplementation(node)
    {
        let name = node.id.name;

        classNames[name] = true;

        if (protocolNames[name]) {
            addWarning(node, "'" + name + "' used for both a @class and a @protocol");
        }
    }


    function handleNSProtocolDefinition(node)
    {
        let name = node.id.name;

        protocolNames[name] = true;

        if (classNames[name]) {
            addWarning(node, "'" + name + "' used for both a @class and a @protocol");
        }
    }


    function handleNSInstanceVariableDeclaration(node)
    {
        let type = node.parameterType ? node.parameterType.value : null;
        checkType(node, type);
    }


    function handleNSPropertyDirective(node)
    {
        let name = node.id.name;
        let type = node.id.annotation.value;

        checkType(node, type);

        for (let i = 0, length = node.attributes.length; i < length; i++) {
            let attribute = node.attributes[i];
            let attributeName = attribute.name;

            if (!_.includes([ "readonly", "readwrite", "getter", "setter", "copy", "struct", "class" ], attributeName)) {
                addWarning(node, "Use of @property attribute '" + attributeName + "'");
            }
        }
    }        


    traverser.traverse(function(node, parent) {
        let type = node.type;

        try {
            if (type === Syntax.NSClassImplementation) {
                handleNSClassImplementation(node);

            } else if (type === Syntax.NSProtocolDefinition) {
                handleNSProtocolDefinition(node);

            } else if (type === Syntax.NSInstanceVariableDeclaration) {
                handleNSInstanceVariableDeclaration(node);

            } else if (type === Syntax.NSPropertyDirective) {
                handleNSPropertyDirective(node);

            } else if (type === Syntax.NSForwardDirective) {
                addWarning(node, "Use of @forward");

            } else if (type === Syntax.NSSqueezeDirective) {
                addWarning(node, "Use of @squeeze");
            }

        } catch (e) {
            if (node) {
                if (!e.line) {
                    e.line    = node.loc.start.line;
                    e.column  = node.loc.start.col;
                }
            }

            throw e;
        }

    }, function(node, parent) {

    });
}


getOutput()
{
    let lines = this._modifier.finish();
    return lines.join("\n");
}


}
