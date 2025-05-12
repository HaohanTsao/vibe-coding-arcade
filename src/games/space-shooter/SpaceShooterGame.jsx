import React, { useState, useEffect, useRef } from 'react';

const SpaceShooterGame = () => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  
  // Game state
  const gameStateRef = useRef({
    player: {
      x: 0,
      y: 0,
      width: 40,
      height: 40,
      color: '#4fc3f7'
    },
    lasers: [],
    asteroids: [],
    particles: [],
    powerups: [],
    enemySpawnTimer: 0,
    enemySpawnInterval: 60,
    powerupSpawnTimer: 0,
    powerupSpawnInterval: 300, // 每300幀生成一個道具
    bulletLevel: 1, // 子彈等級
    maxBulletLevel: 10, // 最大子彈等級
    animationFrameId: null,
    mousePosition: { x: 0, y: 0 },
    running: false,
    score: 0,
    lives: 3
  });
  
  // Initialize game
  const startGame = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const gameState = gameStateRef.current;
    
    // Set canvas dimensions
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    // Reset game state
    gameState.player.x = canvas.width / 2 - gameState.player.width / 2;
    gameState.player.y = canvas.height - gameState.player.height - 20;
    gameState.lasers = [];
    gameState.asteroids = [];
    gameState.particles = [];
    gameState.powerups = [];
    gameState.powerupSpawnTimer = 0;
    gameState.bulletLevel = 1;
    gameState.running = true;
    gameState.score = 0;
    gameState.lives = 3;
    
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    
    // Start game loop
    gameLoop();
  };
  
  // Main game loop
  const gameLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const gameState = gameStateRef.current;
    
    if (!gameState.running) return;
    
    // Clear canvas
    ctx.fillStyle = '#000033';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw stars background
    drawStars(ctx, canvas);
    
    // Update player position to follow mouse
    gameState.player.x = gameState.mousePosition.x - gameState.player.width / 2;
    
    // Keep player within canvas bounds
    gameState.player.x = Math.max(0, Math.min(canvas.width - gameState.player.width, gameState.player.x));
    
    // Draw player
    drawPlayer(ctx, gameState.player);
    
    // Spawn enemies
    gameState.enemySpawnTimer++;
    if (gameState.enemySpawnTimer >= gameState.enemySpawnInterval) {
      spawnAsteroid(canvas, gameState);
      gameState.enemySpawnTimer = 0;
      // Make game harder over time
      gameState.enemySpawnInterval = Math.max(10, gameState.enemySpawnInterval - 0.8);
      
      // 隨著時間推移，增加敵人數量
      if (gameState.score > 1000 && Math.random() > 0.7) {
        spawnAsteroid(canvas, gameState);
      }
      
      if (gameState.score > 3000 && Math.random() > 0.5) {
        spawnAsteroid(canvas, gameState);
      }
      
      if (gameState.score > 6000 && Math.random() > 0.3) {
        spawnAsteroid(canvas, gameState);
      }
    }
    
    // Spawn powerups
    gameState.powerupSpawnTimer++;
    if (gameState.powerupSpawnTimer >= gameState.powerupSpawnInterval) {
      spawnPowerup(canvas, gameState);
      gameState.powerupSpawnTimer = 0;
    }
    
    // Update and draw lasers
    updateLasers(canvas, gameState);
    
    // Update and draw asteroids
    updateAsteroids(canvas, gameState);
    
    // Update and draw particles
    updateParticles(canvas, gameState);
    
    // Update and draw powerups
    updatePowerups(canvas, gameState);
    
    // Check collisions
    checkCollisions(canvas, gameState);
    
    // Update score
    setScore(gameState.score);
    
    // Check game over
    if (gameState.lives <= 0) {
      gameState.running = false;
      setGameOver(true);
    }
    
    // Draw UI
    drawUI(ctx, canvas, gameState);
    
    // Continue game loop
    gameState.animationFrameId = requestAnimationFrame(gameLoop);
  };
  
  // Draw background stars
  const drawStars = (ctx, canvas) => {
    const time = Date.now() * 0.0005;
    for (let i = 0; i < 100; i++) {
      const x = Math.sin(i * 5.1 + time) * canvas.width / 2 + canvas.width / 2;
      const y = Math.cos(i * 5.2 + time) * canvas.height / 2 + canvas.height / 2;
      const size = Math.sin(i + time) * 1.5 + 1.5;
      const brightness = Math.sin(i * 0.2 + time) * 50 + 200;
      
      ctx.fillStyle = `rgba(${brightness}, ${brightness}, ${brightness}, 0.8)`;
      ctx.fillRect(x, y, size, size);
    }
  };
  
  // Draw player ship
  const drawPlayer = (ctx, player) => {
    // Ship body
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.closePath();
    ctx.fill();
    
    // Engine glow effect
    ctx.fillStyle = '#ff9800';
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2 - 10, player.y + player.height);
    ctx.lineTo(player.x + player.width / 2, player.y + player.height + 15 + Math.random() * 5);
    ctx.lineTo(player.x + player.width / 2 + 10, player.y + player.height);
    ctx.closePath();
    ctx.fill();
    
    // Shield effect
    ctx.strokeStyle = 'rgba(79, 195, 247, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width * 0.9, 0, Math.PI * 2);
    ctx.stroke();
  };
  
  // Shoot laser
  const shootLaser = (canvas, gameState) => {
    const player = gameState.player;
    const bulletColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
    
    // 根據子彈等級射擊不同數量和角度的雷射
    switch(true) {
      case (gameState.bulletLevel >= 10):
        // 10級: 全方位射擊 + 大型主砲
        // 大型主砲
        gameState.lasers.push({
          x: player.x + player.width / 2 - 5,
          y: player.y - 10,
          width: 10,
          height: 30,
          color: '#ff5722',
          speed: 12,
          speedX: 0,
          damage: 5
        });
        
        // 環形射擊
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2;
          gameState.lasers.push({
            x: player.x + player.width / 2 - 2,
            y: player.y + player.height / 2,
            width: 4,
            height: 15,
            color: bulletColor,
            speed: 8 * Math.cos(angle + Math.PI/2),
            speedX: 8 * Math.sin(angle + Math.PI/2),
            damage: 1
          });
        }
        break;
        
      case (gameState.bulletLevel >= 8):
        // 8-9級: 七發前向散射 + 兩側防禦
        // 主射
        for (let i = -3; i <= 3; i++) {
          gameState.lasers.push({
            x: player.x + player.width / 2 - 2,
            y: player.y,
            width: 4,
            height: 20,
            color: bulletColor,
            speed: 10,
            speedX: i * 1.2,
            damage: 1
          });
        }
        
        // 側向防禦
        gameState.lasers.push({
          x: player.x - 5,
          y: player.y + player.height / 2,
          width: 15,
          height: 4,
          color: bulletColor,
          speed: 0,
          speedX: -8,
          damage: 1
        });
        
        gameState.lasers.push({
          x: player.x + player.width - 10,
          y: player.y + player.height / 2,
          width: 15,
          height: 4,
          color: bulletColor,
          speed: 0,
          speedX: 8,
          damage: 1
        });
        break;
        
      case (gameState.bulletLevel >= 6):
        // 6-7級: 五發前向散射
        for (let i = -2; i <= 2; i++) {
          gameState.lasers.push({
            x: player.x + player.width / 2 - 2,
            y: player.y,
            width: 4,
            height: 20,
            color: bulletColor,
            speed: 10,
            speedX: i * 1.5,
            damage: 1
          });
        }
        break;
        
      case (gameState.bulletLevel >= 4):
        // 4-5級: 四發子彈 (直射+斜射+側射)
        gameState.lasers.push({
          x: player.x + player.width / 2 - 2,
          y: player.y - 5,
          width: 4,
          height: 20,
          color: bulletColor,
          speed: 11,
          speedX: 0,
          damage: 1
        });
        
        gameState.lasers.push({
          x: player.x + 5,
          y: player.y + 5,
          width: 4,
          height: 20,
          color: bulletColor,
          speed: 9,
          speedX: -1.5,
          damage: 1
        });
        
        gameState.lasers.push({
          x: player.x + player.width - 10,
          y: player.y + 5,
          width: 4,
          height: 20,
          color: bulletColor,
          speed: 9,
          speedX: 1.5,
          damage: 1
        });
        
        // 後方子彈 (防禦用)
        gameState.lasers.push({
          x: player.x + player.width / 2 - 2,
          y: player.y + player.height - 5,
          width: 4,
          height: 15,
          color: bulletColor,
          speed: -8,
          speedX: 0,
          damage: 1
        });
        break;
        
      case (gameState.bulletLevel === 3):
        // 三發 (直射+斜射)
        gameState.lasers.push({
          x: player.x + player.width / 2 - 2,
          y: player.y,
          width: 4,
          height: 20,
          color: bulletColor,
          speed: 10,
          speedX: 0,
          damage: 1
        });
        
        gameState.lasers.push({
          x: player.x + player.width / 4 - 2,
          y: player.y + 5,
          width: 4,
          height: 20,
          color: bulletColor,
          speed: 9,
          speedX: -1,
          damage: 1
        });
        
        gameState.lasers.push({
          x: player.x + player.width * 3/4 - 2,
          y: player.y + 5,
          width: 4,
          height: 20,
          color: bulletColor,
          speed: 9,
          speedX: 1,
          damage: 1
        });
        break;
        
      case (gameState.bulletLevel === 2):
        // 雙發直射
        gameState.lasers.push({
          x: player.x + player.width / 4 - 2,
          y: player.y + 5,
          width: 4,
          height: 20,
          color: bulletColor,
          speed: 10,
          speedX: 0,
          damage: 1
        });
        
        gameState.lasers.push({
          x: player.x + player.width * 3/4 - 2,
          y: player.y + 5,
          width: 4,
          height: 20,
          color: bulletColor,
          speed: 10,
          speedX: 0,
          damage: 1
        });
        break;
        
      default:
        // 單發直射
        gameState.lasers.push({
          x: player.x + player.width / 2 - 2,
          y: player.y,
          width: 4,
          height: 20,
          color: bulletColor,
          speed: 10,
          speedX: 0,
          damage: 1
        });
        break;
    }
    
    // Add muzzle flash particles
    for (let i = 0; i < Math.min(5 + gameState.bulletLevel, 20); i++) {
      gameState.particles.push({
        x: player.x + player.width / 2,
        y: player.y,
        size: Math.random() * 5 + 3,
        color: `hsl(${Math.random() * 60 + 40}, 100%, 60%)`,
        speedX: (Math.random() - 0.5) * 4,
        speedY: Math.random() * 2 - 3,
        life: 30
      });
    }
  };
  
  // Spawn asteroid
  const spawnAsteroid = (canvas, gameState) => {
    const size = Math.random() * 30 + 20;
    const isSpecial = Math.random() < 0.08; // 8%的機率生成特殊石頭
    
    // Create asteroid
    gameState.asteroids.push({
      x: Math.random() * (canvas.width - size),
      y: -size,
      width: size,
      height: size,
      color: isSpecial ? '#9c27b0' : `hsl(${Math.random() * 60 + 20}, 70%, 40%)`, // 特殊石頭是紫色
      speedX: (Math.random() - 0.5) * 2,
      speedY: Math.random() * 2 + (isSpecial ? 1.5 : 1), // 特殊石頭掉落更快
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * 0.1,
      isSpecial: isSpecial
    });
  };
  
  // Spawn powerup
  const spawnPowerup = (canvas, gameState) => {
    const size = 20;
    
    // 只要不是最大等級，就有機會生成道具
    if (gameState.bulletLevel < gameState.maxBulletLevel) {
      gameState.powerups.push({
        x: Math.random() * (canvas.width - size),
        y: -size,
        width: size,
        height: size,
        color: '#ffeb3b', // 黃色
        speedY: 1.5,
        rotation: 0,
        rotationSpeed: 0.05,
        type: 'bullet'
      });
    }
  };
  
  // Update and draw powerups
  const updatePowerups = (canvas, gameState) => {
    const ctx = canvas.getContext('2d');
    
    for (let i = gameState.powerups.length - 1; i >= 0; i--) {
      const powerup = gameState.powerups[i];
      
      // Move powerup
      powerup.y += powerup.speedY;
      powerup.rotation += powerup.rotationSpeed;
      
      // Remove if out of bounds
      if (powerup.y > canvas.height) {
        gameState.powerups.splice(i, 1);
        continue;
      }
      
      // Draw powerup
      ctx.save();
      ctx.translate(powerup.x + powerup.width / 2, powerup.y + powerup.height / 2);
      ctx.rotate(powerup.rotation);
      
      // Draw powerup body
      ctx.fillStyle = powerup.color;
      
      // Draw star shape
      ctx.beginPath();
      for (let j = 0; j < 5; j++) {
        const outerRadius = powerup.width / 2;
        const innerRadius = powerup.width / 4;
        const outerAngle = j * Math.PI * 2 / 5;
        const innerAngle = outerAngle + Math.PI / 5;
        
        if (j === 0) {
          ctx.moveTo(Math.cos(outerAngle) * outerRadius, Math.sin(outerAngle) * outerRadius);
        } else {
          ctx.lineTo(Math.cos(outerAngle) * outerRadius, Math.sin(outerAngle) * outerRadius);
        }
        
        ctx.lineTo(Math.cos(innerAngle) * innerRadius, Math.sin(innerAngle) * innerRadius);
      }
      ctx.closePath();
      ctx.fill();
      
      // Add glow effect
      ctx.shadowBlur = 10;
      ctx.shadowColor = powerup.color;
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // Draw "B" in the center
      ctx.fillStyle = '#000';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('B', 0, 0);
      
      ctx.restore();
      
      // Add trailing particles
      if (Math.random() > 0.8) {
        gameState.particles.push({
          x: powerup.x + powerup.width / 2,
          y: powerup.y + powerup.height,
          size: Math.random() * 3 + 1,
          color: powerup.color,
          speedX: (Math.random() - 0.5) * 1,
          speedY: Math.random() * 1,
          life: 20
        });
      }
    }
  };
  
  // Update and draw lasers
  const updateLasers = (canvas, gameState) => {
    const ctx = canvas.getContext('2d');
    
    for (let i = gameState.lasers.length - 1; i >= 0; i--) {
      const laser = gameState.lasers[i];
      
      // Move laser
      laser.y -= laser.speed;
      
      // 如果有水平速度，應用它
      if (laser.speedX) {
        laser.x += laser.speedX;
      }
      
      // Remove if out of bounds
      if (laser.y + laser.height < 0 || 
          laser.x + laser.width < 0 || 
          laser.x > canvas.width) {
        gameState.lasers.splice(i, 1);
        continue;
      }
      
      // Draw laser with glow effect
      ctx.shadowBlur = 10;
      ctx.shadowColor = laser.color;
      ctx.fillStyle = laser.color;
      ctx.fillRect(laser.x, laser.y, laser.width, laser.height);
      
      // Add trail particles
      if (Math.random() > 0.7) {
        gameState.particles.push({
          x: laser.x + laser.width / 2,
          y: laser.y + laser.height,
          size: Math.random() * 3 + 1,
          color: laser.color,
          speedX: (Math.random() - 0.5) * 1,
          speedY: Math.random() * 1,
          life: 20
        });
      }
      
      // Reset shadow
      ctx.shadowBlur = 0;
    }
  };
  
  // Update and draw asteroids
  const updateAsteroids = (canvas, gameState) => {
    const ctx = canvas.getContext('2d');
    
    for (let i = gameState.asteroids.length - 1; i >= 0; i--) {
      const asteroid = gameState.asteroids[i];
      
      // Move asteroid
      asteroid.x += asteroid.speedX;
      asteroid.y += asteroid.speedY;
      asteroid.rotation += asteroid.rotationSpeed;
      
      // Bounce off walls
      if (asteroid.x < 0 || asteroid.x + asteroid.width > canvas.width) {
        asteroid.speedX *= -1;
      }
      
      // Remove if out of bounds
      if (asteroid.y > canvas.height) {
        // 如果是特殊石頭並掉落到底部
        if (asteroid.isSpecial) {
          // 如果子彈等級大於1，降低子彈等級
          if (gameState.bulletLevel > 1) {
            gameState.bulletLevel = Math.max(1, gameState.bulletLevel - 1);
            
            // 顯示警告效果
            for (let j = 0; j < 30; j++) {
              gameState.particles.push({
                x: asteroid.x + asteroid.width / 2,
                y: canvas.height,
                size: Math.random() * 6 + 2,
                color: '#ff0000',
                speedX: (Math.random() - 0.5) * 5,
                speedY: -Math.random() * 5,
                life: Math.random() * 40 + 20
              });
            }
          } else {
            // 如果子彈等級已經是1，扣除生命值
            gameState.lives--;
            
            // 顯示爆炸效果
            createExplosion(
              asteroid.x + asteroid.width / 2,
              canvas.height,
              '#ff0000',
              gameState,
              30
            );
          }
        }
        
        gameState.asteroids.splice(i, 1);
        continue;
      }
      
      // Draw asteroid
      ctx.save();
      ctx.translate(asteroid.x + asteroid.width / 2, asteroid.y + asteroid.height / 2);
      ctx.rotate(asteroid.rotation);
      
      // Draw asteroid body
      ctx.fillStyle = asteroid.color;
      ctx.beginPath();
      for (let j = 0; j < 8; j++) {
        const radius = (asteroid.width / 2) * (0.8 + Math.sin(j * 5) * 0.2);
        const angle = j * Math.PI / 4;
        if (j === 0) {
          ctx.moveTo(radius * Math.cos(angle), radius * Math.sin(angle));
        } else {
          ctx.lineTo(radius * Math.cos(angle), radius * Math.sin(angle));
        }
      }
      ctx.closePath();
      ctx.fill();
      
      // 如果是特殊石頭，添加特殊效果和標誌
      if (asteroid.isSpecial) {
        // 添加輪廓光暈
        ctx.strokeStyle = '#e040fb';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // 添加內部圖案
        ctx.fillStyle = '#e1bee7';
        ctx.beginPath();
        ctx.arc(0, 0, asteroid.width * 0.25, 0, Math.PI * 2);
        ctx.fill();
        
        // 添加閃光效果
        ctx.fillStyle = '#ffffff';
        const time = Date.now() * 0.01;
        const flashSize = (Math.sin(time) * 0.15 + 0.15) * asteroid.width;
        ctx.beginPath();
        ctx.arc(0, 0, flashSize, 0, Math.PI * 2);
        ctx.fill();
        
        // 繪製降級圖標
        ctx.fillStyle = '#000';
        ctx.font = Math.floor(asteroid.width * 0.3) + 'px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('↓', 0, 0);
      } else {
        // 正常石頭的隕石坑
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        for (let j = 0; j < 3; j++) {
          const craterX = (Math.random() - 0.5) * asteroid.width * 0.5;
          const craterY = (Math.random() - 0.5) * asteroid.height * 0.5;
          const craterSize = Math.random() * asteroid.width * 0.2 + asteroid.width * 0.1;
          ctx.beginPath();
          ctx.arc(craterX, craterY, craterSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // 如果是特殊石頭，添加尾跡粒子
      if (asteroid.isSpecial && Math.random() > 0.5) {
        gameState.particles.push({
          x: asteroid.x + asteroid.width / 2,
          y: asteroid.y + asteroid.height,
          size: Math.random() * 4 + 2,
          color: '#e040fb',
          speedX: (Math.random() - 0.5) * 1,
          speedY: Math.random() * 2 + 1,
          life: 20
        });
      }
      
      ctx.restore();
    }
  };
  
  // Update and draw particles
  const updateParticles = (canvas, gameState) => {
    const ctx = canvas.getContext('2d');
    
    for (let i = gameState.particles.length - 1; i >= 0; i--) {
      const particle = gameState.particles[i];
      
      // Move particle
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      particle.life--;
      
      // Remove if dead
      if (particle.life <= 0) {
        gameState.particles.splice(i, 1);
        continue;
      }
      
      // Draw particle with glow
      ctx.globalAlpha = particle.life / 30;
      ctx.shadowBlur = 5;
      ctx.shadowColor = particle.color;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Reset shadow and alpha
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
  };
  
  // Check collisions between lasers and asteroids
  const checkCollisions = (canvas, gameState) => {
    for (let i = gameState.lasers.length - 1; i >= 0; i--) {
      const laser = gameState.lasers[i];
      
      for (let j = gameState.asteroids.length - 1; j >= 0; j--) {
        const asteroid = gameState.asteroids[j];
        
        // Simple collision detection
        if (
          laser.x < asteroid.x + asteroid.width &&
          laser.x + laser.width > asteroid.x &&
          laser.y < asteroid.y + asteroid.height &&
          laser.y + laser.height > asteroid.y
        ) {
          // Remove laser
          gameState.lasers.splice(i, 1);
          
          // Create explosion
          createExplosion(
            asteroid.x + asteroid.width / 2,
            asteroid.y + asteroid.height / 2,
            asteroid.color,
            gameState,
            20
          );
          
          // Remove asteroid
          gameState.asteroids.splice(j, 1);
          
          // 增加分數，特殊石頭分數更多
          gameState.score += asteroid.isSpecial ? 250 : 100;
          
          break;
        }
      }
    }
    
    // Check player collision with asteroids
    if (!gameOver) {
      for (let i = gameState.asteroids.length - 1; i >= 0; i--) {
        const asteroid = gameState.asteroids[i];
        const player = gameState.player;
        
        // Simple collision detection
        if (
          player.x < asteroid.x + asteroid.width * 0.7 &&
          player.x + player.width > asteroid.x + asteroid.width * 0.3 &&
          player.y < asteroid.y + asteroid.height * 0.7 &&
          player.y + player.height > asteroid.y + asteroid.height * 0.3
        ) {
          // Create explosion
          createExplosion(
            player.x + player.width / 2,
            player.y + player.height / 2,
            asteroid.isSpecial ? '#e040fb' : '#ff5722', // Purple for special, orange-red for regular
            gameState,
            30
          );
          
          // Remove asteroid
          gameState.asteroids.splice(i, 1);
          
          // Check if the bullet level can be reduced
          if (gameState.bulletLevel > 1) {
            // Reduce bullet level
            gameState.bulletLevel--;
            
            // Show warning effect
            for (let j = 0; j < 20; j++) {
              gameState.particles.push({
                x: player.x + player.width / 2,
                y: player.y + player.height / 2,
                size: Math.random() * 4 + 2,
                color: asteroid.isSpecial ? '#e040fb' : '#ff9800', // Purple for special, orange for regular
                speedX: (Math.random() - 0.5) * 4,
                speedY: (Math.random() - 0.5) * 4,
                life: Math.random() * 30 + 20
              });
            }
          } else {
            // If bullet level is already 1, lose a life
            gameState.lives--;
          }
          
          break;
        }
      }
    }
    
    // Check player collision with powerups
    for (let i = gameState.powerups.length - 1; i >= 0; i--) {
      const powerup = gameState.powerups[i];
      const player = gameState.player;
      
      // Simple collision detection
      if (
        player.x < powerup.x + powerup.width &&
        player.x + player.width > powerup.x &&
        player.y < powerup.y + powerup.height &&
        player.y + player.height > powerup.y
      ) {
        // Apply powerup effect
        if (powerup.type === 'bullet' && gameState.bulletLevel < gameState.maxBulletLevel) {
          gameState.bulletLevel++;
          
          // Create a collection effect
          createExplosion(
            powerup.x + powerup.width / 2,
            powerup.y + powerup.height / 2,
            '#ffeb3b',
            gameState,
            15
          );
        }
        
        // Remove powerup
        gameState.powerups.splice(i, 1);
      }
    }
  };
  
  // Create explosion particles
  const createExplosion = (x, y, color, gameState, count) => {
    const hue = color.startsWith('#') ? Math.random() * 360 : parseInt(color) || Math.random() * 360;
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      
      gameState.particles.push({
        x: x,
        y: y,
        size: Math.random() * 5 + 2,
        color: color.startsWith('#') ? color : `hsl(${hue}, 100%, 60%)`,
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed,
        life: Math.random() * 30 + 20
      });
    }
  };
  
  // Draw UI
  const drawUI = (ctx, canvas, gameState) => {
    // Score
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`分數: ${gameState.score}`, 20, 30);
    
    // Lives
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`生命: ${gameState.lives}`, canvas.width - 20, 30);
    
    // Bullet level
    ctx.fillStyle = '#ffeb3b';
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`火力等級: ${gameState.bulletLevel}`, 20, 60);
  };
  
  // Handle mouse/touch movement
  const handleMouseMove = (e) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    gameStateRef.current.mousePosition = { x, y };
  };
  
  // Handle touch movement
  const handleTouchMove = (e) => {
    if (!canvasRef.current) return;
    e.preventDefault();
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    gameStateRef.current.mousePosition = { x, y };
  };
  
  // Handle canvas click/tap (shooting)
  const handleCanvasClick = () => {
    if (gameStateRef.current.running) {
      shootLaser(canvasRef.current, gameStateRef.current);
    } else if (gameOver) {
      startGame();
    } else if (!gameStarted) {
      startGame();
    }
  };
  
  // Clean up game resources
  const cleanUp = () => {
    if (gameStateRef.current.animationFrameId) {
      cancelAnimationFrame(gameStateRef.current.animationFrameId);
    }
    gameStateRef.current.running = false;
  };
  
  // Set up event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    
    if (canvas) {
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('click', handleCanvasClick);
      canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
      canvas.addEventListener('touchstart', handleCanvasClick);
      
      // Start game loop animation
      const resizeObserver = new ResizeObserver(() => {
        if (canvas) {
          canvas.width = canvas.clientWidth;
          canvas.height = canvas.clientHeight;
        }
      });
      
      resizeObserver.observe(canvas);
    }
    
    return () => {
      cleanUp();
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('click', handleCanvasClick);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchstart', handleCanvasClick);
      }
    };
  }, []);
  
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-gray-900 p-4">
      {!gameStarted && (
        <div className="absolute z-10 flex flex-col items-center justify-center bg-gray-800 bg-opacity-80 p-6 rounded-lg">
          <h1 className="text-3xl font-bold text-blue-400 mb-4">太空射擊遊戲</h1>
          <p className="text-white mb-4">使用滑鼠控制飛船，點擊射擊小行星</p>
          <p className="text-yellow-300 mb-2">收集星形道具提升火力等級！最高到10級！</p>
          <p className="text-purple-300 mb-4">小心紫色陨石！它會降低你的火力等級！</p>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none"
            onClick={startGame}
          >
            開始遊戲
          </button>
        </div>
      )}
      
      {gameOver && (
        <div className="absolute z-10 flex flex-col items-center justify-center bg-gray-800 bg-opacity-80 p-6 rounded-lg">
          <h1 className="text-3xl font-bold text-red-500 mb-4">遊戲結束</h1>
          <p className="text-white mb-2">你的分數: {score}</p>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none mt-4"
            onClick={startGame}
          >
            再玩一次
          </button>
        </div>
      )}
      
      <div className="w-full max-w-3xl">
        <canvas
          ref={canvasRef}
          className="w-full h-96 rounded-lg shadow-lg"
          style={{ touchAction: 'none' }}
        />
      </div>
    </div>
  );
};

export default SpaceShooterGame;