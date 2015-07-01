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
    ...
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

    console.log(e.item); // => item of model
    console.log(e.view); // => view
    console.log(e.index); // => index in model
    
});
```