### FlatBuffers-Benchmarks

My goal for this repo is to be a go to repo for benchmarks of flatbuffers.  I am
currently focusing purely on Node as its my primary dev platform for the last couple
of years.

### Benchmarks for Node

To get started run the following:

```bash
npm i
```

Once npm has been installed its easy to run any of the tests.

#### TCP tests

As of writing this readme there is only 1 tcp test.  Transfering `Lolomo`'s\* back
and forth between a client and server.  The client and server will mutate the `Lolomo`'s
`runningTime` based on `src/node/programArgs` default value or the arguments passed in.

##### JSON Test

```bash
// In one tab, you can run in background, but I like mine in foreground.
time node src/node/perf/tcp/lolomo/server.js

// In another tab
time node src/node/perf/tcp/lolomo/client.js
```

This will run the test with 300 operations (`--opsCount` argument to define a different value).
On my Macbook air this takes 13+ seconds to complete.  There is no `console.log`ing that happens other than the computed `programArgs`.

##### Flatbuffers test

Running the flatbuffer version is practically the same.


```bash
node src/node/perf/tcp/lolomo/server.js --isJSON=false

...

node src/node/perf/tcp/lolomo/client.js --isJSON=false
```

### Contribution

Please do!


### *

\* - `Lolomo` I define that better on my blog about flatbuffers: [How to Flatbuffers](http://michaelbpaulson.github.io/flatbuffers/how-to-flatbuffers)
