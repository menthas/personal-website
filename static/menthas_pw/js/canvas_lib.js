/**
 * Menu item object
 */
function MenuGridItem() {
    this._defaults = {
        id: null,
        name: 'Menu Item',
        randomColor: false,
        inheritColor: false,
        bgImage: null,
        bgImageScroll: false,
        bgImageScrollSpeed: 0.1,
        bgImageFit: false,
        icon: null,
        iconRatio: 0.55,
        color: null,
        verticalPlacement: null,
        fontSize: 16,
        fontWeight: "bold",
        fontFamily: "Candara,Calibri,Segoe,Segoe UI,Optima,Arial,sans-serif",
        fontColor: "#000",
        showModal: null,
        link: null,
        linkTarget: 'blank',
    }
    this.id = null;
    this.x = null;
    this.y = null;
    this.parent = null;
    this.color = '#fff';
    this.text = null;
    this.children = [];
}

_.extend(MenuGridItem.prototype, {
    init: function(item, upward, tags, options, parent) {
        item.menu_container = this;
        this.item = item;
        this.upward = upward;
        this.tags = tags == undefined ? [] : tags;
        this.options = _.defaults(options, this._defaults);
        this.parent = parent;
        this.id = this.options.id;
    },

    point: function() {
        if (this.x != null && this.y != null)
            return {x: this.x, y:this.y};
        else
            return null;
    },

    addChild: function(child) {
        this.children.push(child);
    },

    eventHandler: function(event) {
        if (this.options.showModal) {
            $('#' + this.options.showModal).modal('show');
        } else if (this.options.link) {
            window.location = this.options.link;
        }
    },
});

/**
 * Menu grid object
 */
function MenuGrid() {
    this.grid = [];
    this.all_items = [];
    this.neighbors = [[-1, 0], [1, 0]];
    this.upward_neighbors = [[0, 1]];
    this.downward_neighbors = [[0, -1]];
    this.bounds = {
        minx: 0,
        miny: 0,
        maxx: 0,
        maxy: 0
    }
}

_.extend(MenuGrid.prototype, {
    addItem: function(x, y, item) {
        if (this.grid[x] == undefined)
            this.grid[x] = [];
        else if (this.grid[x][y] != undefined)
            return false;
        item.x = x;
        item.y = y;
        this.grid[x][y] = item;
        this.all_items.push(item);
        this._updateBounts(x, y);
        return true;
    },

    isFilled: function(x, y) {
        if (this.grid[x] == undefined || this.grid[x][y] == undefined || this.grid[x][y] == null)
            return false;
        return true;
    },

    isPositionUpward: function(x, y) {
        return (x + y) % 2 == 0
    },

    getItem: function(x, y) {
        if (this.grid[x] == undefined || this.grid[x][y] == undefined || this.grid[x][y] == null)
            return null;
        return this.grid[x][y];
    },

    getClosestFreeSpace: function(x, y) {
        if (!this.isFilled(x, y))
            return {x: x, y: y};
        var item = this.getItem(x, y);
        var neighbor_queue = [item];
        while (neighbor_queue.length > 0) {
            var neighbor = neighbor_queue.shift();
            var all_neighbors = _.union(
                this.neighbors,
                neighbor.upward ? this.upward_neighbors : this.downward_neighbors
            );
            for (var i=0; i<all_neighbors.length; i++) {
                new_x = all_neighbors[i][0] + neighbor.x;
                new_y = all_neighbors[i][1] + neighbor.y;

                if (!this.isFilled(new_x, new_y))
                    return {x: new_x, y:new_y};
                neighbor_queue.push(this.getItem(new_x, new_y));
            }
        }
    },

    getFilledNeighbor: function(x, y, upward) {
        if (this.isFilled(x-1, y))
            return {x: x-1, y: y, handle: 2};
        else if (this.isFilled(x+1, y))
            return {x: x+1, y: y, handle: 1};
        else if (upward && this.isFilled(x, y+1))
            return {x: x, y: y+1, handle: 0};
        else if (!upward && this.isFilled(x, y-1))
            return {x: x, y: y-1, handle: 0};
        else
            return null;
    },

     getFilledNeighborObject: function(item) {
        var pos = this.getFilledNeighbor(item.x, item.y, item.upward);
        if (pos != null)
            return this.getItem(pos.x, pos.y);
        return pos;
    },

    _updateBounts: function(x, y) {
        this.bounds.minx = Math.min(x, this.bounds.minx);
        this.bounds.miny = Math.min(y, this.bounds.miny);
        this.bounds.maxx = Math.min(x, this.bounds.maxx);
        this.bounds.maxy = Math.min(y, this.bounds.maxy);
    },

    printGrid: function() {
        console.log(this.grid);
    }
});

