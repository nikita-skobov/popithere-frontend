// ( function( window ) { 'use strict';

// // Stream
// /**
//  * @constructor
//  */
// // Make compiler happy.
// var Stream = function (data) {
//   this.data = data;
//   this.len = this.data.length;
//   this.pos = 0;
// };

// Stream.prototype.readByte = function () {
//   if (this.pos >= this.data.length) {
//     throw new Error('Attempted to read past end of stream.');
//   }
//   return this.data.charCodeAt(this.pos++) & 0xFF;
// };

// Stream.prototype.readBytes = function (n) {
//   var bytes = [];
//   for (var i = 0; i < n; i++) {
//     bytes.push(this.readByte());
//   }
//   return bytes;
// };

// Stream.prototype.read = function (n) {
//   var s = '';
//   for (var i = 0; i < n; i++) {
//     s += String.fromCharCode(this.readByte());
//   }
//   return s;
// };

// Stream.prototype.readUnsigned = function () { // Little-endian.
//   var a = this.readBytes(2);
//   return (a[1] << 8) + a[0];
// };

// var SuperGIF = window.SuperGIF = window.SuperGIF || {};
// SuperGIF.Stream = Stream;

// })( window );

// /*
//   SuperGif

//   Example usage:

//     <img src="example1_preview.gif" data-animated-src="example1.gif" />

//     <script type="text/javascript">
//       $$('img').each(function (img_tag) {
//         if (/.*\.gif/.test(img_tag.src)) {
//           var rub = new SuperGif({ gif: img_tag } );
//           rub.load();
//         }
//       });
//     </script>

//   Image tag attributes:

//     data-animated-src - If this url is specified, it's loaded into the player instead of src.
//               This allows a preview frame to be shown until animated gif data is streamed into the canvas

//   Constructor options args

//     gif         Required. The DOM element of an img tag.

//   Instance methods

//     // loading
//     load( callback )  Loads the gif into a canvas element and then calls callback if one is passed

//     For additional customization (viewport inside iframe) these params may be passed:
//     c_w, c_h - width and height of canvas
//     vp_t, vp_l, vp_ w, vp_h - top, left, width and height of the viewport

//     A bonus: few articles to understand what is going on
//       http://enthusiasms.org/post/16976438906
//       http://www.matthewflickinger.com/lab/whatsinagif/bits_and_bytes.asp
//       http://humpy77.deviantart.com/journal/Frame-Delay-Times-for-Animated-GIFs-214150546

// */

// ( function( window ) { 'use strict';

// // Generic functions
// var bitsToNum = function (ba) {
//   return ba.reduce(function (s, n) {
//     return s * 2 + n;
//   }, 0);
// };

// var byteToBitArr = function (bite) {
//   var a = [];
//   for (var i = 7; i >= 0; i--) {
//     a.push( !! (bite & (1 << i)));
//   }
//   return a;
// };

// // Stream
// /**
//  * @constructor
//  */
// // Make compiler happy.
// var Stream = function (data) {
//   console.log('inside stream')
//   console.log(data)
//   this.data = data;
//   this.len = this.data.length;
//   this.pos = 0;

//   this.readByte = function () {
//     if (this.pos >= this.data.length) {
//       throw new Error('Attempted to read past end of stream.');
//     }
//     return data.charCodeAt(this.pos++) & 0xFF;
//   };

//   this.readBytes = function (n) {
//     var bytes = [];
//     for (var i = 0; i < n; i++) {
//       bytes.push(this.readByte());
//     }
//     return bytes;
//   };

//   this.read = function (n) {
//     var s = '';
//     for (var i = 0; i < n; i++) {
//       s += String.fromCharCode(this.readByte());
//     }
//     return s;
//   };

//   this.readUnsigned = function () { // Little-endian.
//     var a = this.readBytes(2);
//     return (a[1] << 8) + a[0];
//   };
// };

// var lzwDecode = function (minCodeSize, data) {
//   // TODO: Now that the GIF parser is a bit different, maybe this should get an array of bytes instead of a String?
//   var pos = 0; // Maybe this streaming thing should be merged with the Stream?
//   var readCode = function (size) {
//     var code = 0;
//     for (var i = 0; i < size; i++) {
//       if (data.charCodeAt(pos >> 3) & (1 << (pos & 7))) {
//         code |= 1 << i;
//       }
//       pos++;
//     }
//     return code;
//   };

