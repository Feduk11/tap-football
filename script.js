// ====================== FOOTBALL TAP - ПОЛНЫЙ КОД ======================

// Telegram Web App
let tg = window.Telegram?.WebApp;

// Данные игры
let gameState = {
    coins: 1000,
    level: 1,
    damagePerTap: 1,
    energyPerTap: 1,
    energy: 100,
    maxEnergy: 100,
    currentBoss: 1,
    totalTaps: 0,
    
    balls: [
        { 
            id: 'nike', 
            name: 'Nike Ball', 
            owned: true, 
            equipped: true, 
            damage: 1, 
            energyCost: 1,
            icon: 'https://cdn-icons-png.flaticon.com/128/947/947416.png'
        },
        { 
            id: 'adidas', 
            name: 'Adidas Ball', 
            owned: false, 
            equipped: false, 
            damage: 2, 
            energyCost: 2,
            icon: 'https://cdn-icons-png.flaticon.com/128/3048/3048120.png',
            price: 500
        }
    ],
    
    bosses: [
        { id: 1, name: "Ворота 1", hp: 100, maxHp: 100, reward: 50, defeated: false },
        { id: 2, name: "Ворота 2", hp: 500, maxHp: 500, reward: 250, defeated: false }
    ],
    
    upgrades: {
        damage: { level: 1, cost: 100 },
        energy: { level: 1, cost: 200 },
        reward: { level: 1, cost: 300 }
    }
};

// ====================== ИНИЦИАЛИЗАЦИЯ ======================

function initGame() {
    console.log('=== FOOTBALL TAP START ===');
    
    // Инициализация Telegram
    if (tg) {
        try {
            tg.expand();
            document.body.classList.add('telegram-webapp');
        } catch (e) {
            console.log('Ошибка Telegram:', e);
        }
    }
    
    // Загрузка сохранения
    loadGame();
    
    // Настройка игры
    updateUI();
    setupShop();
    setupUpgrades();
    setupBosses();
    setupTap();
    setupGoalImage();
    
    // Восстановление энергии
    setInterval(() => {
        if (gameState.energy < gameState.maxEnergy) {
            gameState.energy += 2;
            if (gameState.energy > gameState.maxEnergy) {
                gameState.energy = gameState.maxEnergy;
            }
            updateUI();
        }
    }, 1000);
    
    console.log('Игра инициализирована!');
}

// ====================== ЗАГРУЗКА КАРТИНКИ ВОРОТ ======================

function setupGoalImage() {
    const goal = document.getElementById('goal');
    if (!goal) return;
    
    // Проверяем несколько источников картинок
    const imageUrls = [
        'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=800&auto=format&fit=crop'
    ];
    
    let currentIndex = 0;
    
    function tryLoadImage(index) {
        if (index >= imageUrls.length) {
            // Если все картинки не загрузились, используем градиент
            goal.style.background = 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), linear-gradient(45deg, #1a1a1a, #333333)';
            goal.querySelector('.goal-placeholder').style.display = 'block';
            return;
        }
        
        const img = new Image();
        img.onload = function() {
            console.log('Картинка загружена:', imageUrls[index]);
            goal.style.background = `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('${imageUrls[index]}') no-repeat center center`;
            goal.style.backgroundSize = 'cover';
            goal.querySelector('.goal-placeholder').style.display = 'none';
        };
        
        img.onerror = function() {
            console.log('Ошибка загрузки картинки:', imageUrls[index]);
            currentIndex++;
            setTimeout(() => tryLoadImage(currentIndex), 500);
        };
        
        img.src = imageUrls[index];
    }
    
    tryLoadImage(0);
}

// ====================== СИСТЕМА ТАПОВ ======================

