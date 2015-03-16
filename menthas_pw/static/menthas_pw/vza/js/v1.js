function VzA() {
    this._defaults = {
        total_triangles: 30,
        triangle_spacing: 50,
        triangle_size: 20,
        side_density: 100,
        camera_forward_z: 30,
        soundcloud_id: '589f1798161df231169e187ccb057bbb',
        variable_focus: false,
    };
    this.mouse_x = 0;
    this.mouse_y = 0;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.start = 1;
    this.triangles = [];
    this.faces = [];
    this.frame_info = {};
    // good values for lower and upper bound colors
    this.base_color = [0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07];
    this.base_color = this.base_color[Math.floor(Math.random()*this.base_color.length)]
    this.color_scale = Math.random()*100;
    this.depth_usage = Math.random();
    this.frame_counter = 0;
    this.focus = 1.0;
}

_.extend(VzA.prototype, {
    init: function(options) {
        if (_.isUndefined(options))
            options = {};
        this.options = _.defaults(options, this._defaults);
        this._initScene();
        this._initPostProcess();

        // var _this = this;
        // document.addEventListener('mousemove', function( event ) {
        //     _this.mouse_x = (event.clientX - (_this.width / 2)) / _this.width;
        //     _this.mouse_y = (event.clientY - (_this.height / 2)) / _this.height;
        // }, false);
        
        var _this = this;
        window.addEventListener( 'resize', function () {
            _this.camera.aspect = window.innerWidth / window.innerHeight;
            _this.camera.updateProjectionMatrix();
            _this.renderer.setSize( window.innerWidth, window.innerHeight );
            _this.composer.setSize( window.innerWidth, window.innerHeight );
        }, false );
    },

    _initScene: function() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2( 0, 0.002 );

        this.camera = new THREE.PerspectiveCamera(
            45, this.width / this.height, 0.1, 500
        );
        this.camera.position.set(0, 0, this.options.camera_forward_z);
        this.camera.lookAt(this.scene.position);

        this.renderer = new THREE.WebGLRenderer({ antialias: false });
        this.renderer.setSize( this.width, this.height );
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.autoClear = false;
        document.body.appendChild( this.renderer.domElement );
    },

    _initPostProcess: function() {
        this.render_pass = new THREE.RenderPass( this.scene, this.camera );
        this.bokeh_pass = new THREE.BokehPass( this.scene, this.camera, {
            focus:      this.focus,
            aperture:   0.025,
            maxblur:    1.0,
            width: this.width,
            height: this.height
        } );
        this.bokeh_pass.renderToScreen = true;
        this.composer = new THREE.EffectComposer( this.renderer );
        this.composer.addPass( this.render_pass );
        this.composer.addPass( this.bokeh_pass );
    },

    render: function(wave_data, eq_data) {
        this.frame_counter++;

        this.composer.render( 0.1 );
        // this.renderer.render( this.scene, this.camera );
        // this._moveCamera();

        this.frame_info.max_enj = Math.max(
            Math.max.apply(null, wave_data.left),
            Math.max.apply(null, wave_data.right)
        )
        this.frame_info.wave_data = wave_data
        this.camera.position.z -= this.frame_info.max_enj * 2;

        /**
         * Variable focus based on what freq. we have max wave length
         */
        if (this.options.variable_focus) {
            var cycle = this.frame_counter % 120;
            if (cycle == 0) {
                var max_eq = 0;
                var max_eq_ring = 0;
                for (var j=0; j<256; j++) {
                    if (eq_data.left[j] > max_eq || eq_data.right[j] > max_eq) {
                        max_eq_ring = j;
                        max_eq = Math.max(eq_data.left[j], eq_data.right[j])
                    }
                }
                this.focus = Math.max(0.5, Math.min(1.0, max_eq_ring / 10));
                // this.focus = Math.random();
                    
            } else if (cycle < 80) {
                this.bokeh_pass.uniforms["focus"].value +=
                    (this.focus - this.bokeh_pass.uniforms["focus"].value) / 80;
            }
        }

        var size;
        for (var i=this.start; i<=this.start + this.options.total_triangles; i++) {
            if (this.triangles[i-1]) {
                this.scene.remove(this.triangles[i-1]);
                this.triangles[i-1] = undefined;
            }
            if (this.faces[i-1]) {
                this.scene.remove(this.faces[i-1]);
                this.faces[i-1] = undefined;
            }
            if (-i*this.options.triangle_spacing > this.camera.position.z) {
                this.start++;
                continue;
            }
            this.add_triangle(
                i-1,
                this.options.triangle_size,
                -i*this.options.triangle_spacing,
                this.options.side_density,
                this.frame_info.max_enj * 3,
                Math.max(eq_data.right[i], eq_data.left[i])
            );
        }
    },

    add_triangle: function(id, len, depth, segments, noise_scale, eq_data) {
        height = Math.sqrt(3*len*len)/2;
        var vertices = [
            [-(len/2), -height/2, depth],
            [0, height/2, depth],
            [+(len/2), -height/2, depth]
        ]

        var line_geometry = new THREE.Geometry();
        var cur, nxt, x_step, y_step, rnd, x_rnd;

        for (var i=0; i<3; i++) {
            cur = vertices[i];
            nxt = vertices[(i+1)%3];
            x_step = (nxt[0] - cur[0]) / segments;
            y_step = (nxt[1] - cur[1]) / segments;
            for (var j=0; j<segments; j++) {
                if (this.frame_info.wave_data != undefined &&
                    this.frame_info.wave_data.left.length > 0)
                {
                    rnd = this.frame_info.wave_data.left[j] * noise_scale;
                    x_rnd = this.frame_info.wave_data.right[j] * noise_scale;
                    if (i == 0) x_rnd *= -1; else if (i == 2) x_rnd = 0;
                } else {
                    rnd = Math.random() * len * noise_scale;
                    if (i == 0) x_rnd = -rnd; else if (i == 1) x_rnd = rnd; else x_rnd = 0;
                }

                line_geometry.vertices.push(new THREE.Vector3(
                    cur[0] + x_step*j + x_rnd, cur[1] + y_step*j + rnd, depth
                ));
            }
        }
        line_geometry.vertices.push(new THREE.Vector3(
            line_geometry.vertices[0].x, line_geometry.vertices[0].y,
            line_geometry.vertices[0].z
        ));
        var color = this.hslToRgb(
            Math.min(this.base_color, eq_data) * 10, 1,
            Math.min(1, this.frame_info.max_enj)
        );
        var triangle = new THREE.Line(
            line_geometry,
            new THREE.LineBasicMaterial({
                color: color,
                fog:true, linewidth: 2
            })
        );
        this.scene.add(triangle);
        this.triangles[id] = triangle;

        if (eq_data > this.depth_usage) {
            var geom = new THREE.Geometry(); 
            var v1 = new THREE.Vector3(vertices[0][0], vertices[0][1],
                vertices[0][2]);
            var v2 = new THREE.Vector3(vertices[1][0], vertices[1][1],
                vertices[1][2]);
            var v3 = new THREE.Vector3(vertices[2][0], vertices[2][1],
                vertices[2][2]);

            geom.vertices.push(v1);
            geom.vertices.push(v2);
            geom.vertices.push(v3);

            geom.faces.push( new THREE.Face3( 0, 1, 2 ) );

            var object = new THREE.Mesh( geom, new THREE.MeshLambertMaterial(
                {color: color, opacity: 0.4}
            ) );
            this.scene.addObject(object);
            this.faces[id] = object;
        }
    },

    reset: function() {
        this.camera.position.set(0, 0, this.options.camera_forward_z);
        this.camera.lookAt(this.scene.position);
        for (var i=0; i<this.options.total_triangles; i++) {
            if (this.triangles[i]) {
                this.scene.remove(this.triangles[i]);
                this.triangles[i] = undefined;
            }
        }
        this.start = 1
        this.frame_info = {}
        this.base_color = (Math.random() * 7 / 10) + 0.01;
        this.color_scale = Math.random()*100;
        this.depth_usage = Math.random();
    },

    _moveCamera: function() {
        var move_x = ( this.mouse_x - this.camera.position.x );
        var move_y = ( - (this.mouse_y) - this.camera.position.y );
        var moved = false;
        if ((this.camera.position.x < 5 && this.camera.position.x > -5) ||
            (this.camera.position.x > 5 && move_x < 0) ||
            (this.camera.position.x < -5 && move_x > 0))
        {
            this.camera.position.x += move_x;
            moved = true;
        }
        if ((this.camera.position.y < 5 && this.camera.position.y > -5) ||
            (this.camera.position.y > 5 && move_y < 0) ||
            (this.camera.position.y < -5 && move_y > 0))
        {
            this.camera.position.y += move_y;
            moved = true;
        }
        // if (moved)
        //     this.camera.lookAt( new THREE.Vector3( 0, 0,
        //         this.camera.position.z + this.options.camera_forward_z )
        //     );
    },

    hslToRgb: function(h, s, l){
        var r, g, b;

        if (s == 0) {
            r = g = b = l; // achromatic
        } else {
            var hue2rgb = function hue2rgb(p, q, t){
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }

            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return (Math.round(r * 255) << 16) +
               (Math.round(g * 255) << 8) +
               Math.round(b * 255);
    },

    onWindowResize: function () {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
    },

});