//   var output = [];

//   var clearCode = 1 << minCodeSize;
//   var eoiCode = clearCode + 1;

//   var codeSize = minCodeSize + 1;

//   var dict = [];

//   var clear = function () {
//     dict = [];
//     codeSize = minCodeSize + 1;
//     for (var i = 0; i < clearCode; i++) {
//       dict[i] = [i];
//     }
//     dict[clearCode] = [];
//     dict[eoiCode] = null;

//   };

//   var code;
//   var last;

//   while (true) {
//     last = code;
//     code = readCode(codeSize);

//     if (code === clearCode) {
//       clear();
//       continue;
//     }
//     if (code === eoiCode) break;

//     if (code < dict.length) {
//       if (last !== clearCode) {
//         dict.push(dict[last].concat(dict[code][0]));
//       }
//     }
//     else {
//       if (code !== dict.length) throw new Error('Invalid LZW code.');
//       dict.push(dict[last].concat(dict[last][0]));
//     }
//     output.push.apply(output, dict[code]);

//     if (dict.length === (1 << codeSize) && codeSize < 12) {
//       // If we're at the last code and codeSize is 12, the next code will be a clearCode, and it'll be 12 bits long.
//       codeSize++;
//     }
//   }

//   // I don't know if this is technically an error, but some GIFs do it.
//   //if (Math.ceil(pos / 8) !== data.length) throw new Error('Extraneous LZW bytes.');
//   return output;
// };


// // The actual parsing; returns an object with properties.
// var parseGIF = function (st, handler) {
//   handler || (handler = {});

//   // LZW (GIF-specific)
//   var parseCT = function (entries) { // Each entry is 3 bytes, for RGB.
//     var ct = [];
//     for (var i = 0; i < entries; i++) {
//       ct.push(st.readBytes(3));
//     }
//     return ct;
//   };

//   var readSubBlocks = function () {
//     var size, data;
//     data = '';
//     do {
//       size = st.readByte();
//       data += st.read(size);
//     } while (size !== 0);
//     return data;
//   };

//   var parseHeader = function () {
//     var hdr = {};
//     hdr.sig = st.read(3);
//     hdr.ver = st.read(3);
//     if (hdr.sig !== 'GIF') {
//       handler.onError(); // XXX: This should probably be handled more nicely.
//       throw new Error('Not a GIF file.');
//     }
//     hdr.width = st.readUnsigned();
//     hdr.height = st.readUnsigned();

//     var bits = byteToBitArr(st.readByte());
//     hdr.gctFlag = bits.shift();
//     hdr.colorRes = bitsToNum(bits.splice(0, 3));
//     hdr.sorted = bits.shift();
//     hdr.gctSize = bitsToNum(bits.splice(0, 3));

//     hdr.bgColor = st.readByte();
//     hdr.pixelAspectRatio = st.readByte(); // if not 0, aspectRatio = (pixelAspectRatio + 15) / 64
//     if (hdr.gctFlag) {
//       hdr.gct = parseCT(1 << (hdr.gctSize + 1));
//     }
//     handler.hdr && handler.hdr(hdr);
//   };

//   var parseExt = function (block) {
//     console.log('parsing ext')
//     var parseGCExt = function (block) {
//       var blockSize = st.readByte(); // Always 4
//       var bits = byteToBitArr(st.readByte());
//       block.reserved = bits.splice(0, 3); // Reserved; should be 000.
//       block.disposalMethod = bitsToNum(bits.splice(0, 3));
//       block.userInput = bits.shift();
//       block.transparencyGiven = bits.shift();

//       block.delayTime = st.readUnsigned();

//       block.transparencyIndex = st.readByte();

//       block.terminator = st.readByte();

//       handler.gce && handler.gce(block);
//     };

//     var parseComExt = function (block) {
//       block.comment = readSubBlocks();
//       handler.com && handler.com(block);
//     };

//     var parsePTExt = function (block) {
//       // No one *ever* uses this. If you use it, deal with parsing it yourself.
//       var blockSize = st.readByte(); // Always 12
//       block.ptHeader = st.readBytes(12);
//       block.ptData = readSubBlocks();
//       handler.pte && handler.pte(block);
//     };