function setupTap() {
    const tapArea = document.getElementById('tapArea');
    const ball = document.getElementById('ball');
    
    if (!tapArea || !ball) return;
    
    function handleTap() {
        // Проверка энергии
        if (gameState.energy < gameState.energyPerTap) {
            showEnergyWarning();
            return;
        }
        
        // Тратим энергию
        gameState.energy -= gameState.energyPerTap;
        gameState.totalTaps++;
        
        // Анимация
        ball.classList.add('tap-effect');
        setTimeout(() => ball.classList.remove('tap-effect'), 150);
        
        ball.classList.add('shoot-animation');
        setTimeout(() => ball.classList.remove('shoot-animation'), 600);
        
        // Урон
        const damage = calculateDamage();
        
        // Анимация попадания в ворота
        const goal = document.getElementById('goal');
        if (goal) {
            goal.classList.add('goal-hit');
            setTimeout(() => goal.classList.remove('goal-hit'), 300);
        }
        
        // Наносим урон
        dealDamage(damage);
        
        updateUI();
        saveGame();
        
        // Вибрация (если поддерживается)
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }
    }
    
    // Назначаем обработчики
    tapArea.onclick = handleTap;
    ball.onclick = handleTap;
    
    tapArea.ontouchstart = function(e) {
        e.preventDefault();
        handleTap();
    };
    
    ball.ontouchstart = function(e) {
        e.preventDefault();
        handleTap();
    };
}

function calculateDamage() {
    const currentBall = gameState.balls.find(b => b.equipped) || gameState.balls[0];
    let damage = currentBall.damage * gameState.upgrades.damage.level;
    
    // 10% шанс критического удара
    if (Math.random() < 0.1) {
        damage *= 2;
        const ball = document.getElementById('ball');
        ball.style.boxShadow = '0 0 30px rgba(255,0,0,0.8)';
        setTimeout(() => {
            ball.style.boxShadow = '0 10px 25px rgba(0,0,0,0.7), 0 0 20px rgba(255,215,0,0.3)';
        }, 300);
    }
    
    return Math.floor(damage);
}

function showEnergyWarning() {
    const energyFill = document.getElementById('energyFill');
    if (!energyFill) return;
    
    const originalColor = energyFill.style.background;
    energyFill.style.background = 'linear-gradient(90deg, #ff416c, #ff4b2b)';
    
    setTimeout(() => {
        energyFill.style.background = originalColor || 'linear-gradient(90deg, #00b4db, #0083b0)';
    }, 300);
}

function dealDamage(damage) {
    const boss = gameState.bosses[gameState.currentBoss - 1];
    if (!boss || boss.defeated) return;
    
    boss.hp -= damage;
    
    if (boss.hp <= 0) {
        boss.hp = 0;
        boss.defeated = true;
        
        // Награда
        const reward = 10 * gameState.upgrades.reward.level * boss.reward;
        gameState.coins += reward;
        
        // Переход к следующему боссу
        if (gameState.currentBoss < gameState.bosses.length) {
            gameState.currentBoss++;
            gameState.level++;
            showLevelUp(reward);
        } else {
            alert('🎉 Все боссы побеждены! 🎉');
        }
    }
}

// ====================== ОБНОВЛЕНИЕ ИНТЕРФЕЙСА ======================

function updateUI() {
    // Монеты и уровень
    document.getElementById('coins').textContent = gameState.coins;
    document.getElementById('level').textContent = gameState.level;
    
    // Текущий мяч
    const currentBall = gameState.balls.find(b => b.equipped) || gameState.balls[0];
    gameState.damagePerTap = currentBall.damage * gameState.upgrades.damage.level;
    gameState.energyPerTap = currentBall.energyCost;
    
    // Обновляем значения
    document.getElementById('damagePerTap').textContent = gameState.damagePerTap;
    document.getElementById('energyPerTap').textContent = gameState.energyPerTap;
    document.getElementById('coinsPerGoal').textContent = 10 * gameState.upgrades.reward.level;
    
    // Босс
    const boss = gameState.bosses[gameState.currentBoss - 1];
    if (boss) {
        const healthPercent = (boss.hp / boss.maxHp) * 100;
        document.getElementById('bossProgress').style.width = `${healthPercent}%`;
        document.getElementById('bossHP').textContent = `${Math.max(0, boss.hp)}/${boss.maxHp}`;
        document.getElementById('bossName').textContent = boss.name;
    }
    
    // Энергия
    const energyPercent = (gameState.energy / gameState.maxEnergy) * 100;
    document.getElementById('energyFill').style.width = `${energyPercent}%`;
    document.getElementById('energy').textContent = Math.floor(gameState.energy);
    document.getElementById('maxEnergy').textContent = gameState.maxEnergy;
    
    // Изображение мяча
    document.getElementById('ballImage').src = currentBall.icon;
}

