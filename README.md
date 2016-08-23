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

There is one extensive TCP test.  To run the test you must start 3 separte servers.

First start the lolomo server
```bash
> node src/node/perf/tcp/test/run-lolomo-as-a-service.js --port=33334
```

Second start the ratings server
```bash
> node src/node/perf/tcp/test/run-ratings-as-a-service.js --port=33335
```

Lastly, start the lolomo aggregation server
```bash
# Defaults
# --host==127.0.0.1
# --port==33333
# --lolomoHost==127.0.0.1
# --lolomoPort==33334
# --ratingsHost==127.0.0.1
# --ratingsPort==33335
> node src/node/perf/tcp/test/run-lolomo-ratings-aggregation-as-a-service.js --host=0.0.0.0
```

Override whats necessary to run on multiple machines.  `--host=0.0.0.0` is required for
restify to respond network requests.

### Contribution

Please do!


### *

\* - `Lolomo` I define that better on my blog about flatbuffers: [How to Flatbuffers](http://michaelbpaulson.github.io/flatbuffers/how-to-flatbuffers)