//     var parseAppExt = function (block) {
//       var parseNetscapeExt = function (block) {
//         var blockSize = st.readByte(); // Always 3
//         block.unknown = st.readByte(); // ??? Always 1? What is this?
//         block.iterations = st.readUnsigned();
//         block.terminator = st.readByte();
//         handler.app && handler.app.NETSCAPE && handler.app.NETSCAPE(block);
//       };

//       var parseUnknownAppExt = function (block) {
//         block.appData = readSubBlocks();
//         // FIXME: This won't work if a handler wants to match on any identifier.
//         handler.app && handler.app[block.identifier] && handler.app[block.identifier](block);
//       };

//       var blockSize = st.readByte(); // Always 11
//       block.identifier = st.read(8);
//       block.authCode = st.read(3);
//       switch (block.identifier) {
//       case 'NETSCAPE':
//         parseNetscapeExt(block);
//         break;
//       default:
//         parseUnknownAppExt(block);
//         break;
//       }
//     };

//     var parseUnknownExt = function (block) {
//       block.data = readSubBlocks();
//       handler.unknown && handler.unknown(block);
//     };

//     block.label = st.readByte();
//     switch (block.label) {
//     case 0xF9:
//       block.extType = 'gce';
//       parseGCExt(block);
//       break;
//     case 0xFE:
//       block.extType = 'com';
//       parseComExt(block);
//       break;
//     case 0x01:
//       block.extType = 'pte';
//       parsePTExt(block);
//       break;
//     case 0xFF:
//       block.extType = 'app';
//       parseAppExt(block);
//       break;
//     default:
//       block.extType = 'unknown';
//       parseUnknownExt(block);
//       break;
//     }
//   };

//   var parseImg = function (img) {
//     console.log('parsing img')
//     var deinterlace = function (pixels, width) {
//       // Of course this defeats the purpose of interlacing. And it's *probably*
//       // the least efficient way it's ever been implemented. But nevertheless...
//       var newPixels = new Array(pixels.length);
//       var rows = pixels.length / width;
//       var cpRow = function (toRow, fromRow) {
//         var fromPixels = pixels.slice(fromRow * width, (fromRow + 1) * width);
//         newPixels.splice.apply(newPixels, [toRow * width, width].concat(fromPixels));
//       };

//       // See appendix E.
//       var offsets = [0, 4, 2, 1];
//       var steps = [8, 8, 4, 2];

//       var fromRow = 0;
//       for (var pass = 0; pass < 4; pass++) {
//         for (var toRow = offsets[pass]; toRow < rows; toRow += steps[pass]) {
//           cpRow(toRow, fromRow)
//           fromRow++;
//         }
//       }

//       return newPixels;
//     };

//     img.leftPos = st.readUnsigned();
//     img.topPos = st.readUnsigned();
//     img.width = st.readUnsigned();
//     img.height = st.readUnsigned();

//     var bits = byteToBitArr(st.readByte());
//     img.lctFlag = bits.shift();
//     img.interlaced = bits.shift();
//     img.sorted = bits.shift();
//     img.reserved = bits.splice(0, 2);
//     img.lctSize = bitsToNum(bits.splice(0, 3));

//     if (img.lctFlag) {
//       img.lct = parseCT(1 << (img.lctSize + 1));
//     }

//     img.lzwMinCodeSize = st.readByte();

//     var lzwData = readSubBlocks();

//     img.pixels = lzwDecode(img.lzwMinCodeSize, lzwData);

//     if (img.interlaced) { // Move
//       img.pixels = deinterlace(img.pixels, img.width);
//     }

//     handler.img && handler.img(img);
//   };

//   var parseBlock = function () {
//     var block = {};
//     block.sentinel = st.readByte();

//     switch (String.fromCharCode(block.sentinel)) { // For ease of matching
//     case '!':
//       block.type = 'ext';
//       parseExt(block);
//       break;
//     case ',':
//       block.type = 'img';
//       parseImg(block);
//       break;
//     case ';':
//       block.type = 'eof';
//       handler.eof && handler.eof(block);
//       break;
//     default:
//       return handler.onError(new Error('Unknown block: 0x' + block.sentinel.toString(16))); // TODO: Pad this with a 0.
//     }

//     if (block.type !== 'eof') {
//       setTimeout(parseBlock, 0);
//     }
//   };

//   var parse = function () {
//     parseHeader();
//     setTimeout(parseBlock, 0);
//   };

//   parse();
// };