// ====================== МАГАЗИН ======================

function setupShop() {
    const shopItems = document.querySelector('.shop-items');
    if (!shopItems) return;
    
    shopItems.innerHTML = '';
    
    gameState.balls.forEach(ball => {
        const ballItem = document.createElement('div');
        ballItem.className = `ball-item ${ball.equipped ? 'equipped' : ''}`;
        ballItem.style.display = 'flex';
        ballItem.style.alignItems = 'center';
        ballItem.style.justifyContent = 'space-between';
        
        ballItem.innerHTML = `
            <div style="display: flex; align-items: center;">
                <div class="ball-preview">
                    <img src="${ball.icon}" alt="${ball.name}" style="width: 70%;">
                </div>
                <div style="margin-left: 10px;">
                    <h3>${ball.name}</h3>
                    <div class="ball-stats">
                        <span>Урон: ${ball.damage}</span>
                        <span>Энергия: ${ball.energyCost}</span>
                    </div>
                </div>
            </div>
            <button class="${ball.owned ? 'equip-btn' : 'buy-btn'}" 
                    onclick="${ball.owned ? `equipBall('${ball.id}')` : `buyBall('${ball.id}')`}"
                    ${ball.equipped ? 'disabled' : ''}>
                ${ball.owned ? (ball.equipped ? '✓' : 'Надеть') : ball.price + '🪙'}
            </button>
        `;
        
        shopItems.appendChild(ballItem);
    });
}

function buyBall(ballId) {
    const ball = gameState.balls.find(b => b.id === ballId);
    if (!ball) return;
    
    if (gameState.coins >= ball.price) {
        gameState.coins -= ball.price;
        ball.owned = true;
        
        updateUI();
        setupShop();
        saveGame();
        alert(`Вы купили ${ball.name}!`);
    } else {
        alert('Недостаточно монет!');
    }
}

function equipBall(ballId) {
    const ball = gameState.balls.find(b => b.id === ballId);
    if (!ball) return;
    
    // Снимаем все мячи
    gameState.balls.forEach(b => b.equipped = false);
    
    // Надеваем выбранный
    ball.equipped = true;
    
    updateUI();
    setupShop();
    saveGame();
    alert(`Вы экипировали ${ball.name}!`);
}

// ====================== УЛУЧШЕНИЯ ======================

function setupUpgrades() {
    const upgradesList = document.querySelector('.upgrades-list');
    if (!upgradesList) return;
    
    upgradesList.innerHTML = '';
    
    const upgrades = [
        { 
            id: 'damage', 
            title: 'Сила удара', 
            description: '+1 урон за тап', 
            icon: 'fa-fist-raised',
            level: gameState.upgrades.damage.level,
            cost: gameState.upgrades.damage.cost
        },
        { 
            id: 'energy', 
            title: 'Емкость энергии', 
            description: '+20 энергии', 
            icon: 'fa-battery-full',
            level: gameState.upgrades.energy.level,
            cost: gameState.upgrades.energy.cost
        },
        { 
            id: 'reward', 
            title: 'Награда за гол', 
            description: '+10% награды', 
            icon: 'fa-coins',
            level: gameState.upgrades.reward.level,
            cost: gameState.upgrades.reward.cost
        }
    ];
    
    upgrades.forEach(upgrade => {
        const upgradeItem = document.createElement('div');
        upgradeItem.className = 'upgrade-item';
        upgradeItem.style.display = 'flex';
        upgradeItem.style.alignItems = 'center';
        upgradeItem.style.justifyContent = 'space-between';
        
        upgradeItem.innerHTML = `
            <div style="display: flex; align-items: center;">
                <div class="upgrade-icon">
                    <i class="fas ${upgrade.icon}"></i>
                </div>
                <div style="margin-left: 10px;">
                    <h3>${upgrade.title}</h3>
                    <p style="font-size: 12px; color: #aaa;">${upgrade.description}</p>
                </div>
            </div>
            <div style="text-align: right;">
                <p style="color: #FFD700; font-weight: bold; margin-bottom: 5px;">${upgrade.cost}🪙</p>
                <button class="buy-btn" onclick="buyUpgrade('${upgrade.id}')"
                        ${gameState.coins < upgrade.cost ? 'disabled' : ''}>
                    Ур. ${upgrade.level}
                </button>
            </div>
        `;
        
        upgradesList.appendChild(upgradeItem);
    });
}

