// ====================== FOOTBALL TAP - ПОЛНЫЙ КОД ======================

// Telegram Web App Integration
let tg = window.Telegram?.WebApp;
let isTelegram = false;

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
    tapsHistory: [],
    
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
        },
        { 
            id: 'puma', 
            name: 'Puma Ball', 
            owned: false, 
            equipped: false, 
            damage: 3, 
            energyCost: 3,
            icon: 'https://cdn-icons-png.flaticon.com/128/3144/3144020.png',
            price: 1000
        }
    ],
    
    bosses: [
        { id: 1, name: "Ворота 1", hp: 100, maxHp: 100, reward: 50, defeated: false },
        { id: 2, name: "Ворота 2", hp: 500, maxHp: 500, reward: 250, defeated: false },
        { id: 3, name: "Ворота 3", hp: 1000, maxHp: 1000, reward: 500, defeated: false }
    ],
    
    upgrades: {
        damage: { level: 1, cost: 100 },
        energy: { level: 1, cost: 200 },
        autoTap: { level: 0, cost: 500 },
        reward: { level: 1, cost: 300 }
    }
};

// ====================== ТЕЛЕГРАМ ИНТЕГРАЦИЯ ======================

function initTelegram() {
    if (!tg) {
        console.log('Запуск в браузере');
        return;
    }
    
    console.log('Запуск в Telegram Web App');
    isTelegram = true;
    
    try {
        tg.expand();
        tg.setHeaderColor('#0a1931');
        tg.setBackgroundColor('#1a2980');
        tg.disableVerticalSwipes();
        
        tg.MainButton.setText("ℹ️ О игре");
        tg.MainButton.show();
        tg.MainButton.onClick(() => {
            tg.showAlert('⚽️ Football Tap ⚽️\n\nТапай по мячу, побеждай боссов, покупай улучшения!');
        });
        
        document.body.classList.add('telegram-webapp');
        
    } catch (error) {
        console.error('Ошибка Telegram:', error);
    }
}

// ====================== ИНИЦИАЛИЗАЦИЯ ИГРЫ ======================

function initGame() {
    console.log('=== FOOTBALL TAP START ===');
    
    initTelegram();
    loadGame();
    updateUI();
    setupShop();
    setupUpgrades();
    setupBosses();
    setupTap();
    
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
    
    // Авто-тапы
    startAutoTaps();
    
    console.log('Игра инициализирована!');
}

// ====================== СИСТЕМА ТАПОВ ======================

function setupTap() {
    console.log('Настройка тапов...');
    
    const tapArea = document.getElementById('tapArea');
    const ball = document.getElementById('ball');
    
    if (!tapArea || !ball) return;
    
    function handleTap() {
        if (gameState.energy < gameState.energyPerTap) {
            showEnergyWarning();
            if (navigator.vibrate) navigator.vibrate(100);
            return;
        }
        
        // Тратим энергию
        gameState.energy -= gameState.energyPerTap;
        gameState.totalTaps++;
        gameState.tapsHistory.push(Date.now());
        
        if (gameState.tapsHistory.length > 100) {
            gameState.tapsHistory = gameState.tapsHistory.slice(-100);
        }
        
        // Анимация
        ball.classList.add('tap-effect');
        setTimeout(() => ball.classList.remove('tap-effect'), 150);
        
        ball.classList.add('shoot-animation');
        setTimeout(() => ball.classList.remove('shoot-animation'), 700);
        
        // Урон
        const damage = calculateDamage();
        showDamage(damage);
        
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
        
        if (navigator.vibrate) navigator.vibrate(50);
    }
    
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
    const baseDamage = currentBall.damage * gameState.upgrades.damage.level;
    
    if (Math.random() < 0.1) {
        const ball = document.getElementById('ball');
        ball.classList.add('critical-hit');
        setTimeout(() => ball.classList.remove('critical-hit'), 400);
        return Math.floor(baseDamage * 2);
    }
    
    return baseDamage;
}

