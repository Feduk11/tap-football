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
    combo: 0,
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
        { id: 2, name: "Ворота 2", hp: 500, maxHp: 500, reward: 250, defeated: false }
    ],
    
    upgrades: {
        damage: { level: 1, cost: 100 },
        energy: { level: 1, cost: 200 },
        autoTap: { level: 0, cost: 500 },
        reward: { level: 1, cost: 300 }
    }
};

// ====================== TELEGRAM ИНТЕГРАЦИЯ ======================

function initTelegram() {
    if (!tg) {
        console.log('Запуск в браузере (не Telegram)');
        setupBrowserFallback();
        return;
    }
    
    console.log('Запуск в Telegram Web App');
    isTelegram = true;
    
    try {
        tg.expand();
        tg.setHeaderColor('#1a2980');
        tg.setBackgroundColor('#26d0ce');
        tg.disableVerticalSwipes();
        
        tg.MainButton.setText("ℹ️ О игре");
        tg.MainButton.show();
        tg.MainButton.onClick(() => {
            tg.showAlert('⚽️ Football Tap ⚽️\n\nФутбольный кликер в стиле Hamster Kombat!');
        });
        
        tg.isClosingConfirmationEnabled = true;
        
        const user = tg.initDataUnsafe?.user;
        if (user) {
            setupUserWelcome(user);
        }
        
        tg.onEvent('viewportChanged', updateLayoutForMobile);
        
        setTimeout(() => {
            tg.expand();
            tg.viewportStableHeight = true;
        }, 100);
        
        addTelegramStyles();
        
    } catch (error) {
        console.error('Ошибка Telegram:', error);
        setupBrowserFallback();
    }
}

function setupUserWelcome(user) {
    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'telegram-welcome';
    welcomeDiv.innerHTML = `
        <div class="welcome-content">
            <span class="welcome-text">👋 Привет, ${user.first_name || 'Игрок'}!</span>
        </div>
    `;
    
    const gameHeader = document.querySelector('.game-header');
    if (gameHeader) {
        gameHeader.appendChild(welcomeDiv);
        setTimeout(() => {
            welcomeDiv.style.opacity = '0';
            setTimeout(() => welcomeDiv.remove(), 500);
        }, 3000);
    }
}

function addTelegramStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .telegram-welcome {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: linear-gradient(90deg, #1a2980, #26d0ce);
            color: white;
            padding: 10px 15px;
            text-align: center;
            font-weight: bold;
            border-radius: 0 0 15px 15px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1000;
            animation: slideDown 0.5s ease-out forwards;
        }
        @keyframes slideDown {
            from { transform: translateY(-100%); }
            to { transform: translateY(0); }
        }
        .tap-area, .ball, .nav-btn, .buy-btn {
            -webkit-tap-highlight-color: transparent;
        }
    `;
    document.head.appendChild(style);
    document.body.classList.add('telegram-webapp');
}

function setupBrowserFallback() {
    if (!isTelegram && !window.location.hostname.includes('localhost')) {
        const telegramBtn = document.createElement('button');
        telegramBtn.className = 'open-in-telegram';
        telegramBtn.innerHTML = '📱 Открыть в Telegram';
        telegramBtn.onclick = () => {
            window.open('https://t.me/YOUR_BOT_USERNAME', '_blank');
        };
        document.body.appendChild(telegramBtn);
        
        const style = document.createElement('style');
        style.textContent = `
            .open-in-telegram {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(45deg, #0088cc, #00a2e8);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 25px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                z-index: 9999;
                box-shadow: 0 4px 12px rgba(0,136,204,0.4);
            }
        `;
        document.head.appendChild(style);
    }
}

function updateLayoutForMobile() {
    if (!tg) return;
    
    const viewportHeight = tg.viewportHeight;
    const gameArea = document.querySelector('.game-area');
    const tapArea = document.querySelector('.tap-area');
    
    if (viewportHeight < 600) {
        if (gameArea) gameArea.style.padding = '10px';
        if (tapArea) tapArea.style.height = '120px';
    } else if (viewportHeight < 800) {
        if (gameArea) gameArea.style.padding = '15px';
        if (tapArea) tapArea.style.height = '140px';
    }
    
    updateShopLayout();
}

function updateShopLayout() {
    const shopItems = document.querySelector('.shop-items');
    const upgradesList = document.querySelector('.upgrades-list');
    
    if (shopItems) {
        shopItems.style.maxHeight = tg?.viewportHeight ? `${tg.viewportHeight - 150}px` : '400px';
    }
    
    if (upgradesList) {
        upgradesList.style.maxHeight = tg?.viewportHeight ? `${tg.viewportHeight - 150}px` : '400px';
    }
}

// ====================== ОСНОВНАЯ ИНИЦИАЛИЗАЦИЯ ======================

function initGame() {
    console.log('=== FOOTBALL TAP START ===');
    
    initTelegram();
    loadGame();
    updateUI();
    setupShop();
    setupUpgrades();
    setupBosses();
    setupSimpleTap();
    initTapIndicator();
    
    setTimeout(() => {
        updateLayoutForMobile();
        updateShopLayout();
    }, 500);
    
    setInterval(() => {
        if (gameState.energy < gameState.maxEnergy) {
            gameState.energy += 2;
            if (gameState.energy > gameState.maxEnergy) {
                gameState.energy = gameState.maxEnergy;
            }
            updateUI();
        }
        updateTapIndicator();
    }, 1000);
    
    startAutoTaps();
}

// ====================== СИСТЕМА ТАПОВ ======================

function setupSimpleTap() {
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
        
        gameState.energy -= gameState.energyPerTap;
        gameState.totalTaps++;
        gameState.tapsHistory.push(Date.now());
        
        if (gameState.tapsHistory.length > 100) {
            gameState.tapsHistory = gameState.tapsHistory.slice(-100);
        }
        
        ball.classList.add('tap-effect');
        setTimeout(() => ball.classList.remove('tap-effect'), 100);
        
        ball.classList.add('shoot-animation');
        setTimeout(() => ball.classList.remove('shoot-animation'), 500);
        
        const damage = calculateDamage();
        showDamage(damage);
        
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
    
    console.log('Тапы настроены!');
}

function calculateDamage() {
    const currentBall = gameState.balls.find(b => b.equipped) || gameState.balls[0];
    const baseDamage = currentBall.damage * gameState.upgrades.damage.level;
    
    if (Math.random() < 0.1) {
        const ball = document.getElementById('ball');
        ball.classList.add('critical-hit');
        setTimeout(() => ball.classList.remove('critical-hit'), 300);
        return Math.floor(baseDamage * 2);
    }
    
    return baseDamage;
}

function showDamage(damage) {
    const indicator = document.createElement('div');
    indicator.className = 'damage-popup';
    indicator.textContent = `-${damage}`;
    indicator.style.position = 'absolute';
    indicator.style.color = '#FFD700';
    indicator.style.fontSize = '28px';
    indicator.style.fontWeight = 'bold';
    indicator.style.textShadow = '2px 2px 4px #000';
    indicator.style.zIndex = '1000';
    indicator.style.pointerEvents = 'none';
    
    const ball = document.getElementById('ball');
    const ballRect = ball.getBoundingClientRect();
    const container = document.querySelector('.app-container');
    const containerRect = container.getBoundingClientRect();
    
    indicator.style.left = `${ballRect.left - containerRect.left + 40}px`;
    indicator.style.top = `${ballRect.top - containerRect.top - 30}px`;
    
    container.appendChild(indicator);
    
    indicator.animate([
        { opacity: 1, transform: 'translateY(0) scale(1)' },
        { opacity: 0, transform: 'translateY(-50px) scale(1.2)' }
    ], {
        duration: 1000,
        easing: 'ease-out'
    });
    
    setTimeout(() => indicator.remove(), 1000);
    
    if (isTelegram && damage > gameState.damagePerTap * 1.5) {
        if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
    }
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
    const goal = document.getElementById('goal');
if (goal) {
    goal.classList.add('goal-hit');
    setTimeout(() => {
        goal.classList.remove('goal-hit');
    }, 500);
}
}

// ====================== ИНДИКАТОР ТАПОВ ======================

function initTapIndicator() {
    const tapIndicator = document.createElement('div');
    tapIndicator.className = 'tap-indicator';
    tapIndicator.innerHTML = `
        <div class="tap-stats">
            <div class="tap-stat">
                <i class="fas fa-mouse-pointer"></i>
                <span>Тапы/сек: <strong id="tapsPerSec">0</strong></span>
            </div>
            <div class="tap-stat">
                <i class="fas fa-tachometer-alt"></i>
                <span>Всего: <strong id="totalTapsCount">0</strong></span>
            </div>
        </div>
        <div class="tap-speed-bar">
            <div class="tap-speed-fill" id="tapSpeedFill"></div>
        </div>
    `;
    
    const gameArea = document.querySelector('.game-area');
    if (gameArea) {
        const stats = document.querySelector('.stats');
        gameArea.insertBefore(tapIndicator, stats);
    }
}

function updateTapIndicator() {
    const now = Date.now();
    const threeSecondsAgo = now - 3000;
    const recentTaps = gameState.tapsHistory.filter(time => time > threeSecondsAgo).length;
    const tapsPerSecond = recentTaps / 3;
    
    const tapsPerSecEl = document.getElementById('tapsPerSec');
    const totalTapsEl = document.getElementById('totalTapsCount');
    const tapSpeedFill = document.getElementById('tapSpeedFill');
    
    if (tapsPerSecEl) {
        tapsPerSecEl.textContent = tapsPerSecond.toFixed(1);
    }
    
    if (totalTapsEl) {
        totalTapsEl.textContent = gameState.totalTaps;
    }
    
    if (tapSpeedFill) {
        const fillPercent = Math.min((tapsPerSecond / 5) * 100, 100);
        tapSpeedFill.style.width = `${fillPercent}%`;
        
        if (tapsPerSecond > 4) {
            tapSpeedFill.style.background = '#00ff00';
        } else if (tapsPerSecond > 2) {
            tapSpeedFill.style.background = '#ffff00';
        } else if (tapsPerSecond > 1) {
            tapSpeedFill.style.background = '#ff9900';
        } else {
            tapSpeedFill.style.background = '#ff3300';
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
    
    if (isTelegram && tg) {
        updateShopLayout();
    }
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
                    `<p class="ball-price">Цена: ${ball.price} монет</p>` : 
                    '<p>✓ Владеете</p>'
                }
            </div>
            <button class="${ball.owned ? 'equip-btn' : 'buy-btn'}" 
                    onclick="${ball.owned ? `equipBall('${ball.id}')` : `buyBall('${ball.id}')`}"
                    ${ball.equipped ? 'disabled' : ''}>
                ${ball.owned ? (ball.equipped ? 'Экипирован' : 'Экипировать') : 'Купить'}
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
                <p class="upgrade-cost">${upgrade.cost} монет</p>
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
                <p>Статус: ${boss.defeated ? '✅ Побежден' : '⚔️ Доступен'}</p>
            </div>
            <button class="fight-btn" 
                    onclick="fightBoss(${boss.id})"
                    ${boss.defeated || gameState.currentBoss !== boss.id ? 'disabled' : ''}>
                ${boss.defeated ? 'Побежден' : 'Сражаться'}
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
    if (confirm('Сбросить игру?')) {
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
