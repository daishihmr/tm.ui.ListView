# tm.ui.ListView

ListView for tmlib.js

## usage

### basic

```js
var model = [
    "black",
    "white",
    "luminous",
    "bloom",
    "eaglet",
];

var listView = ListView({
    width: 640,
    height: 480,
    model: model
});

listView.setPosition(320, 240).addChildTo(this);
```

### custom view

```js
var model = [
    { name: "nagisa" },
    { name: "honoka" },
    { name: "hikari" },
    { name: "saki" },
    { name: "mai" },
];

tm.define("CustomView", {
    superClass: "tm.display.CanvasElement",
    init: function() {
        this.superInit();
        this.fromJSON({
            children: {
                numberLabel: {
                    type: "tm.display.Label",
                    x: 0, y: 0
                },
                nameLabel: {
                    type: "tm.display.Label",
                    x: 100, y: 0
                }
            }
        });
    }
});

var listView = ListView({
    ...
    fillStyle: "black", // background color
    createView: function(item, index) {
        var view = CustomView();
        view.numberLabel.text = "No." + (item.index + 1);
        view.nameLabel.text = item.name;
        
        return view;
    }
});
```

### event

```js
listView.on("select", function(e) {

    console.log(e.item); // => selected item
    console.log(e.view); // => selected view
    console.log(e.index); // => selected index
    
});
```
