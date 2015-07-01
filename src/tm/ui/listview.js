(function() {
    
tm.define("tm.ui.ListView", {
    superClass: "tm.display.RectangleShape",
    init: function(param) {
        this.param = {}.$extend(tm.ui.ListView.DEFAULT_PARAM, param);
        this.superInit(this.param);

        this.boundingType = "rect";
        this.interactive = true;
        this.clipping = true;
        this.scrollLimitMin = 0;
        this.scrollLimitMax = 0;
        
        this.fromJSON({
            children: {
                innerPanel: {
                    type: "tm.display.CanvasElement",
                }
            }
        });
        
        this.drag = false;
        this.velocityY = 0;
        this.backing = false;
        this.on("enterframe", function(e) {
            if (!this.interactive) return;
            
            var p = e.app.pointing;
            var delta = p.deltaPosition.y;
            
            if (this.innerPanel.y < this.scrollLimitMin && delta < 0) {
                delta *= 0.1;
            } else if (this.scrollLimitMax < this.innerPanel.y && 0 < delta) {
                delta *= 0.1;
            }

            if (this.innerPanel.y < this.scrollLimitMin && this.velocityY < 0) {
                this.velocityY *= 0.01;
            } else if (this.scrollLimitMax < this.innerPanel.y && 0 < this.velocityY) {
                this.velocityY *= 0.01;
            }

            if (p.getPointingStart() && this.isHitPoint(p.x, p.y)) {
                this.drag = true;
            } else if (this.drag && p.getPointing()) {
                this.innerPanel.y += delta;
                this.velocityY = delta;
            } else if (p.getPointingEnd()) {
                this.drag = false;
                this.backing = false;
            } else if (this.velocityY !== 0) {
                this.innerPanel.y += this.velocityY;
                this.velocityY *= 0.8;
                if (Math.abs(this.velocityY) < 1.0) {
                    this.velocityY = 0;
                }
            } else if (!this.backing) {
                var y = Math.clamp(this.innerPanel.y, this.scrollLimitMin, this.scrollLimitMax);
                if (this.innerPanel.y !== y) {
                    this.backing = true;
                    this.innerPanel.tweener
                        .clear()
                        .to({ y: y }, 50, "easeInQuad")
                        .call(function(){ this.backing = false });
                } else {
                    this.backing = false;
                }
            }
        });
        
        this.rebuild();
    },
    
    rebuild: function() {
        this.innerPanel.removeChildren();
        this.innerPanel.originX = 0.5;
        this.innerPanel.originY = 0.5;
        this.innerPanel.width = this.width;
        this.innerPanel.x = this.width * (0.5 - this.originX);

        this.innerPanel.height = 0;
        var y = this.height * -this.originY;
        this.model.forEach(function(item, index) {
            var view = this.createView(item, index).addChildTo(this.innerPanel);
            this.attach(item, view, index);
            
            view.x = view.width * (view.originY - 0.5);
            view.y = y + view.height * view.originY;
            
            this.setItemPointingEventListener(view, item, index);

            y += view.height;
            this.innerPanel.height += view.height;
        }.bind(this));

        if (this.height < this.innerPanel.height) {
            this.scrollLimitMin = this.height - this.innerPanel.height;
        } else {
            this.scrollLimitMin = 0;
        }
        this.scrollLimitMax = 0;
        
        return this;
    },
    
    refresh: function() {
        this.innerPanel.children.forEach(function(view, index) {
            this.attach(this.model[index], view, index);
        }.bind(this));
    },
    
    setItemPointingEventListener: function(view, item, index) {
        var self = this;
        
        var nomove = false;
        view.interactive = true;
        view.on("pointingstart", function(e) {
            if (!self.interactive) return;
            if (!self.isHitPoint(e.pointing.x, e.pointing.y)) return;
            
            nomove = true;
        });
        view.on("pointingmove", function(e) {
            if (!self.interactive) return;
            if (!self.isHitPoint(e.pointing.x, e.pointing.y)) return;

            if (e.app.pointing.deltaPosition.length() > 5) {
                nomove = false;
            }
        });
        view.on("pointingend", function(e) {
            if (!self.interactive) return;
            if (!self.isHitPoint(e.pointing.x, e.pointing.y)) return;

            if (nomove) {
                self.flare("select", {
                    app: e.app,
                    view: view,
                    item: item,
                    index: index,
                    model: self.model,
                    views: self.innerPanel.children,
                });
            }
        });
    },
});

tm.define("tm.ui.ListView.DefaultItemView", {
    superClass: "tm.display.RectangleShape",
    init: function(text) {
        this.superInit({
            width: tm.global.SCREEN_WIDTH || 640,
            height: 48,
            fillStyle: "white",
            strokeStyle: "black",
            lineWidth: 0.1,
            boundingType: "rect",
        });
        this.fromJSON({
            children: {
                label: {
                    type: "tm.display.Label",
                    init: [text, 24],
                    fillStyle: "black",
                    strokeStyle: "transparent",
                }
            }
        });
    },
});

tm.ui.ListView.DEFAULT_PARAM = {
    width: tm.global.SCREEN_WIDTH || 640,
    height: tm.global.SCREEN_HEIGHT || 960,
    fillStyle: "rgb(200, 200, 200)",
    strokeStyle: "transparent",
    createView: function(item, index) {
        return tm.ui.ListView.DefaultItemView("" + item);
    },
    attach: function(item, view, index) {},
};

})();