// var SuperGif = function ( opts ) {
//   var options = {
//     //viewport position
//     vp_l: 0,
//     vp_t: 0,
//     vp_w: null,
//     vp_h: null,
//     //canvas sizes
//     c_w: null,
//     c_h: null
//   };
//   for (var i in opts ) { options[i] = opts[i] }
//   if (options.vp_w && options.vp_h) options.is_vp = true;

//   var stream;
//   var hdr;

//   var loadError = null;
//   var loading = false;

//   var transparency = null;
//   var delay = null;
//   var disposalMethod = null;
//   var disposalRestoreFromIdx = 0;
//   var lastDisposalMethod = null;
//   var frame = null;
//   var lastImg = null;

//   var frames = [];

//   var gif = options.gif;

//   var clear = function () {
//     transparency = null;
//     delay = null;
//     lastDisposalMethod = disposalMethod;
//     disposalMethod = null;
//     frame = null;
//   };

//   // XXX: There's probably a better way to handle catching exceptions when
//   // callbacks are involved.
//   var doParse = function () {
//     try {
//       parseGIF(stream, handler);
//     }
//     catch (err) {
//       doLoadError('parse');
//     }
//   };

//   var setSizes = function(w, h) {
//     tmpCanvas.width = w;
//     tmpCanvas.height = h;
//     tmpCanvas.getContext('2d').setTransform(1, 0, 0, 1, 0, 0);
//   }

//   var doLoadError = function (originOfError) {


//     loadError = originOfError;
//     hdr = {
//       width: gif.width,
//       height: gif.height
//     }; // Fake header.
//     frames = [];
//   };

//   var doHdr = function (_hdr) {
//     hdr = _hdr;
//     setSizes(hdr.width, hdr.height)
//   };

//   var doGCE = function (gce) {
//     pushFrame();
//     clear();
//     transparency = gce.transparencyGiven ? gce.transparencyIndex : null;
//     delay = gce.delayTime;
//     disposalMethod = gce.disposalMethod;
//     // We don't have much to do with the rest of GCE.
//   };

//   var pushFrame = function () {
//     if (!frame) return;
//     frames.push({
//       data: frame.getImageData(0, 0, hdr.width, hdr.height),
//       delay: delay
//     });
//   };

//   // flag for drawing initial frame
//   var isInitFrameDrawn = false;

//   var doImg = function (img) {
//     if (!frame) frame = tmpCanvas.getContext('2d');

//     var currIdx = frames.length;

//     //ct = color table, gct = global color table
//     var ct = img.lctFlag ? img.lct : hdr.gct; // TODO: What if neither exists?

//     /*
//     Disposal method indicates the way in which the graphic is to
//     be treated after being displayed.

//     Values :    0 - No disposal specified. The decoder is
//             not required to take any action.
//           1 - Do not dispose. The graphic is to be left
//             in place.
//           2 - Restore to background color. The area used by the
//             graphic must be restored to the background color.
//           3 - Restore to previous. The decoder is required to
//             restore the area overwritten by the graphic with
//             what was there prior to rendering the graphic.

//             Importantly, "previous" means the frame state
//             after the last disposal of method 0, 1, or 2.
//     */
//     if (currIdx > 0) {
//       if (lastDisposalMethod === 3) {
//         // Restore to previous
//         frame.putImageData(frames[disposalRestoreFromIdx].data, 0, 0);
//       } else {
//         disposalRestoreFromIdx = currIdx - 1;
//       }

//       if (lastDisposalMethod === 2) {
//         // Restore to background color
//         // Browser implementations historically restore to transparent; we do the same.
//         // http://www.wizards-toolkit.org/discourse-server/viewtopic.php?f=1&t=21172#p86079
//         frame.clearRect(lastImg.leftPos, lastImg.topPos, lastImg.width, lastImg.height);
//       }
//     }
//     // else, Undefined/Do not dispose.
//     // frame contains final pixel data from the last frame; do nothing

//     //Get existing pixels for img region after applying disposal method
//     var imgData = frame.getImageData(img.leftPos, img.topPos, img.width, img.height);
//     //apply color table colors
//     var cdd = imgData.data;
//     img.pixels.forEach(function (pixel, i) {
//       // imgData.data === [R,G,B,A,R,G,B,A,...]
//       if (pixel !== transparency) {
//         cdd[i * 4 + 0] = ct[pixel][0];
//         cdd[i * 4 + 1] = ct[pixel][1];
//         cdd[i * 4 + 2] = ct[pixel][2];
//         cdd[i * 4 + 3] = 255; // Opaque.
//       }
//     });

