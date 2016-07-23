# fb-node-hello
This started off as a simple project to test serialization of JSON vs flatbuffers.  Then I went a little overboard.

### Start a server
First start your server.  The server and client do the same thing except for the
client terminates after MAX_COUNT attempts (which defaults to 50,000).

```bash
# for flatbuffer server.  There are a lot env variables you can use to
# listen different ports / host.
./server_fbs.sh

# For json instead
./server_json.sh
```

### Start the client
Then start a client like so.

```bash
# Samesies with env variables above except for these two included.
./client_fbs.sh <HI_COUNT> <PERCENT_MUTATION>
```

`HI_COUNT` will be the amount of `Hi`s in the `Hellos`'s env.  
`PERCENT_MUTATION` is the amount of `Hi`s that will be mutated per request or response.


### Contribution
Feel free to contribute!