/**
 * Rendering/Presentation logic
 */
function Representation() {
    this.image_center_ratio = 0.028125;
    this.triangle_speed = 5;
    this.initial_animation_halt = 0;//120;
    this.image_flash_duration = 0//;60;
    this.image_opacity_duration = 10;//100;
    this.text_in_triangle_offset_upward = 0.03;
    this.text_in_triangle_offset_downward = -0.01;
    this.image_in_triangle_offset_upward = 0.03;
    this.image_in_triangle_offset_downward = -0.025;
    this.show_text_on_hover = false;
    this.init_img;
    this.live_img;
    this.live_img_blur;
    this.init_tile;
    this.tiles;
    this.grid = new MenuGrid();
}

_.extend(Representation.prototype, {
    init: function() {
        this.init_img = new Raster('init_img');
        this.init_img.position = view.center;
        var tile0 = new Path.RegularPolygon({
            center: view.center + this.getCenterOffset(),
            sides: 3,
            radius: 80,
            fillColor: 'white',
            strokeColor: new Color(0, 0, 0, 0.3),
            strokeWidth: 1
        });
        this.init_tile = this.addTriangleToGrid(tile0, 0, 0, true);

        var triangle_shadow = tile0.clone();
        triangle_shadow.scale_factor = 1;
        triangle_shadow.fillColor = '#A70074';
        triangle_shadow.onFrame = function(event) {
            cycle_count = event.count % 100;
            if (cycle_count == 0) {
                this.scale (1 / this.scale_factor);
                this.opacity = 1;
                this.scale_factor = 1;
                return;
            }
            this.scale(1 + (cycle_count * 0.0001));
            this.scale_factor *= 1 + (cycle_count * 0.0001);
            if (this.opacity >= 0.01)
                this.opacity -= 0.01;
        };

        this.tiles = new Group([triangle_shadow, tile0]);
        var _this = this;
        this.tiles.onClick = function(event) {
            triangle_shadow.remove();
            var clouds = new MenuGridItem();
            clouds.init(tile0.clone(), true, [], {
                bgImage: 'clouds',
                bgImageScroll: true,
                bgImageFit: true,
            });
            _this.drawBackgroundImage(clouds);
            this.onClick = null;
            _this.openMenu();
        }
        this.tiles.onMouseEnter = function(event) {
            document.body.style.cursor = "pointer";
        }
        this.tiles.onMouseLeave = function(event) {
            document.body.style.cursor = "default";
        }
    },

    rescale: function(event) {
        var scale = view.size.width / this.init_img.bounds.width;
        if (this.init_img.bounds.height * scale < view.size.height) {
            scale = view.size.height / this.init_img.bounds.height;
        }
        this.init_img.scale(scale);
        this.init_img.position = view.center;

        this.tiles.scale(scale);
        var center_offset = this.tiles.position - this.init_tile.item.position;
        this.tiles.position = center_offset + view.center + this.getCenterOffset();

        if (this.live_img) {
            scale = view.size.width / this.live_img.bounds.width;
            if (this.live_img.bounds.height * scale < view.size.height) {
                scale = view.size.height / this.live_img.bounds.height;
            }
            this.live_img.scale(scale);
            this.live_img.position = view.center;
        }

        if (this.live_img_blur) {
            scale = view.size.width / this.live_img_blur.bounds.width;
            if (this.live_img_blur.bounds.height * scale < view.size.height) {
                scale = view.size.height / this.live_img_blur.bounds.height;
            }
            this.live_img_blur.scale(scale);
            this.live_img_blur.position = view.center;
        }
    },

    getCenterOffset: function() {
        return new Point(-this.init_img.bounds.width * this.image_center_ratio, 0);
    },

    openMenu: function() {
        this.init_img.opacity = 0;

        this.live_img = new Raster('live_img');
        this.live_img.position = view.center;
        this.live_img.sendToBack();
        this.live_img.opacity = 0;
        this.rescale();

        var total_animation_len = 
            this.initial_animation_halt +
            this.image_flash_duration +
            this.image_opacity_duration;
        var _this = this;
        this.live_img.onFrame = function (event) {
            if (event.count <= _this.initial_animation_halt)
                return;

            if (event.count <= _this.initial_animation_halt + _this.image_flash_duration) {
                if (event.count % 15 < 13) {
                    _this.live_img.opacity = 0;
                } else {
                    _this.live_img.opacity = 1;
                }
            } else if (event.count <= total_animation_len) {

                this.opacity += 1 / _this.image_opacity_duration;
            } else { // start rendering menue
                menu_definition = _.shuffle(menu_definition);
                for (var i=0; i<menu_definition.length; i++) {
                    _this.drawMenuItem(menu_definition[i], _this.init_tile);
                }
                this.onFrame = null;
            }
        }
        
    },

    drawMenuItem: function(item, parent_item) {
        var pos = this.grid.getClosestFreeSpace(parent_item.x, parent_item.y);
        var upward = this.grid.isPositionUpward(pos.x, pos.y);
        var neighbor = this.grid.getFilledNeighbor(pos.x, pos.y, upward);
        var neighbor_item = this.grid.getItem(neighbor.x, neighbor.y);
        var child = this.addTriangleToGrid(
            this.cloneTriangle(neighbor_item, neighbor.handle), pos.x, pos.y, upward,
            _.union(parent_item.tags, item.name), item, parent_item
        );
        parent_item.addChild(child);
        if (!_.isUndefined(item.children)) {
            var children = _.shuffle(item.children);
            for (var i=0; i<children.length; i++)
                this.drawMenuItem(children[i], child);
        }
    },

    cloneTriangle: function(parent_item, handle, skip, onFinish) {
        var parent = parent_item.item;
        var clone = parent.clone();
        var side;
        var _this = this;
        clone.onFrame = function(event) {
            if ((skip != undefined && event.count < skip) || parent.onFrame != null)
                return;
            // initialize the parameters after parent animation and skip time has passed
            if (!this.triangle_normal) {
                this.segments = _this.cloneSegments(parent);
                side = _this.handleToSide(parent_item, handle);
                var mov = _this.triangleMidpoint(parent) - parent.segments[side].point;
                this.triangle_normal = mov.normalize();
                this.triangle_size = mov.length;
                this.original_side = side;
                this.animation_init = this.segments[side].point.clone();
            }
            // moves the triangle on each tick
            var movement = this.animation_init - this.segments[side].point;
            var distance_to_cover = Math.round((this.triangle_size * 3) - movement.length);
            if (distance_to_cover > 0) {
                this.segments[side].point += (
                    this.triangle_normal * Math.min(_this.triangle_speed, distance_to_cover)
                );
            } else { // remove the onFrame function since it won't be used
                this.onFrame = null;
                _this.drawOptions(this.menu_container);

                if (onFinish != undefined) {
                    onFinish();
                }
            }
        }
        return clone;
    },

    cloneSegments: function(path) {
        var segments = [];
        for (var i=0; i<path.segments.length; i++) {
            segments.push(new Segment(path.segments[i]));
        }
        return segments;
    },

    drawOptions: function(menu_item) {
        var color = menu_item.options.color;
        if (menu_item.options.randomColor) {
            color = new Color({
                hue: _.random(0, 360),
                saturation: 0.3,
                brightness: (Math.random() + 0.5) / 1.5,
            })
        } else if (menu_item.options.inheritColor) {
            color = menu_item.parent.color;
        }
        menu_item.color = color;
        menu_item.item.fillColor = color;

        if (_.isNull(color) && menu_item.options.bgImage)
            this.drawBackgroundImage(menu_item);

        var desc;
        if (menu_item.options.icon) {
            var icon = new Raster({
                source: menu_item.options.icon,
                position: this.imageInTriangleOffset(menu_item),
            });
            icon.scale((menu_item.item.bounds.height * menu_item.options.iconRatio) / icon.width);
            this.tiles.addChild(icon);
            desc = icon;
        } else {
            var text = new PointText({
                point: this.textInTriangleOffset(menu_item),
                content: menu_item.options.name,
                justification: 'center',
                fontSize: menu_item.options.fontSize,
                fontWeight: menu_item.options.fontWeight,
                fontFamily: menu_item.options.fontFamily,
                fillColor: menu_item.options.fontColor
            });
            desc = text;
            menu_item.text = text;
            this.tiles.addChild(text);
        }

        if (this.show_text_on_hover) {
            desc.opacity = 0;
            menu_item.item.onMouseEnter = function(event) {
                desc.opacity = 1;
            }
            menu_item.item.onMouseLeave = function(event) {
                desc.opacity = 0;
            }
        }

    },

    removeTriangle: function(triangle, onFinish) {
        var _this = this;
        triangle.onFrame = function(event) {
            var movement = this.animation_init - this.segments[this.original_side].point;
            if (_this.sign(movement.angle) == -_this.sign(this.triangle_normal.angle)) {
                this.segments[this.original_side].point -= (
                    this.triangle_normal * _this.triangle_speed
                );
            } else {
                this.onFrame = null;
                this.remove();
                if (onFinish != undefined) {
                    onFinish();
                }
            }
        }
    },

    triangleMidpoint: function(triangle) {
        return (
            triangle.segments[0].point +
            triangle.segments[1].point +
            triangle.segments[2].point
        ) / 3;
    },

    handleToSide: function(item, handle) {
        side_xs = [
            {side:0, x:item.item.segments[0].point.x},
            {side:1, x:item.item.segments[1].point.x},
            {side:2, x:item.item.segments[2].point.x}
        ];
        side_xs.sort(function(a, b) {
            return a.x - b.x;
        });
        return side_xs[(handle + 1) % 3].side;
    },

    sign: function(x) {
        return typeof x === 'number' ? x ? x < 0 ? -1 : 1 : x === x ? 0 : NaN : NaN;
    },

    addTriangleToGrid: function(triangle, x, y, upward, tags, options, parent) {
        if (_.isUndefined(options))
            options = {};
        if (_.isUndefined(parent))
            parent = null;
        if (_.isUndefined(tags))
            tags = [];
        if (this.grid.isFilled(x, y))
            return false;
        var item = new MenuGridItem();
        item.init(triangle, upward, tags, options, parent);
        this.grid.addItem(x, y, item);

        return item;
    },

    textInTriangleOffset: function(menu_item) {
        if (_.isNull(menu_item.options.verticalPlacement)) {
            // no placement information, try to center it.
            var y = view.size.height * (
                menu_item.upward ? this.text_in_triangle_offset_upward :
                                   this.text_in_triangle_offset_downward
            );
            return menu_item.item.bounds.center + new Point(0, y);
        } else { // use placement value
            var placement = menu_item.upward ?
                menu_item.options.verticalPlacement :
                (1 - menu_item.options.verticalPlacement);
            var offset = new Point(0, menu_item.item.bounds.height * placement);
            return menu_item.item.bounds.topCenter + offset;
        }
    },

    imageInTriangleOffset: function(menu_item) {
        if (_.isNull(menu_item.options.verticalPlacement)) {
            // no placement information, try to center it.
            var y = view.size.height * (
                menu_item.upward ? this.image_in_triangle_offset_upward :
                                   this.image_in_triangle_offset_downward
            );
            return menu_item.item.bounds.center + new Point(0, y);
        } else { // use placement value
            var placement = menu_item.upward ?
                menu_item.options.verticalPlacement :
                (1 - menu_item.options.verticalPlacement);
            var offset = new Point(0, menu_item.item.bounds.height * placement);
            return menu_item.item.bounds.topCenter + offset;
        }
    },

    drawBackgroundImage: function(menu_item) {
        var bg_image = new Raster(menu_item.options.bgImage);
        bg_image.position = menu_item.item.position;
        if (menu_item.options.bgImageFit) {
            var height_scale = menu_item.item.bounds.height / bg_image.height;
            var width_scale = menu_item.item.bounds.width / bg_image.width;
            if (bg_image.width * height_scale < menu_item.item.bounds.width)
                bg_image.scale(width_scale);
            else
                bg_image.scale(height_scale);
        }

        if (menu_item.options.bgImageScroll) {
            bg_image.animation_direction = 1;
            bg_image.onFrame = function(event) {
                if (bg_image.bounds.rightCenter.x <= menu_item.item.bounds.rightCenter.x ||
                    bg_image.bounds.leftCenter.x >= menu_item.item.bounds.leftCenter.x)
                    this.animation_direction *= -1;
                bg_image.position.x += this.animation_direction *
                                       menu_item.options.bgImageScrollSpeed;
            }
        }
        var clip_group = new Group(menu_item.item, bg_image);
        clip_group.clipped = true;
        this.tiles.addChild(clip_group);
    },

    eventHandler: function(menu_item, event) {
        if (_.isNull(menu_item.id))
            return;
        // if (!this.live_img_blur) {
        //     this.createBlurImage();
        // }
        // this.live_img_blur.start_animation = true;
        menu_item.eventHandler(event);
    },

    createBlurImage: function() {
        this.live_img_blur = this.live_img.clone();
        this.live_img_blur.opacity = 0;
        this.start_animation = false;
        stackBlurCanvasRGB(this.live_img_blur, 20);
        this.live_img_blur.onFrame = function(event) {
            if (this.start_animation && this.opacity < 60) {
                if (this.opacity == 0)
                    this.bringToFront();
                this.opacity += 1 / 60;
            } else if (this.start_animation) {
                this.start_animation = false;
            }
        }
        this.live_img_blur.onMouseDown = function(event) {
            this.opacity = 0;
            this.sendToBack();
            this.start_animation = false;
        }
    }
});

representation = new Representation();
representation.init();
// register events
function onResize(event) {
    representation.rescale(event)
};

function onMouseDown(event) {
    for (var i=0; i<representation.grid.all_items.length; i++) {
        menu_item = representation.grid.all_items[i];
        if (menu_item.item.contains(event.point)) {
            representation.eventHandler(menu_item, event);
            break;
        }
    }
}