//     frame.putImageData(imgData, img.leftPos, img.topPos);

//     lastImg = img;
//   };

//   var doNothing = function () {};
//   /**
//    * @param{boolean=} draw Whether to draw progress bar or not; this is not idempotent because of translucency.
//    *                       Note that this means that the text will be unsynchronized with the progress bar on non-frames;
//    *                       but those are typically so small (GCE etc.) that it doesn't really matter. TODO: Do this properly.
//    */
//   var handler = {
//     hdr: doHdr,
//     gce: doGCE,
//     // I guess that's all for now.
//     // app: {
//     //  // TODO: Is there much point in actually supporting iterations?
//     //  NETSCAPE: withProgress(doNothing)
//     // },
//     img: doImg,
//     eof: function (block) {
//       pushFrame();
//       loading = false;
//       if (load_callback) {
//         load_callback();
//       }
//     },

//     onError : function (error) {
//       if (error_callback) {
//         error_callback();
//       }
//     }
//   };

//   var load_callback = false;
//   var step_callback = false;
//   var error_callback = false;
//   var tmpCanvas = document.createElement('canvas');

//   return {

//     load: function (callback) {
//       console.log('loading?')
//       load_callback = callback.success;
//       step_callback = callback.step;
//       error_callback = callback.error;

//       loading = true;

//       if (gif.src.indexOf('data:') !== -1) {
//         console.log('has data')
//         var data = gif.src.substring(gif.src.indexOf(',')+1);
//         stream = new Stream(window.atob(data));
//         doParse();
//       } else {
//         console.log('making xmlhttp req')
//         var h = new XMLHttpRequest();
//         h.overrideMimeType('text/plain; charset=x-user-defined');
//         h.onload = function(e) {
//           stream = new Stream(h.responseText);
//           setTimeout(doParse, 0);
//         };
//         h.onerror = function() { doLoadError('xhr'); };
//         h.open('GET', gif.getAttribute('data-animated-src') || gif.src, true);
//         h.send();
//       }
//     },

//     getFrames : function () {
//       return frames;
//     }
//   };
// };


// window.SuperGif = SuperGif;

// })( window );