function showDamage(damage) {
    const indicator = document.getElementById('damageIndicator');
    const ball = document.getElementById('ball');
    
    if (!indicator || !ball) return;
    
    const ballRect = ball.getBoundingClientRect();
    const container = document.querySelector('.app-container');
    
    indicator.textContent = `-${damage}`;
    indicator.style.left = `${ballRect.left + ballRect.width / 2}px`;
    indicator.style.top = `${ballRect.top}px`;
    
    indicator.style.display = 'block';
    indicator.style.animation = 'none';
    
    setTimeout(() => {
        indicator.style.animation = 'damageFloat 1s ease-out forwards';
    }, 10);
    
    setTimeout(() => {
        indicator.style.display = 'none';
    }, 1000);
}

function showEnergyWarning() {
    const energyFill = document.getElementById('energyFill');
    if (!energyFill) return;
    
    const originalColor = energyFill.style.background;
    energyFill.style.background = 'linear-gradient(90deg, #ff416c, #ff4b2b)';
    
    setTimeout(() => {
        energyFill.style.background = originalColor || 'linear-gradient(90deg, #00b4db, #0083b0)';
    }, 500);
}

function dealDamage(damage) {
    const boss = gameState.bosses[gameState.currentBoss - 1];
    if (!boss || boss.defeated) return;
    
    boss.hp -= damage;
    
    if (boss.hp <= 0) {
        boss.hp = 0;
        boss.defeated = true;
        
        const reward = 10 * gameState.upgrades.reward.level * boss.reward;
        gameState.coins += reward;
        
        if (gameState.currentBoss < gameState.bosses.length) {
            gameState.currentBoss++;
            gameState.level++;
            showLevelUp(reward);
        } else {
            alert('🎉 Все боссы побеждены! 🎉');
        }
    }
}

// ====================== АВТО-ТАПЫ ======================

function startAutoTaps() {
    setInterval(() => {
        if (gameState.upgrades.autoTap.level > 0 && gameState.energy >= gameState.energyPerTap) {
            const boss = gameState.bosses[gameState.currentBoss - 1];
            if (boss && boss.hp > 0) {
                gameState.energy -= gameState.energyPerTap;
                gameState.energy = Math.max(0, gameState.energy);
                
                const damage = calculateDamage();
                boss.hp -= damage;
                
                if (boss.hp <= 0) {
                    boss.hp = 0;
                    boss.defeated = true;
                    const reward = 10 * gameState.upgrades.reward.level * boss.reward;
                    gameState.coins += reward;
                    
                    if (gameState.currentBoss < gameState.bosses.length) {
                        gameState.currentBoss++;
                        gameState.level++;
                        showLevelUp(reward);
                    }
                }
                
                updateUI();
                saveGame();
            }
        }
    }, 1000);
}

// ====================== UI И ОБНОВЛЕНИЕ ======================

