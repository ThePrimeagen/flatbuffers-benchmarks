'use strict';

const Transform = require('stream').Transform;
const inherits = require('util').inherits;

// BIG pool size.
Buffer.poolSize = 1048576;

const FramingStream = function _FramingStream() {
    this._buf = null;
    this._len = 0;
    this._totalLength = 0;
    
    Transform.call(this);
};

module.exports = FramingStream;

inherits(FramingStream, Transform);

FramingStream.prototype._transform = function _transform(chunk, enc, cb) {

    // If there is a partial length floating around, prepend it and then
    // start the aggregator algo.
    // start = 0 in this situation.
    if (this._lenPartial) {
        chunk = Buffer.concat([this._lenPartial, chunk]);
        this._lenPartial = null;
    }

    // auto assumes that the first 32 bits is an unsigned int.
    let frameMark = 0;
    const chunkLength = chunk.length;

    console.log('chunk');
    
    // Why a doWhile?  Because they are awesome.
    do {
        console.log('chunk#start', frameMark, chunk.length);
        
        // Buf is empty, therefore there is no previous results.
        // Therefore, we must initialize our aggregator.
        if (this._buf === null) {
            frameMark = this._initializeAggregator(chunk, frameMark);
            if (frameMark === null) {
                console.log('case frameMark#NULL');
                break;
            }
            console.log('frameMark', frameMark);
        }
        

        const remainingLength = chunkLength - frameMark;
        console.log('chunk#start-remainingLength', remainingLength, this._len, this._totalLength);

        // We must frame this stream with the next incoming data.
        if (this._totalLength > this._len + remainingLength && remainingLength) {
            console.log('case1', chunk.slice(frameMark).toString());
            
            this._bufs.push(chunk);
            this._bufs.push(frameMark);
            this._len += remainingLength;
            
            frameMark += remainingLength;
        }

        // What remains in this chunk is the data we expect.
        else if (this._totalLength === this._len + remainingLength) {
            console.log('case2');
            
            // Pass the remaining data to the next item.
            const data = this._aggregate(chunk, frameMark);
            
            this.push(data);
            this._buf = null;
            
            frameMark += remainingLength;
        }

        // There is more than one message in this chunk.
        else if (remainingLength) {
            console.log('case3');
            const endIndex = frameMark + (this._totalLength - this._len);
            const aggregatedData = this._aggregate(chunk, frameMark, endIndex);
            
            this.push(aggregatedData);
            this._buf = null;

            frameMark = endIndex;
        }

        console.log('chunk#end', frameMark, chunk.length);
    } while (frameMark < chunk.length);
    
    cb();
};

FramingStream.prototype._initializeAggregator = function _initAgg(chunk, start) {
    
    // Edge case, we cannot read the integer
    if (chunk.length - start < 4 && !this._lenPartial) {
        this._lenPartial = chunk.slice(start);
        return null;
    }
    
    this._totalLength = chunk.readUInt32LE(start);
    this._len = 0;
    
    // Preallocate the whole buffer at once.  Store an array bufs then splice
    // them into the overall buffer.
    this._buf = true;
    this._bufs = [];
    return start + 4;
};

/**
 * This is the sauce of the algorithm.  
 * @param buf
 * @private
 */
FramingStream.prototype._aggregate = function _aggregate(chunk, startIndex, endIndex) {
    endIndex = endIndex || chunk.length;

    // copy messages 
    const bufs = this._bufs;
    const chunkSliceLength = endIndex - startIndex;
    let buf = null;
    
    // only alloc the buf if needed.
    if (bufs.length > 0) {
        buf = Buffer.allocUnsafe(this._totalLength);
    }

    console.log('Bufs', bufs);
    // Base case, the chunk is the message.
    if (bufs.length === 0) {
        if (startIndex === 0 && endIndex === chunk.length) {
            return chunk;
        }
        return chunk.slice(startIndex, endIndex);
    }

    // Add all previous bufs to the beginning.
    let idx = 0;
    console.log('bufs.length', bufs.length);
    for (let i = 0; i < bufs.length; i += 2) {
        const b = bufs[i];
        const bStartIndex = bufs[i + 1];

        console.log('copy(', b, ', ', idx, ', ', bStartIndex, ')');
        console.log('contents', b.slice(startIndex).toString());
        b.copy(buf, idx, bStartIndex);

        idx += b.length - bStartIndex;
    }

    console.log('buf.before', buf.toString(), idx, startIndex, endIndex);
    console.log('chunk', chunk.slice(startIndex, endIndex).toString());
    console.log('bytes copied', chunk.copy(buf, idx, startIndex, endIndex));
    console.log('buf.after', buf.toString());
    return buf;
};