(function stfuEslintThisFunctionDoesNotNeedAName(w) {
  const mySuperGif = {}

  // Generic functions
  var bitsToNum = function (ba) {
    return ba.reduce(function (s, n) {
      return s * 2 + n
    }, 0)
  }

  var byteToBitArr = function (bite) {
    var a = []
    for (var i = 7; i >= 0; i--) {
      a.push( !! (bite & (1 << i)))
    }
    return a
  }

  // LZW (GIF-specific)
  var parseCT = function (entries, st) { // Each entry is 3 bytes, for RGB.
    var ct = []
    for (var i = 0; i < entries; i++) {
      ct.push(st.readBytes(3))
    }
    return ct
  }
  

  var Stream = function (data) {
    this.data = data
    this.len = this.data.length
    this.pos = 0
  
    this.readByte = function () {
      if (this.pos >= this.data.length) {
        throw new Error('Attempted to read past end of stream.')
      }
      return data.charCodeAt(this.pos++) & 0xFF
    }
  
    this.readBytes = function (n) {
      var bytes = []
      for (var i = 0; i < n; i++) {
        bytes.push(this.readByte())
      }
      return bytes
    }
  
    this.read = function (n) {
      var s = ''
      for (var i = 0; i < n; i++) {
        s += String.fromCharCode(this.readByte())
      }
      return s
    }
  
    this.readUnsigned = function () { // Little-endian.
      var a = this.readBytes(2)
      return (a[1] << 8) + a[0]
    }
  }
  
  function init(opts) {
    const options = {
      // viewport position
      vp_l: 0,
      vp_t: 0,
      vp_w: null,
      vp_h: null,
      // canvas sizes
      c_w: null,
      c_h: null,
    }

    for (var i in opts ) {
      options[i] = opts[i]
    }

    if (options.vp_w && options.vp_h) {
      options.is_vp = true
    }

    let tmpCanvas = document.createElement('canvas')

    const locals = {
      stream: null,
      hdr: null,
      loadError: null,
      loading: false,
      transparency: null,
      delay: null,
      disposalMethod: null,
      disposalRestoreFromIdx: 0,
      lastDisposalMethod: null,
      frame: null,
      lastImg: null,
      frames: [],
      gif: options.gif,
      isInitFrameDrawn: false,
      load_callback: false,
      step_callback: false,
      error_callback: false,
      tmpCanvas,
    }

    return {
      options,
      locals,
    }
  }

  function load(opts) {
    return new Promise((res, rej) => {
      const { gif } = opts.locals
  
      if (gif.src.indexOf('data:') !== -1) {
        var data = gif.src.substring(gif.src.indexOf(',')+1)
        res(new Stream(window.atob(data)))
      } else {
        var h = new XMLHttpRequest()
        h.overrideMimeType('text/plain; charset=x-user-defined')
        h.onload = function() {
          res(new Stream(h.responseText))
        }
        h.onerror = function(e) {
          rej(e)
        }
        h.open('GET', gif.getAttribute('data-animated-src') || gif.src, true)
        h.send()
      }
    })
  }

  function parseHeader(st, opts) {
    let hdr = {}
    hdr.sig = st.read(3)
    hdr.ver = st.read(3)
    if (hdr.sig !== 'GIF') {
      throw new Error('Not a GIF file.')
    }
    hdr.width = st.readUnsigned()
    hdr.height = st.readUnsigned()

    let bits = byteToBitArr(st.readByte())
    hdr.gctFlag = bits.shift()
    hdr.colorRes = bitsToNum(bits.splice(0, 3))
    hdr.sorted = bits.shift()
    hdr.gctSize = bitsToNum(bits.splice(0, 3))

    hdr.bgColor = st.readByte()
    hdr.pixelAspectRatio = st.readByte() // if not 0, aspectRatio = (pixelAspectRatio + 15) / 64
    if (hdr.gctFlag) {
      hdr.gct = parseCT((1 << (hdr.gctSize + 1)), st)
    }

    opts.locals.hdr = hdr
    opts.locals.tmpCanvas.width = hdr.width
    opts.locals.tmpCanvas.height = hdr.height
    opts.locals.tmpCanvas.getContext('2d').setTransform(1, 0, 0, 1, 0, 0)
    return opts
  }

  function parseGCExt(block, st, opts) {
    var blockSize = st.readByte() // Always 4
    var bits = byteToBitArr(st.readByte())
    block.reserved = bits.splice(0, 3) // Reserved; should be 000.
    block.disposalMethod = bitsToNum(bits.splice(0, 3))
    block.userInput = bits.shift()
    block.transparencyGiven = bits.shift()

    block.delayTime = st.readUnsigned()

    block.transparencyIndex = st.readByte()

    block.terminator = st.readByte()

    // push frame
    if (opts.locals.frame) {
      opts.locals.frames.push({
        data: opts.locals.frame.getImageData(0, 0, opts.locals.hdr.width, opts.locals.hdr.height),
        delay: opts.locals.delay,
      })
    }

    // clear
    opts.locals.transparency = null
    opts.locals.delay = null
    opts.locals.lastDisposalMethod = opts.locals.disposalMethod
    opts.locals.disposalMethod = null
    opts.locals.frame = null
    
    // rest of doGCE
    opts.locals.transparency = block.transparencyGiven ? block.transparencyIndex : null
    opts.locals.delay = block.delayTime
    opts.locals.disposalMethod = block.disposalMethod
  }

  function readSubBlocks(st) {
    let size
    let data = ''
    do {
      size = st.readByte()
      data += st.read(size)
    } while (size !== 0)

    return data
  }

  function parseComExt(block, st) {
    block.comment = readSubBlocks(st)
  }

  function parsePTExt(block, st) {
    // No one *ever* uses this. If you use it
    // deal with parsing it yourself.
    var blockSize = st.readByte() // Always 12
    block.ptHeader = st.readBytes(12)
    block.ptData = readSubBlocks(st)
  }

  function parseNetscapeExt(block, st) {
    var blockSize = st.readByte() // Always 3
    block.unknown = st.readByte() // ??? Always 1? What is this?
    block.iterations = st.readUnsigned()
    block.terminator = st.readByte()
    // handler.app && handler.app.NETSCAPE && handler.app.NETSCAPE(block);
  }

  var parseUnknownAppExt = function (block, st) {
    block.appData = readSubBlocks(st)
    // FIXME: This won't work if a handler wants to match on any identifier.
    // handler.app && handler.app[block.identifier] && handler.app[block.identifier](block);
  }

  function parseAppExt(block, st) {
    var blockSize = st.readByte() // Always 11
    block.identifier = st.read(8)
    block.authCode = st.read(3)
    switch (block.identifier) {
    case 'NETSCAPE':
      parseNetscapeExt(block, st)
      break
    default:
      parseUnknownAppExt(block, st)
      break
    }
  }

  function parseUnknownExt(block, st) {
    block.data = readSubBlocks(st)
  }

  function parseExt(block, st, opts) {
    block.label = st.readByte()
    switch (block.label) {
      case 0xF9:
        block.extType = 'gce'
        parseGCExt(block, st, opts)
        break
      case 0xFE:
        block.extType = 'com'
        parseComExt(block, st)
        break
      case 0x01:
        block.extType = 'pte'
        parsePTExt(block, st)
        break
      case 0xFF:
        block.extType = 'app'
        parseAppExt(block, st)
        break
      default:
        block.extType = 'unknown'
        parseUnknownExt(block, st)
        break
    }
  }

  function lzwDecode(minCodeSize, data) {
    // TODO: Now that the GIF parser is a bit different, maybe this should get an array of bytes instead of a String?
    var pos = 0; // Maybe this streaming thing should be merged with the Stream?
    var readCode = function (size) {
      var code = 0;
      for (var i = 0; i < size; i++) {
        if (data.charCodeAt(pos >> 3) & (1 << (pos & 7))) {
          code |= 1 << i;
        }
        pos++;
      }
      return code;
    };
  
    var output = [];
  
    var clearCode = 1 << minCodeSize;
    var eoiCode = clearCode + 1;
  
    var codeSize = minCodeSize + 1;
  
    var dict = [];
  
    var clear = function () {
      dict = [];
      codeSize = minCodeSize + 1;
      for (var i = 0; i < clearCode; i++) {
        dict[i] = [i];
      }
      dict[clearCode] = [];
      dict[eoiCode] = null;
  
    };
  
    var code;
    var last;
  
    while (true) {
      last = code;
      code = readCode(codeSize);
  
      if (code === clearCode) {
        clear();
        continue;
      }
      if (code === eoiCode) break;
  
      if (code < dict.length) {
        if (last !== clearCode) {
          dict.push(dict[last].concat(dict[code][0]));
        }
      }
      else {
        if (code !== dict.length) throw new Error('Invalid LZW code.');
        dict.push(dict[last].concat(dict[last][0]));
      }
      output.push.apply(output, dict[code]);
  
      if (dict.length === (1 << codeSize) && codeSize < 12) {
        // If we're at the last code and codeSize is 12, the next code will be a clearCode, and it'll be 12 bits long.
        codeSize++;
      }
    }
  
    // I don't know if this is technically an error, but some GIFs do it.
    //if (Math.ceil(pos / 8) !== data.length) throw new Error('Extraneous LZW bytes.');
    return output;
  }

  function doImg(img, opts) {
    if (!opts.locals.frame) opts.locals.frame = opts.locals.tmpCanvas.getContext('2d');

    var currIdx = opts.locals.frames.length;

    //ct = color table, gct = global color table
    var ct = img.lctFlag ? img.lct : opts.locals.hdr.gct; // TODO: What if neither exists?

    /*
    Disposal method indicates the way in which the graphic is to
    be treated after being displayed.

    Values :    0 - No disposal specified. The decoder is
            not required to take any action.
          1 - Do not dispose. The graphic is to be left
            in place.
          2 - Restore to background color. The area used by the
            graphic must be restored to the background color.
          3 - Restore to previous. The decoder is required to
            restore the area overwritten by the graphic with
            what was there prior to rendering the graphic.

            Importantly, "previous" means the frame state
            after the last disposal of method 0, 1, or 2.
    */
    if (currIdx > 0) {
      if (opts.locals.lastDisposalMethod === 3) {
        // Restore to previous
        opts.locals.frame.putImageData(opts.locals.frames[opts.locals.disposalRestoreFromIdx].data, 0, 0);
      } else {
        opts.locals.disposalRestoreFromIdx = currIdx - 1;
      }

      if (opts.locals.lastDisposalMethod === 2) {
        // Restore to background color
        // Browser implementations historically restore to transparent; we do the same.
        // http://www.wizards-toolkit.org/discourse-server/viewtopic.php?f=1&t=21172#p86079
        try {
          opts.locals.frame.clearRect(img.leftPos, img.topPos, img.width, img.height);
        } catch (e) {
          // do nothing
        }
      }
    }
    // else, Undefined/Do not dispose.
    // frame contains final pixel data from the last frame; do nothing

    //Get existing pixels for img region after applying disposal method
    var imgData = opts.locals.frame.getImageData(img.leftPos, img.topPos, img.width, img.height);
    //apply color table colors
    var cdd = imgData.data;
    img.pixels.forEach(function (pixel, i) {
      // imgData.data === [R,G,B,A,R,G,B,A,...]
      if (pixel !== opts.locals.transparency) {
        cdd[i * 4 + 0] = ct[pixel][0];
        cdd[i * 4 + 1] = ct[pixel][1];
        cdd[i * 4 + 2] = ct[pixel][2];
        cdd[i * 4 + 3] = 255; // Opaque.
      }
    });

    opts.locals.frame.putImageData(imgData, img.leftPos, img.topPos);

    lastImg = img;

    return null
  }

  function parseImg(img, st, opts) {
    var deinterlace = function (pixels, width) {
      // Of course this defeats the purpose of interlacing. And it's *probably*
      // the least efficient way it's ever been implemented. But nevertheless...
      var newPixels = new Array(pixels.length);
      var rows = pixels.length / width;
      var cpRow = function (toRow, fromRow) {
        var fromPixels = pixels.slice(fromRow * width, (fromRow + 1) * width);
        newPixels.splice.apply(newPixels, [toRow * width, width].concat(fromPixels));
      };

      // See appendix E.
      var offsets = [0, 4, 2, 1];
      var steps = [8, 8, 4, 2];

      var fromRow = 0;
      for (var pass = 0; pass < 4; pass++) {
        for (var toRow = offsets[pass]; toRow < rows; toRow += steps[pass]) {
          cpRow(toRow, fromRow)
          fromRow++;
        }
      }

      return newPixels;
    }

    img.leftPos = st.readUnsigned()
    img.topPos = st.readUnsigned()
    img.width = st.readUnsigned()
    img.height = st.readUnsigned()

    var bits = byteToBitArr(st.readByte())
    img.lctFlag = bits.shift()
    img.interlaced = bits.shift()
    img.sorted = bits.shift()
    img.reserved = bits.splice(0, 2)
    img.lctSize = bitsToNum(bits.splice(0, 3))

    if (img.lctFlag) {
      img.lct = parseCT(1 << (img.lctSize + 1), st)
    }

    img.lzwMinCodeSize = st.readByte()

    var lzwData = readSubBlocks(st)

    img.pixels = lzwDecode(img.lzwMinCodeSize, lzwData)

    if (img.interlaced) { // Move
      img.pixels = deinterlace(img.pixels, img.width);
    }

    return doImg(img, opts)
  }

  function parseBlock(st, opts) {
    var block = {}
    block.sentinel = st.readByte()
    const { frame, frames, hdr, delay } = opts.locals

    switch (String.fromCharCode(block.sentinel)) { // For ease of matching
      case '!':
        block.type = 'ext'
        let temp1 = parseExt(block, st, opts)
        temp1 = null
        break
      case ',':
        block.type = 'img'
        let temp2 = parseImg(block, st, opts)
        temp2 = null
        break
      case ';':
        block.type = 'eof'
        if (frame) {
          frames.push({
            data: frame.getImageData(0, 0, hdr.width, hdr.height),
            delay,
          })
        }
        // handler.eof && handler.eof(block);
        break
      default:
        throw new Error('unexpected block...')
    }

    if (block.type !== 'eof') {
      return parseBlock(st, opts)
    }
    const frames2 = [...opts.locals.frames]
    opts.locals.frames = []
    opts.locals = null
    opts.options = null
    block = null
    return frames2
  }

  mySuperGif.init = init
  mySuperGif.load = load
  mySuperGif.parseHeader = parseHeader
  mySuperGif.parseBlock = parseBlock

  w.mySuperGif = mySuperGif
}(window))
