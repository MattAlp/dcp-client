# DCP-Client
This is the official client library for DCP, the Distributed Compute Protocol.  This library allows client applications to communicate with the Scheduler, Bank, and other parts of a DCP network. This library is redistributable and may be included with other programs under the terms of the XXXXXXXX license, provided the library is included its entirety, including the `LICENCE.md` file and this `README.md` file.

# Record of Issue

Date        |  Author          | Change
----------- | ---------------- | ---------------------------------------------
Aug 20 2019 | Wes Garland      | Internal Draft

# Release Notes
This product has not actually been released; ergo `npm i dcp-client` will not actually work. 

# Supported Platforms
The DCP-Client code can be made to run in nearly any JavaScript environment which supports ES5 and XMLHttpRequest.  Our officially-supported platforms are
- NodeJS version 10 (LTS)
- BravoJS, latest version (CommonJS-derived browser environment)
- Vanilla Web - no module system at all

# Installation
The source code for this library is hosted online at https://gitlab.com/Distributed-Compute-Protocol/dcp-client/, and the installation package is available via NPM at https://www.npmjs.com/package/dcp-client.

## Related Products (not implemented)
Other utilities for developers working with DCP via NodeJS can be retrieved via `npm i dcp-sdk`. These utilities include:
- `dcp-job`: list and cancel active jobs
- `mkad`: Manipulate Key/Address Data

## NodeJS
To use DCP from NodeJS, you need to `npm i dcp-client` from your project's source directory, which will update your `package.json`, making this library a dependency of your application.

### BravoJS (not implemented)
To use the DCP Client library with BravoJS, you must make the bundle and the loader visible to your web application.  There are two ways to do this:
1. If you are running `bravojs-npm-gateway`, install it like any other NPM module served by the gateway; e.g. `cd /path/to/gatewayRepo && npm i dcp-client`, or
2. Acquire the dcp-client package and copy the files `dcp-client-bundle.js` and `dcp-client.js` into a directory on your web server that your web clients can access. We recommend using the `dcp/` directory under your document root.

## Vanilla-Web
To use the DCP Client library from a plain vanilla web platform, you must make the bundle and loader visible to your web application. Distributed Compute Labs hosts the latest version of the library at https://cdn.distributed.computer/dcp/.

### Self-Hosted Bundle
To host the bundle on your own server, simply acquire the dcp-client package and copy the files `dcp-client.js` and `dcp-client.css` into a directory on your web server that your web clients can access. We recommend using the `dcp/` directory under your document root.  

## DCP-Client API
While methods of initializing dcp-client vary somewhat from platform to platform or framework to framework, at the end of the initializing, you will have a way to access the key exports of the dcp-client library:
1. `compute` - Compute API; `compute.run`, `compute.for`, etc.
2. `wallet` - Wallet API; used to manipulate data types related to cryptographic authorization, authentication and access control
3. `protocol` - Protocol API; direct access to lower-level details of DCP
4. `dcp-config` - a configuration object which can override various core options, such as the location of a local HTTP proxy; the initial default is downloaded from `protocol://location.of.scheduler/etc/dcp-config`
5. A global symbol, XMLHttpRequest, which understands HTTP, HTTPS, and HTTP-KeepAlive.  This is the native implementation on the browser platforms and polyfilled in NodeJS via the `dcp-xhr` module. The polyfill includes deep network-layer debugging hooks.

### init() - NodeJS, BravoJS 

 From your NodeJS application, you can then invoke `require('dcp-client').init()` or `require('dcp-client').initcb()`, which initializes the dcp-client library.

The `init` function takes zero or more arguments, allowing the developer to create an object which overrides the various DCP defaults; in particular, the location of the scheduler and the name of the code bundle which is executed to provide the APIs.   This object has the same "shape" as the `dcpConfig` export from the library, and this is no coincidence: *any* parameter specified in the configuration will override the same-pathed property provided by the scheduler's configuration object that lives at `etc/dcp-config.js` relative to the scheduler's location.

#### Plain Object
A plain configuration object with the following properties is compatible with the DCP config.js library.
|property path|meaning|default|
|:--|:--|:--|
|scheduler.location|instance of URL which describes the location of your scheduler.|https://scheduler.distributed.computer/|
|autoUpdate|`true` to download the latest version of the webpack bundle and use (eval) that code to implement the protocol which accesses the scheduler, bank, etc. Otherwise, the bundle  which shipped with the dcp-client npm package is used.|`false`|
|bundle.location|an instance of URL or a filename which describes the location of the code bundle, overriding whatever the default location.

#### String
If you pass a string to `init`, it will be treated as a filename; the contents of this file will be evaluated and the result will be used as the configuration object.

**Note:** filenames in this API are resolved relative to the calling module's location; all files are assume to contain UTF-8 text.

#### Object which is an instance of URL
If the first argument object is an instance of URL, the URL will be treated as the location of the scheduler, the second  parameter will be treated as the value of `autoUpdate`, and the third parameter will be treated as the value of `bundle.location`.

