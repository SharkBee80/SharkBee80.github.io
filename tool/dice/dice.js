class DiceGame {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.dice = null;
        this.controls = null;
        this.isRolling = false;
        this.rollHistory = [];
        
        this.init();
        this.setupEventListeners();
        this.animate();
    }

    init() {
        // 创建场景
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);

        // 创建相机
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        // 调整相机位置，适合UI在上、场景在下的布局
        this.camera.position.set(8, 6, 8);
        // 相机朝向色子中心点（地面上的色子）
        this.camera.lookAt(0, 5, 0);    

        // 创建渲染器
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        document.getElementById('three-container').appendChild(this.renderer.domElement);

        // 固定相机位置，不需要轨道控制器
        // 移除了复杂的3D场景控制

        // 添加照明
        this.setupLighting();

        // 创建地面
        //this.createGround();

        // 创建色子
        this.createDice();

        // 处理窗口大小调整
        window.addEventListener('resize', () => this.onWindowResize(), false);
    }

    setupLighting() {
        // 简单的环境光
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // 主光源
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        this.scene.add(directionalLight);
    }

    createGround() {
        // 创建简单的地面
        const groundGeometry = new THREE.PlaneGeometry(10, 10);
        const groundMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x333333
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -2;
        ground.receiveShadow = true;
        this.scene.add(ground);
    }

    createDice() {
        // 创建色子几何体
        const diceGeometry = new THREE.BoxGeometry(2, 2, 2);
        
        // 创建色子的6个面的纹理
        const materials = [];
        const diceTextures = this.createDiceTextures();
        
        for (let i = 0; i < 6; i++) {
            materials.push(new THREE.MeshLambertMaterial({ 
                map: diceTextures[i],
                color: 0xffffff
            }));
        }

        // 创建色子网格
        this.dice = new THREE.Mesh(diceGeometry, materials);
        // 调整色子位置，让它平放在地面上
        // 地面在y=-2，色子高度为2，所以色子中心应该在y=-1
        this.dice.position.set(0, -1, 0);
        this.dice.castShadow = true;
        this.dice.receiveShadow = true;
        
        // 添加边框线条
        const edges = new THREE.EdgesGeometry(diceGeometry);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
        const wireframe = new THREE.LineSegments(edges, lineMaterial);
        this.dice.add(wireframe);
        
        this.scene.add(this.dice);
        
        // 设置初始随机状态
        const initialResult = this.calculateDiceResult();
        this.setDiceRotationForResult(initialResult);
    }

    createDiceTextures() {
        const textures = [];

        // 为每个面（1-6点）创建纹理
        for (let i = 1; i <= 6; i++) {
            // 为每个面创建独立的canvas
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 256;
            const ctx = canvas.getContext('2d');
            
            // 清除画布
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 256, 256);
            
            // 绘制边框
            ctx.strokeStyle = '#cccccc';
            ctx.lineWidth = 4;
            ctx.strokeRect(8, 8, 240, 240);
            
            // 绘制圆点，1点使用红色点，其他使用黑色点
            if (i === 1) {
                ctx.fillStyle = '#ff4444'; // 1点使用红色点
            } else {
                ctx.fillStyle = '#000000'; // 其他点数使用黑色点
            }
            const dotSize = 20;
            const positions = this.getDotPositions(i);
            
            positions.forEach(pos => {
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, dotSize, 0, Math.PI * 2);
                ctx.fill();
            });

            // 创建纹理
            const texture = new THREE.CanvasTexture(canvas);
            texture.needsUpdate = true;
            textures.push(texture);
        }

        return textures;
    }

    getDotPositions(number) {
        const positions = [];
        const margin = 64;
        const center = 128;
        
        switch (number) {
            case 1:
                positions.push({ x: center, y: center });
                break;
            case 2:
                positions.push({ x: margin, y: margin });
                positions.push({ x: 256 - margin, y: 256 - margin });
                break;
            case 3:
                positions.push({ x: margin, y: margin });
                positions.push({ x: center, y: center });
                positions.push({ x: 256 - margin, y: 256 - margin });
                break;
            case 4:
                positions.push({ x: margin, y: margin });
                positions.push({ x: 256 - margin, y: margin });
                positions.push({ x: margin, y: 256 - margin });
                positions.push({ x: 256 - margin, y: 256 - margin });
                break;
            case 5:
                positions.push({ x: margin, y: margin });
                positions.push({ x: 256 - margin, y: margin });
                positions.push({ x: center, y: center });
                positions.push({ x: margin, y: 256 - margin });
                positions.push({ x: 256 - margin, y: 256 - margin });
                break;
            case 6:
                positions.push({ x: margin, y: margin });
                positions.push({ x: 256 - margin, y: margin });
                positions.push({ x: margin, y: center });
                positions.push({ x: 256 - margin, y: center });
                positions.push({ x: margin, y: 256 - margin });
                positions.push({ x: 256 - margin, y: 256 - margin });
                break;
        }
        
        return positions;
    }





    setupEventListeners() {
        document.getElementById('rollDice').addEventListener('click', () => this.rollDice());
        document.getElementById('resetDice').addEventListener('click', () => this.resetDice());
    }

    rollDice() {
        if (this.isRolling) return;
        
        this.isRolling = true;
        const rollButton = document.getElementById('rollDice');
        rollButton.innerHTML = '<span class="loading"></span> 抛掷中...';
        rollButton.disabled = true;

        // 在动画开始时就确定最终结果
        const finalResult = this.calculateDiceResult();
        
        // 根据最终结果计算目标旋转角度
        const targetRotation = this.getRotationForResult(finalResult);
        
        // 随机设置色子的初始旋转（加上额外的旋转以显示随机性）
        const extraRotations = 4; // 额外旋转4圈
        const targetRotationX = targetRotation.x + Math.PI * 2 * extraRotations;
        const targetRotationY = targetRotation.y + Math.PI * 2 * extraRotations;
        const targetRotationZ = targetRotation.z + Math.PI * 2 * extraRotations;

        // 抛掷动画
        const startTime = Date.now();
        const duration = 2000; // 2秒动画
        const startPosition = this.dice.position.clone();
        const startRotation = {
            x: this.dice.rotation.x,
            y: this.dice.rotation.y,
            z: this.dice.rotation.z
        };
        const maxHeight = 6;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 使用缓动函数
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            // 旋转动画 - 逐渐达到最终结果对应的角度
            this.dice.rotation.x = startRotation.x + (targetRotationX - startRotation.x) * easeOut;
            this.dice.rotation.y = startRotation.y + (targetRotationY - startRotation.y) * easeOut;
            this.dice.rotation.z = startRotation.z + (targetRotationZ - startRotation.z) * easeOut;
            
            // 抛物线运动
            const height = Math.sin(progress * Math.PI) * maxHeight;
            this.dice.position.y = startPosition.y + height;
            
            // 添加一些随机的水平移动
            if (progress < 0.5) {
                this.dice.position.x = startPosition.x + Math.sin(progress * Math.PI * 4) * 0.5;
                this.dice.position.z = startPosition.z + Math.cos(progress * Math.PI * 4) * 0.5;
            } else {
                // 后半段回到中心
                const backProgress = (progress - 0.5) * 2;
                this.dice.position.x = startPosition.x * (1 - backProgress);
                this.dice.position.z = startPosition.z * (1 - backProgress);
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // 动画结束，传递预先确定的结果
                this.finalizeDiceRoll(finalResult);
            }
        };

        animate();
    }

    finalizeDiceRoll(result) {
        // 使用传入的结果，而不是重新计算
        
        // 更新UI
        this.updateUI(result);
        
        // 重置状态
        this.isRolling = false;
        const rollButton = document.getElementById('rollDice');
        rollButton.innerHTML = '抛色子';
        rollButton.disabled = false;

        // 将色子放回地面上（平放位置）并设置最终旋转
        this.dice.position.set(0, -1, 0);
        // 设置最终的精确旋转角度，确保结果准确
        this.setDiceRotationForResult(result);
    }

    calculateDiceResult() {
        // 随机生成1-6的点数
        return Math.floor(Math.random() * 6) + 1;
    }

    getRotationForResult(result) {
        // 返回结果对应的旋转角度对象
        switch(result) {
            case 1: // 1点面朝上 (-X 面)
                return { x: 0, y: 0, z: Math.PI / 2 };
            case 2: // 2点面朝上 (+X 面)
                return { x: 0, y: 0, z: -Math.PI / 2 };
            case 3: // 3点面朝上 (+Y 面)
                return { x: 0, y: 0, z: 0 };
            case 4: // 4点面朝上 (-Y 面)
                return { x: Math.PI, y: 0, z: 0 };
            case 5: // 5点面朝上 (+Z 面)
                return { x: -Math.PI / 2, y: 0, z: 0 };
            case 6: // 6点面朝上 (-Z 面)
                return { x: Math.PI / 2, y: 0, z: 0 };
            default:
                return { x: 0, y: 0, z: 0 };
        }
    }

    setDiceRotationForResult(result) {
        // 根据结果设置色子旋转，让对应点数的面朝上
        // Three.js BoxGeometry 面的映射顺序：+X(0), -X(1), +Y(2), -Y(3), +Z(4), -Z(5)
        // 数组索引对应: 1点(0), 2点(1), 3点(2), 4点(3), 5点(4), 6点(5)
        switch(result) {
            case 1: // 1点面朝上 (-X 面)
                this.dice.rotation.set(0, 0, Math.PI / 2);
                break;
            case 2: // 2点面朝上 (+X 面)
                this.dice.rotation.set(0, 0, -Math.PI / 2);
                break;
            case 3: // 3点面朝上 (+Y 面)
                this.dice.rotation.set(0, 0, 0);
                break;
            case 4: // 4点面朝上 (-Y 面)
                this.dice.rotation.set(Math.PI, 0, 0);
                break;
            case 5: // 5点面朝上 (+Z 面)
                this.dice.rotation.set(-Math.PI / 2, 0, 0);
                break;
            case 6: // 6点面朝上 (-Z 面)
                this.dice.rotation.set(Math.PI / 2, 0, 0);
                break;
            default:
                this.dice.rotation.set(0, 0, 0);
        }
    }

    updateUI(result) {
        // 更新当前分数
        const currentScoreElement = document.getElementById('currentScore');
        currentScoreElement.textContent = result;
        currentScoreElement.classList.add('score-animate');
        
        setTimeout(() => {
            currentScoreElement.classList.remove('score-animate');
        }, 600);

        // 更新历史记录
        this.rollHistory.push(result);
        if (this.rollHistory.length > 10) {
            this.rollHistory = this.rollHistory.slice(-10);
        }
        
        document.getElementById('rollHistory').textContent = this.rollHistory.join(', ');

        // 更新结果提示
        const resultText = document.getElementById('result').querySelector('p');
        const messages = [
            '太棒了！',
            '不错的运气！',
            '继续加油！',
            '运气不错哦！',
            '再来一次吧！'
        ];
        resultText.textContent = `${messages[Math.floor(Math.random() * messages.length)]} 你掷出了 ${result} 点！`;
    }

    resetDice() {
        if (this.isRolling) return;

        // 重置色子位置和旋转（平放在地面上）
        this.dice.position.set(0, -1, 0);
        // 重置为随机初始状态
        const randomResult = this.calculateDiceResult();
        this.setDiceRotationForResult(randomResult);

        // 重置UI，显示随机初始点数
        document.getElementById('currentScore').textContent = randomResult;
        document.getElementById('rollHistory').textContent = '';
        document.getElementById('result').querySelector('p').textContent = '点击"抛色子"开始游戏！';
        
        // 清空历史记录
        this.rollHistory = [];

        // 添加重置动画效果
        this.dice.scale.set(0.1, 0.1, 0.1);
        const startTime = Date.now();
        const duration = 500;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const scale = 0.1 + (0.9 * progress);
            
            this.dice.scale.set(scale, scale, scale);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // 固定视角，无需更新控制器
        // 移除旋转动画，让色子完全静止地平放在地面上
        
        // 渲染场景
        this.renderer.render(this.scene, this.camera);
    }
}

// 等待DOM加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new DiceGame();
});