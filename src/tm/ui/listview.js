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
                    width: this.width,
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
        this.innerPanel.originX = this.originX;
        this.innerPanel.originY = this.originY;

        this.innerPanel.removeChildren();

        this.innerPanel.height = 0;
        var y = this.height * -this.originY;
        this.model.forEach(function(item, index) {
            var view = this.createView(item, index).addChildTo(this.innerPanel);
            view.y = y + view.height * view.originY;
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
});

tm.ui.ListView.DEFAULT_PARAM = {
    width: tm.global.SCREEN_WIDTH || 640,
    height: tm.global.SCREEN_HEIGHT || 960,
    fillStyle: "rgb(200, 200, 200)",
    strokeStyle: "transparent",
    createView: function(item, index) {
        return tm.display.RectangleShape({
            width: this.width,
            height: 48,
            fillStyle: "white",
            strokeStyle: "black",
            lineWidth: 0.1,
        }).fromJSON({
            children: {
                label: {
                    type: "tm.display.Label",
                    init: ["" + item, 24],
                    fillStyle: "black",
                    strokeStyle: "transparent",
                }
            }
        });
    },
};

})();