#### Local Defaults
In addition to application-specified options, users of NodeJS applications may add a local configuration file to override any baked-in defaults.  This file is located in `~/.dcp/dcp-client/dcp-config.js`, and should contain a JavaScript object literal in the UTF-8 character set.

### Abbreviated Examples
```javascript
/* Use the default scheduler */
let { compute } = require('dcp-client').init()

/* Preferences are stored in my-dcp-config.js */
let { compute } = require('dcp-client').init('my-dcp-config.js')

/* Use an alternate scheduler */
let { compute } = require('dcp-client').init(URL('https://scheduler.distributed.computer'))
```

### Additional Functionality
In addition to exporting the key APIs, when running dcp-client from NodeJS, the following modules are automatically injected into the NodeJS module memo, so that they can be used in `require()` statements:

Module              | Description 
:------------------ | :----------------
dcp/compute         | The Compute API
dcp/wallet          | The Wallet API
dcp/build           | Object containing version information, etc. of the running bundle
dcp/dcp-config      | The running configuration object (result of merging various options to `init()`)
dcp/protocol        | The underlying protocol implementation
dcp/bootstrap-build | Same as dcp/build, but for the version that loaded the running bundle
dcp/dcp-xhr         | An implementation of XMLHttpRequest which understands http, https, and keepalive using the W3C API
dcp/dcp-url         | An implementation of the W3C URL class that also adds a resolve() method like NodeJS's implementation
dcp/serialize       | A space-efficient serialization library which understands recursive object graphs, Typed Arrays, sparse Arrays, and more.

# Working with DCP-Client
## examples/bravojs
The examples in this directory shows how to use DCP from a web page using the BravoJS module system and no special web server. The usage is virtually identical to NodeJS, except that your web page must include a *main module* which is a SCRIPT tag with a `module.declare` declaration.

###  Abbreviated Examples
```javascript
<SCRIPT src="/path/to/bravojs/bravo.js"></SCRIPT>
<SCRIPT src="/path/to/dcp-client/bravojs-shim.js"></SCRIPT>
<SCRIPT>
module.declare(["dcp-client/index"], function(require, exports, module) {
  /* Use the default scheduler */
  let { compute } = require('dcp-client').init()
  compute.for(....)
})
</SCRIPT>
```

## examples/vanilla-web
The example in this directory shows how to use DCP from a web page with no module system at all. Configuration is performed by loading a dcp-config file from your preferred scheduler, overriding options in the global `dcpConfig` as needed, and then loading the dcp-client.js bundle, which immediately initializes the API.  DCP libraries are exported via the global symbol `dcp`, since there is no module system in this environment.

```javascript
const { compute } = dcp
let job = compute.for(...)
let results = await job.exec(compute.marketValue)
console.log(results)
```
```javascript
<!-- use an alternate scheduler -->
<SCRIPT id='dcp-client' src="/path/dcp-client/index.js" scheduler="https://myscheduler.com/"></SCRIPT>
```

# Executing Jobs

At its core, a job can be thought of as an input set, an a Work function; executing a job yields an output set. 

Jobs (job handles) are generally created with the `compute.for` function, which is described in detail in the Compute API documentation. To execute the job, we invoke the `exec()` method of the job handle.

An input set can be described with arguments to `compute.for()` with RangeObject notation, or passed directly .as an enumerable object (such as an array or function* generator).

### Examples
run Work on the whole numbers between 1 and 10:
```javascript 
job = compute.for(1, 10, Work)
```
run Work on the numbers 3, 6, 9, 12, 15:
```javascript 
job = compute.for(6, 16, 3, Work)
```

run Work on the colours red, green, and blue:
```javascript if you want to see where I'm going in terms of near-term deliverabl
job = compute.for(["red", "green" "blue"], Work)
```

### Limitations to Consider
The Work function must be either a string, or stringifyable via `toString()`.  This means that native functions (i.e. Node functions written in C++) cannot be used for Work.   Additionally, the function must be completely defined and not a closure, since stringification cannot take the closure environment into account. A rule of thumb is that if you cannot `eval()` it, you cannot distribute it.

# Glossary

<!-- TITLE: Glossary -->
<!-- SUBTITLE: Official definitions of DCP-related terminology -->

## Entities

### Scheduler
A NodeJS daemon which
* receives work functions and data sets from Compute API
* slices data into smaller sets
* transmits work and data points to Worker
* determines cost of work and instructs the Bank to distribute funds between entities accordingly
* ensures that all tasks eventually complete, provided appropriate financial and computation resources can be deployed in furtherance of this goal

### Bank
A NodeJS daemon which
* manages a ledger for DCC which are not on the blockchain
* enables the movement of DCC between entities requesting work and entities performing work
* enables the movement of DCC between the ledger and the blockchain
* enables the placement of DCC in escrow on behalf of the Scheduler for work which is anticipated to be done