function updateUI() {
    document.getElementById('coins').textContent = gameState.coins;
    document.getElementById('level').textContent = gameState.level;
    
    const currentBall = gameState.balls.find(b => b.equipped) || gameState.balls[0];
    const damageMultiplier = gameState.upgrades.damage.level;
    gameState.damagePerTap = currentBall.damage * damageMultiplier;
    
    document.getElementById('damagePerTap').textContent = gameState.damagePerTap;
    gameState.energyPerTap = currentBall.energyCost;
    document.getElementById('energyPerTap').textContent = gameState.energyPerTap;
    document.getElementById('coinsPerGoal').textContent = 10 * gameState.upgrades.reward.level;
    
    const boss = gameState.bosses[gameState.currentBoss - 1];
    if (boss) {
        const healthPercent = (boss.hp / boss.maxHp) * 100;
        document.getElementById('bossProgress').style.width = `${healthPercent}%`;
        document.getElementById('bossHP').textContent = `HP: ${Math.max(0, boss.hp)}/${boss.maxHp}`;
        document.getElementById('bossName').textContent = boss.name;
    }
    
    const energyPercent = (gameState.energy / gameState.maxEnergy) * 100;
    document.getElementById('energyFill').style.width = `${energyPercent}%`;
    document.getElementById('energy').textContent = `${Math.floor(gameState.energy)}/${gameState.maxEnergy}`;
    
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
        
        ballItem.innerHTML = `
            <div class="ball-preview">
                <img src="${ball.icon}" alt="${ball.name}" style="width: 70%;">
            </div>
            <div class="ball-info">
                <h3>${ball.name}</h3>
                <div class="ball-stats">
                    <span>Урон: ${ball.damage}</span>
                    <span>Энергия: ${ball.energyCost}</span>
                </div>
                ${!ball.owned ? 
                    `<p class="ball-price">${ball.price} монет</p>` : 
                    '<p>✓ Владеете</p>'
                }
            </div>
            <button class="${ball.owned ? 'equip-btn' : 'buy-btn'}" 
                    onclick="${ball.owned ? `equipBall('${ball.id}')` : `buyBall('${ball.id}')`}"
                    ${ball.equipped ? 'disabled' : ''}>
                ${ball.owned ? (ball.equipped ? '✓' : 'Надеть') : 'Купить'}
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
    
    gameState.balls.forEach(b => b.equipped = false);
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
            description: 'Увеличивает урон за тап', 
            icon: 'fa-fist-raised',
            level: gameState.upgrades.damage.level,
            cost: gameState.upgrades.damage.cost
        },
        { 
            id: 'energy', 
            title: 'Емкость энергии', 
            description: 'Увеличивает максимальную энергию', 
            icon: 'fa-battery-full',
            level: gameState.upgrades.energy.level,
            cost: gameState.upgrades.energy.cost
        },
        { 
            id: 'autoTap', 
            title: 'Авто-тапы', 
            description: 'Автоматические тапы каждую секунду', 
            icon: 'fa-robot',
            level: gameState.upgrades.autoTap.level,
            cost: gameState.upgrades.autoTap.cost
        },
        { 
            id: 'reward', 
            title: 'Награда за гол', 
            description: 'Увеличивает монеты за гол', 
            icon: 'fa-coins',
            level: gameState.upgrades.reward.level,
            cost: gameState.upgrades.reward.cost
        }
    ];
    
    upgrades.forEach(upgrade => {
        const upgradeItem = document.createElement('div');
        upgradeItem.className = 'upgrade-item';
        
        upgradeItem.innerHTML = `
            <div class="upgrade-icon">
                <i class="fas ${upgrade.icon}"></i>
            </div>
            <div class="upgrade-info">
                <h3>${upgrade.title} <span class="upgrade-level">Ур. ${upgrade.level}</span></h3>
                <p>${upgrade.description}</p>
            </div>
            <div class="upgrade-action">
                <p class="upgrade-cost">${upgrade.cost}</p>
                <button class="buy-btn" onclick="buyUpgrade('${upgrade.id}')"
                        ${gameState.coins < upgrade.cost ? 'disabled' : ''}>
                    Улучшить
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
        
        if (type === 'energy') {
            gameState.maxEnergy = 100 + (upgrade.level * 20);
        }
        
        updateUI();
        setupUpgrades();
        saveGame();
        
        const names = {
            'damage': 'Сила удара',
            'energy': 'Емкость энергии',
            'autoTap': 'Авто-тапы',
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
        
        bossItem.innerHTML = `
            <div style="flex: 1;">
                <h3>${boss.name}</h3>
                <p>HP: ${boss.hp}/${boss.maxHp}</p>
                <p>Награда: ${boss.reward * 10} монет</p>
                <p>${boss.defeated ? '✅ Побежден' : '⚔️ Доступен'}</p>
            </div>
            <button class="fight-btn" 
                    onclick="fightBoss(${boss.id})"
                    ${boss.defeated || gameState.currentBoss !== boss.id ? 'disabled' : ''}>
                ${boss.defeated ? '✓' : 'Сражаться'}
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
    
    const boss = gameState.bosses[gameState.currentBoss - 1];
    if (boss) {
        boss.hp = boss.maxHp;
    }
    updateUI();
    setupBosses();
}

function switchScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
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
