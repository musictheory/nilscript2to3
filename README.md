# nilscript2to3

nilscript2to3 is a tool to help migrate oj/NilScript 2.x files to NilScript 3.

Migration:

1) Rename all files with an `.oj` extension to use a `.ns` extension

```sh
find . -name '*.oj' -exec sh -c 'mv "$0" "${0%.oj}.ns"' {} \;
```

2) Run `nilscript2to3 --warn` on all `.ns` files.
This will show a subset of issues which will cause a parse error in NilScript 3.

3) Run `nilscript2to3 --rewrite` on all `.ns` files.
This rewrites `@implementation`, `@property`, and protocol types into their new format.

4) Find and replace the following in your build scripts:

| Find | Replace | Context |
|-|-|-|
| `.oj` | `.ns` | File extensions
| `ojc` | `nsc` | References to the compiler binary
| `ojc` | `nilscript` References to the npm package
| `oj` | `nilscript` |  The public API global variable (`oj.isObject()`)
| `$oj_oj` | `N$_nilscript` | The global variable used by the compiler

5) Find any replace any usage of the following in your symbolication/crash reporting scripts:

?????





## Warnings

* Warns on use of `@forward` directive
* Warns on use of `@squeeze` directive
* Warns on use of the following types: `double`, `float`, `int`, `char`, `short`, `long`, `Bool`, `bool`
* Warns when a class, protocol, or `@type` use the same name

## Transformations

*) Rewrites `id<TheProtocol>` type annotations into `TheProtocol`
*) Rewrites `@property TheType theProperty` into `@property theProperty : TheType`
*) Rewrites `@implementation TheClass`  into  `@class TheClass`


---
## <a name="license"></a>License

[MIT license](http://github.com/musictheory/nilscript2to3/raw/master/LICENSE.MIT).

