# Cardano Transaction Composer

## Background
- **Build Transaction**: To build the transaction, [cardano-serialization-lib](https://github.com/Emurgo/cardano-serialization-lib) library is the best library on Cardano, you can use it in both in the frontend and backend.
- **Concern**: this library is wrote in rust, the package for the frontend is wasm(web assembly) package, which will be harder to implement it on landing website
- **Solution**: Build a tool(website) that have ability to compose the transcation, the other website can just insert simple javascript function inside its website, and able to use this tool to build the transaction

<img src="https://i.imgur.com/cc4V0g9.jpgg"/>

## Website Integration (Sending ADA)
- HTML
```html
<button type="button" onclick="handleWallet()">
  Send ADA
</button>
```

- JavaScript
```javascript
function handleWallet() {
    const type = 'send';
    const ada = 2;
    const address = 'addr1q8mdmhgtqe3v5zsgnawzjz0u483m7gtk6kg9wkq00tk28x792r3ky7amnm59ld6wm8qup4rlgyqh25n6n2p0vj48fvjs90fgmf'
    var link = 'https://transaction.aidev-cardano.com?type=' + type + '&address=' + address + '&ada=' + ada
    var width = 600
    var height = Math.min(800, parseInt(window.outerHeight, 10))
    var left = (parseInt(window.outerWidth, 10) / 2) - (width / 2)
    var top = (parseInt(window.outerHeight, 10) - height) / 2
    window.open(link, 'Delegate', 'width=' + width + ',height=' + height + ',toolbar=0,menubar=0,location=0,status=0,scrollbars=1,resizable=1,left=' + left + ',top=' + top);
}
```

## Website Integration (Mint NFT)
- HTML
```html
<button type="button" onclick="handleWallet()">
  Mint NFT
</button>
```

- JavaScript
```javascript
function handleWallet() {
    const type = 'mint';
    var metadata = {
      "ExampleName": {
        "image": "ipfs://QmRTrTgdoK9uxfCnk4dgsb6GfZ3zguFfQ9EXU6hVPBYrvv",
        "name": "Example Name"
      }
    }
    var metadata_string = encodeURIComponent(JSON.stringify(metadata)); 
    var link = 'https://transaction.aidev-cardano.com' + '?type=' + type + '&metadata=' + metadata_string
    var width = 600
    var height = Math.min(800, parseInt(window.outerHeight, 10))
    var left = (parseInt(window.outerWidth, 10) / 2) - (width / 2)
    var top = (parseInt(window.outerHeight, 10) - height) / 2
    window.open(link, 'Delegate', 'width=' + width + ',height=' + height + ',toolbar=0,menubar=0,location=0,status=0,scrollbars=1,resizable=1,left=' + left + ',top=' + top);
}
```