function buyUpgrade(type) {
    const upgrade = gameState.upgrades[type];
    if (!upgrade) return;
    
    if (gameState.coins >= upgrade.cost) {
        gameState.coins -= upgrade.cost;
        upgrade.level++;
        upgrade.cost = Math.floor(upgrade.cost * 1.5);
        
        // Применяем улучшение
        if (type === 'energy') {
            gameState.maxEnergy = 100 + (upgrade.level * 20);
        }
        
        updateUI();
        setupUpgrades();
        saveGame();
        
        const names = {
            'damage': 'Сила удара',
            'energy': 'Емкость энергии',
            'reward': 'Награда за гол'
        };
        
        alert(`Улучшение "${names[type]}" куплено!`);
    } else {
        alert('Недостаточно монет!');
    }
}

// ====================== БОССЫ ======================

function setupBosses() {
    const bossesList = document.querySelector('.bosses-list');
    if (!bossesList) return;
    
    bossesList.innerHTML = '';
    
    gameState.bosses.forEach(boss => {
        const bossItem = document.createElement('div');
        bossItem.className = 'boss-item';
        bossItem.style.display = 'flex';
        bossItem.style.alignItems = 'center';
        bossItem.style.justifyContent = 'space-between';
        
        const isCurrent = gameState.currentBoss === boss.id;
        const canFight = !boss.defeated && isCurrent;
        
        bossItem.innerHTML = `
            <div>
                <h3>${boss.name}</h3>
                <p style="font-size: 14px; margin: 5px 0;">HP: ${boss.hp}/${boss.maxHp}</p>
                <p style="font-size: 12px; color: #FFD700;">Награда: ${boss.reward * 10}🪙</p>
            </div>
            <button class="fight-btn" 
                    onclick="fightBoss(${boss.id})"
                    ${!canFight ? 'disabled' : ''}>
                ${boss.defeated ? '✓' : (isCurrent ? 'Сражаться' : '🔒')}
            </button>
        `;
        
        bossesList.appendChild(bossItem);
    });
}

function fightBoss(bossId) {
    gameState.currentBoss = bossId;
    switchScreen('game');
    updateUI();
}

// ====================== СОХРАНЕНИЕ И ЗАГРУЗКА ======================

function loadGame() {
    const saved = localStorage.getItem('footballTapGame');
    if (saved) {
        try {
            const savedState = JSON.parse(saved);
            Object.assign(gameState, savedState);
            console.log('Игра загружена');
        } catch (e) {
            console.log('Ошибка загрузки:', e);
        }
    }
}

function saveGame() {
    localStorage.setItem('footballTapGame', JSON.stringify(gameState));
}

// ====================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ======================

function showLevelUp(reward) {
    document.querySelector('.reward-coins').textContent = `+${reward}`;
    document.getElementById('levelUpModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('levelUpModal').style.display = 'none';
    
    // Сбрасываем здоровье следующего босса
    const boss = gameState.bosses[gameState.currentBoss - 1];
    if (boss) {
        boss.hp = boss.maxHp;
    }
    
    updateUI();
    setupBosses();
}

function switchScreen(screenName) {
    // Скрываем все экраны
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Показываем нужный экран
    document.getElementById(`${screenName}Screen`).classList.add('active');
}

function resetGame() {
    if (confirm('Сбросить игру? Весь прогресс будет потерян!')) {
        localStorage.removeItem('footballTapGame');
        location.reload();
    }
}

// ====================== ЗАПУСК ИГРЫ ======================

document.addEventListener('DOMContentLoaded', initGame);

// Глобальные функции для HTML
window.switchScreen = switchScreen;
window.buyUpgrade = buyUpgrade;
window.closeModal = closeModal;
window.fightBoss = fightBoss;
window.buyBall = buyBall;
window.equipBall = equipBall;
window.resetGame = resetGame;