### Portal
A user-facing web application which allows or enables
* creation and management of user accounts
* management of bank accounts (ledgers)
* transfer of DCC between bank accounts
* transfer of DCC to and from the blockchain
* execution of the browser-based Worker

### Worker
A JavaScript program which includes a Supervisor and one or more Sandboxes
* performs computations
* retrieves work and data points from Scheduler
* retrieves work dependencies from Package Server
* returns results and cost metrics to Scheduler
* Specific instances of Worker include
  - a browser-based Worker
  - a standalone Worker operating on Google's v8 engine

### Sandbox
A component of a Worker, used to execute arbitrary JavaScript code in a secure environment.  Currently implemented by the DistributedWorker class (whose name will change some day).  Generally speaking, we use one Sandbox per CPU core, although we might use more in order to work around system scheduler deficiencies, network overhead, etc.   Sandboxes in the web browser are implemented using window.Worker().

### Supervisor
The component of a Worker which communicates with the Scheduler and Sandboxen.

## Concepts
### Job
The collection consisting of an input set, Work Function and result setup.  Referred to in early versions of the Compute API (incorrectly) as a Generator.

### Slice
A unit of work, represented as source code plus data and meta data, which has a single entry point and return type.  Each Slice in a Job corresponds to exactly one element in the Job's input set.

### Task
A unit of work which is composed of one or more slices, which can be executed by a single worker.  Each Slice of each Task will be from the same Job.

### Work or Work Function
A function which is executed once per Slice for a given Job, accepting the input datum and returning a result which is added to the result set.

### Module
A unit of source code which can be used by, but addressed independently of, a Work Function. Compute API modules are similar to CommonJS modules.

### Package
A group of related modules

### Distributed Computer
A parallel supercomputer consisting of one or more schedulers and workers.  When used as a proper noun, the distributed computer being discussed is the one hosted at https://portal.distributed.computer/

### Bank Account
A ledger which acts a repository for DCC which is not on the block chain.  The Bank can move DCC between Bank Accounts much more quickly than it can move DCC between Addresses on the Ethereum block chain network.  Meta data attached to bank accounts can restrict certain operations, such as ear-marking funds for use only by job deployment.

### Address
A unique identifier in DCP which can be used as a Bank Account identifier (account number) or Address on the Ethereum network.

### Wallet
In the general (blockchain) sense, a wallet is a piece of software that allows the user to interact with the greater economy as a whole.  So as your actual wallet in your pocket has your cash and credit cards and you access your wallet in order to make a purchase and keep records (by pulling out  cash or cards, and stuffing receipts back in), a blockchain wallet performs a similar function in that it gives you a place to store your private keys (your money), it provides a balance of what all those moneys add up to, it provides a way to receive moneys and send moneys, and provides a record of all those sends and receives. Most blockchain wallets provide at least 3 basic functions
1. generate and stores your public/private key pairs
2. allow you to use those key pairs through transactions (allows you to craft and transmit transactions to the peers)
3. keep a record of the transactions

Additionally, most of the current crypto wallets (such as Bitcoin core) provide blockchain validation and consensus functions in that they can act to create or validate new blocks to the chain in addition to creating or validating transactions.

#### Distributed.Computer Wallet
The Distributed.Computer acts as a Wallet; the platform exposes Wallet-related functionality both via software APIs and the portal web site.
 - Public/private key pairs are generated via the portal, wallet API, and command-line utilities
 - Public/private key pairs are stored in the database as passphrase-protected Keystores
 - Public/private key pairs stored in the Distributed.Computer Wallet can be retrieved via the portal webite

### Keystore
A data structure which stores an encrypted key pair (address + private key). Generally speaking, the keystore will be encrypted with a passphrase.

### Keystore File
A file which stores a JSON-encoded Keystore.

# APIs
### Compute API
* provides a JavaScript interface to software developers, allowing them to describe data sets and work functions for transmission to the Scheduler

### Keystore API
* provides a JavaScript interface to software developers for the management of Addresses, Wallets, and Keystores

### Protocol API
* provides a JavaScript interface to software developers and the Compute API which enables the transmission of data and work functions between
   - the scheduler and the worker
   - the scheduler and the bank
   - other entities as necessary
* provides a JavaScript interface to software developers and other software components for the cryptographic operations needed by the protocol
<!--stackedit_data:
eyJoaXN0b3J5IjpbMTI5MTc1MTQ3NCwyOTYwNzU2NzEsMjAwNT
E1MDY2LDczMDAyNTc2NywtODA0NDk5ODkyLC0xMzE0Njg4MzEw
LDU3OTE3NDMyMSwtNjMwNDU3MzIxLDkzMTQ1OTA4NCw2MDczNT
Y5MDEsMTExOTMxNTYzLDEzMjY3NjgwODcsLTEzNTUwMDk2NjVd
fQ==
-->