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

module.exports = class Rewriter {

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


rewrite()
{
    let traverser = new Traverser(this._ast);
    let modifier  = this._modifier;

    let currentProtocol;

    function addWarning(reason, node) {

    }


    function addTransform(reason, node) {

    }

    function transformType(inType) {
        // Transform id<Foo> to Foo
        inType = inType.replace(/id\s*\(<\s*(\w+)\s*>)\>/, "$1");
    }

    function makeLocation(node) {
        if (node && node.loc && node.loc.start) {
            return {
                path:   ojFile.path,
                line:   node.loc.start.line,
                column: node.loc.start.col
            }
        }

        return null;
    }

    function handleNSClassImplementation(node)
    {
        modifier.from(node).to(node.id).replace("@class ");
    }

    function handleNSInstanceVariableDeclaration(node)
    {
        let type = node.parameterType ? node.parameterType.value : null;
        let replacements = [ ];

        for (let i = 0, length = node.ivars.length; i < length; i++) {
            let name = node.ivars[i].name;
            replacements.push(name + ": " + node.parameterType.value);
        }

        modifier.select(node).replace(replacements.join(", "));
    }

    function handleNSPropertyDirective(node)
    {
        let name = node.id.name;
        let type = transformType(node.id.annotation.value);

        modifier.select(node.id).replace(name + ": " + type);
    }        

    traverser.traverse(function(node, parent) {
        let type = node.type;

        try {
            if (type === Syntax.NSClassImplementation) {
                handleNSClassImplementation(node);

            } else if (type === Syntax.NSInstanceVariableDeclaration) {
                handleNSInstanceVariableDeclaration(node);

            } else if (type === Syntax.NSPropertyDirective) {
                handleNSPropertyDirective(node);
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
