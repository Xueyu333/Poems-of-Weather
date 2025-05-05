
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelRequestAnimationFrame = window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

// 3D云效果
document.addEventListener('DOMContentLoaded', function() {
    var layers = [],
        objects = [],
        world = document.getElementById('cloud-world'),
        viewport = document.getElementById('cloud-viewport'),
        clusterValueDisplay = document.getElementById('cluster-value'),
        d = 0,
        worldXAngle = 0,
        worldYAngle = 0,
        clusterFactor = 0.5, // 聚集因子 (0-1)
        cloudVisible = true;  // 追踪云是否可见

    // 生成初始云
    generate();

    // 添加鼠标事件监听器 - 默认就是交互模式
    document.addEventListener('mousemove', onMouseMove);
    viewport.addEventListener('mousewheel', onMouseWheel);
    viewport.addEventListener('DOMMouseScroll', onMouseWheel);
    viewport.addEventListener('touchmove', onTouchMove);
    
    // 添加淡入淡出效果
    viewport.style.transition = 'opacity 0.8s';
    document.querySelector('.cloud-controls').style.transition = 'opacity 0.8s';

    // 初始化时确保云和控制按钮不是隐藏的，而是透明的
    // 这样它们可以平滑淡入
    viewport.style.opacity = '1';
    document.querySelector('.cloud-controls').style.opacity = '1';

    // 页码管理
    var currentIndex = 0;
    var isRestart = false;

    // 监听翻页事件
    var controlButtons = document.querySelectorAll('#control button');

    // 左按钮（返回）
    controlButtons[0].addEventListener('click', function() {
        // 如果正在向前返回到封面
        if (currentIndex === 1) {
            fadeInClouds();
        }
        currentIndex = Math.max(0, currentIndex - 1);
    });

    // 右按钮（前进）
    controlButtons[1].addEventListener('click', function() {
        // 如果正在离开封面
        if (currentIndex === 0) {
            fadeOutClouds();
        }
        currentIndex++;
    });

    // 封面页的特殊逻辑 - restart情况
    document.addEventListener('bookRestarted', function() {
        // 书被重置，我们需要重置云效果
        currentIndex = 0;
        fadeInClouds();
        isRestart = true;
    });

    // 淡入云和控制按钮
    function fadeInClouds() {
        // 先确保元素在DOM中，且不是display:none
        viewport.style.display = 'block';
        document.querySelector('.cloud-controls').style.display = 'block';
        
        // 短暂延迟后触发淡入动画
        setTimeout(function() {
            viewport.style.opacity = '1';
            document.querySelector('.cloud-controls').style.opacity = '1';
        }, 50);
        
        cloudVisible = true;
    }

    // 淡出云和控制按钮
    function fadeOutClouds() {
        // 先触发淡出动画
        viewport.style.opacity = '0';
        document.querySelector('.cloud-controls').style.opacity = '0';
        
        // 动画完成后隐藏元素
        setTimeout(function() {
            viewport.style.display = 'none';
            document.querySelector('.cloud-controls').style.display = 'none';
        }, 800);
        
        cloudVisible = false;
    }

    // 页面加载后，检查初始状态
    setTimeout(function() {
        if (currentIndex === 0) {
            fadeInClouds();
        } else {
            fadeOutClouds();
        }
    }, 100);

    // 鼠标移动事件处理函数
    function onMouseMove(e) {
        worldYAngle = -(.5 - (e.clientX / window.innerWidth)) * 45;
        worldXAngle = (.5 - (e.clientY / window.innerHeight)) * 45;
        updateView();
    }
    
    // 触摸移动事件处理函数
    function onTouchMove(e) {
        if (e.touches.length === 1) {
            e.preventDefault();
            worldYAngle = -(.5 - (e.touches[0].clientX / window.innerWidth)) * 180;
            worldXAngle = (.5 - (e.touches[0].clientY / window.innerHeight)) * 180;
            updateView();
        }
    }

    // 鼠标滚轮事件处理函数
    function onMouseWheel(e) {
        e = e ? e : window.event;
        d = d - (e.detail ? e.detail * -5 : e.wheelDelta / 8);
        updateView();
        e.preventDefault();
    }

    // 生成云的函数
    function generate() {
        objects = [];
        layers = [];

        if (world.hasChildNodes()) {
            while (world.childNodes.length >= 1) {
                world.removeChild(world.firstChild);
            }
        }

        // 使用球面坐标创建云 - 更好的3D分布
        for (var j = 0; j < 6; j++) {
            objects.push(createCloud());
        }
    }

    // 创建单个云的函数
    function createCloud() {
        var div = document.createElement('div');
        div.className = 'cloudBase';
        
        // 使用球面坐标系统分布云朵
        var phi = Math.acos(-1 + (2 * Math.random())); 
        var theta = Math.random() * Math.PI * 2;
        
        // 基本半径
        var radius = (Math.random() * 0.5 + 0.5) * 400 * clusterFactor;
        
        // 添加水平偏移，使云朵向两侧分布而不是集中在中心
        var horizontalBias = Math.random() > 0.5 ? 1 : -1;
        var minOffset = 200;  // 最小偏移量
        var maxAdditionalOffset = 600;  // 最大额外偏移量
        var horizontalOffset = horizontalBias * (minOffset + Math.random() * maxAdditionalOffset);
        
        var verticalOffset = (Math.random() * 2 - 1) * 200;  // -200到200的随机偏移
       
       
        // 转换为笛卡尔坐标，加上水平偏移
        var x = radius * Math.sin(phi) * Math.cos(theta) + horizontalOffset;
        var y = radius * Math.sin(phi) * Math.sin(theta) + verticalOffset;
        var z = radius * Math.cos(phi);
        
        // 设置变换
        var t = 'translateX(' + x + 'px) translateY(' + y + 'px) translateZ(' + z + 'px)';
        div.style.transform = t;
        world.appendChild(div);
        
        // 为每个云添加云层
        var cloudCount = 2 + Math.round(Math.random() * 2); // 减少层数但增大尺寸
        for (var j = 0; j < cloudCount; j++) {
            // 使用IMG元素显示cloud.png
            var cloud = document.createElement('img');
            cloud.src = 'cloud.png';
            cloud.className = 'cloudLayer';
            cloud.style.opacity = 0;
            
            // 渐入效果
            var finalOpacity = 0.1 + Math.random() * 0.4; // 增加不透明度
            setTimeout(function(el, op) {
                return function() { el.style.opacity = op; };
            }(cloud, finalOpacity), 100 + Math.random() * 200);
            
            // 局部区域内的随机位置、角度和缩放
            var localX = 100 - (Math.random() * 200) * clusterFactor;
            var localY = 100 - (Math.random() * 200) * clusterFactor;
            var localZ = 50 - (Math.random() * 100) * clusterFactor;
            var a = Math.random() * 360;
            var s = 0.6 + Math.random() * 0.7; // Each cloud layer gets a random scaling factor
            
            // 保存数据用于动画
            cloud.data = {
                x: localX,
                y: localY,
                z: localZ,
                a: a,
                s: s,
                speed: 0.05 + 0.05 * Math.random() // 旋转速度
            };
            
            // 应用变换
            var transform = 'translateX(' + localX + 'px) translateY(' + localY + 'px) translateZ(' + localZ + 'px) rotateZ(' + a + 'deg) scale(' + s + ')';
            cloud.style.transform = transform;
            
            div.appendChild(cloud);
            layers.push(cloud);
        }
        
        return div;
    }

    // 更新视图的函数
    function updateView() {
        var transform = 'translateZ(' + d + 'px) rotateX(' + worldXAngle + 'deg) rotateY(' + worldYAngle + 'deg)';
        world.style.transform = transform;
    }
    
    // 添加更多云的函数
    function addMoreClouds() {
        for (var i = 0; i < 3; i++) {
            objects.push(createCloud());
        }
    }
    
    // 移除云的函数
    function removeClouds() {
        if (objects.length <= 3) {
            return;
        }
        
        for (var i = 0; i < 3; i++) {
            if (objects.length > 0) {
                var cloudBase = objects.pop();
                
                var childLayers = [];
                for (var j = layers.length - 1; j >= 0; j--) {
                    if (cloudBase.contains(layers[j])) {
                        childLayers.push(layers.splice(j, 1)[0]);
                    }
                }
                
                (function(base, cls) {
                    cls.forEach(function(layer) {
                        layer.style.transition = 'opacity 0.5s';
                        layer.style.opacity = 0;
                    });
                    
                    setTimeout(function() {
                        if (base.parentNode) {
                            base.parentNode.removeChild(base);
                        }
                    }, 500);
                })(cloudBase, childLayers);
            }
        }
    }
    
    // 调整云的聚集程度
    function adjustClustering(value) {
        clusterFactor = value / 100;
        clusterValueDisplay.textContent = value;
        generate();
    }

    // 更新动画的函数
    function update() {
        if (cloudVisible) {
        for (var j = 0; j < layers.length; j++) {
            var layer = layers[j];
            layer.data.a += layer.data.speed;
            
            var transform = 'translateX(' + layer.data.x + 'px) ' +
                          'translateY(' + layer.data.y + 'px) ' +
                          'translateZ(' + layer.data.z + 'px) ' +
                          'rotateY(' + (-worldYAngle) + 'deg) ' +
                          'rotateX(' + (-worldXAngle) + 'deg) ' +
                          'rotateZ(' + layer.data.a + 'deg) ' +
                          'scale(' + layer.data.s + ')';
            
            layer.style.transform = transform;
        }
    }

        requestAnimationFrame(update);
    }

    // 开始动画
    update();
    
    // 暴露需要的功能到全局作用域
    window.cloudApp = {
        addMoreClouds: addMoreClouds,
        removeClouds: removeClouds,
        adjustClustering: adjustClustering
    };
});