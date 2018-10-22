# nilscript2to3

nilscript2to3 is a tool to help migrate oj/NilScript 2.x files to NilScript 3.

## Migration Steps

1) Rename all files with an `.oj` extension to use a `.ns` extension

```
find . -name '*.oj' -exec sh -c 'mv "$0" "${0%.oj}.ns"' {} \;
```

2) Run `nilscript2to3 --check` on all `.ns` files:

```
find . -name '*.ns' -exec path/to/nilscript2to3 --check {} \;
```

This will check the files and print warnings for a subset of issues which cause parse error in NilScript 3:

* The use of `@forward` directive
* The use of `@squeeze` directive
* The use of the following types: `double`, `float`, `int`, `char`, `short`, `long`, `Bool`, `bool`
* A naming conflict between/among a class, protocol, and/or `@type`

3) Run `nilscript2to3 --rewrite` on all `.ns` files.

```
find . -name '*.ns' -rewrite path/to/nilscript2to3 --check {} \;
```

This performs the following:

* Rewrites `id<TheProtocol>` type annotations into `TheProtocol`
* Rewrites `@property TheType theProperty` into `@property theProperty : TheType`
* Rewrites `@implementation TheClass`  into  `@class TheClass`
 `@implementation`, `@property`, and protocol types into their new format.


4) Find and replace the following in your build scripts:

| Find | Replace | Notes |
|-|-|-|
| `.oj` | `.ns` | File extensions
| `ojc` | `nsc` | References to the compiler binary
| `ojc` | `nilscript` References to the npm package
| `oj` | `nilscript` |  The public API global variable (`oj.isObject()`)
| `$oj_oj` | `N$_nilscript` | The global variable used by the compiler

5) Find any replace any usage of the following in your symbolication/crash reporting scripts:

?????

---
## <a name="license"></a>License

[MIT license](http://github.com/musictheory/nilscript2to3/raw/master/LICENSE.MIT).

