<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
    <title>漫画风格导航栏 | 上移+阴影4px | 去闪电/去爆炸符</title>
    <!-- 漫画风格字体 -->
    <link href="https://fonts.googleapis.com/css2?family=Bangers&family=Comic+Neue:wght@400;700;800&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background: #f5f5f5;
            font-family: 'Comic Neue', 'Comic Neue', 'Courier New', monospace;
            background-image: radial-gradient(circle at 30% 40%, rgba(0,0,0,0.08) 1.5px, transparent 1.5px);
            background-size: 18px 18px;
            min-height: 100vh;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            padding: 2rem 20px;
        }

        .demo-wrapper {
            width: 100%;
            max-width: 1300px;
            margin: 0 auto;
        }

        /* ----- 漫画导航栏 ----- */
        .manga-nav {
            background-color: #FFFFFF;
            border: 4px solid #000000;
            border-radius: 0px;
            box-shadow: 8px 8px 0px 0px rgba(0,0,0,0.2);
            position: relative;
            transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        /* 手绘撕裂/折角 */
        .manga-nav::before {
            content: "";
            position: absolute;
            top: -8px;
            left: 20px;
            width: 60px;
            height: 15px;
            background: #f5f5f5;
            border: 2px solid #000;
            transform: skew(-15deg);
            z-index: 2;
            box-shadow: -2px 2px 0 #000;
        }

        .manga-nav::after {
            content: "⚡";
            position: absolute;
            bottom: -18px;
            right: 15px;
            font-size: 32px;
            font-family: 'Bangers', cursive;
            color: #000;
            text-shadow: 2px 2px 0 #ccc;
            transform: rotate(10deg);
            z-index: 3;
            background: #fff;
            padding: 0 5px;
            border: 2px solid black;
            border-radius: 50%;
            line-height: 1;
            width: 40px;
            text-align: center;
            box-shadow: 2px 2px 0 #000;
        }

        /* 悬停：导航栏上移5px，阴影上移（垂直偏移改为4px） */
        .manga-nav:hover {
            transform: translateY(-5px);
            box-shadow: 8px 4px 0px 0px rgba(0,0,0,0.25);
        }

        .nav-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            padding: 0.8rem 2rem;
            position: relative;
            z-index: 5;
        }

        /* LOGO 区域 */
        .logo {
            font-family: 'Bangers', cursive;
            font-size: 2.1rem;
            letter-spacing: 2px;
            color: #000;
            background: white;
            padding: 0 8px;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transform: rotate(-1deg);
            border: 2.5px solid #000;
            box-shadow: 5px 5px 0 #000;
            transition: 0.1s linear;
            position: relative;
        }

        .logo::after {
            content: "";
            position: absolute;
            bottom: -14px;
            left: 15px;
            width: 0;
            height: 0;
            border-left: 12px solid transparent;
            border-right: 8px solid transparent;
            border-top: 16px solid #000;
            filter: drop-shadow(2px 2px 0 #000);
            z-index: -1;
        }

        .logo span {
            background: #000;
            color: #FFF;
            padding: 0 12px;
            transform: skew(-5deg);
            display: inline-block;
            font-size: 1.7rem;
            text-shadow: 2px 2px 0 #555;
        }

        .logo .burst {
            font-size: 2rem;
            display: inline-block;
            animation: shakeF 0.2s infinite alternate;
        }

        @keyframes shakeF {
            0% { transform: translate(0px, 0px) rotate(0deg); }
            100% { transform: translate(1px, -1px) rotate(2deg); }
        }

        /* 导航菜单 - 无闪电分隔符，无爆炸符伪元素 */
        .nav-menu ul {
            display: flex;
            list-style: none;
            gap: 0.6rem;
            margin: 0;
            padding: 0;
        }

        .nav-menu li {
            position: relative;
        }

        .nav-menu a {
            display: block;
            font-family: 'Comic Neue', 'Bangers', cursive;
            font-weight: 800;
            font-size: 1.3rem;
            text-transform: uppercase;
            text-decoration: none;
            color: #000000;
            background: #FFFFFF;
            padding: 0.6rem 1.3rem;
            border: 2.5px solid #000;
            transition: all 0.15s cubic-bezier(0.2, 0.9, 0.4, 1.1);
            letter-spacing: 1px;
            position: relative;
            box-shadow: 3px 3px 0 #aaa;
        }

        /* 悬停样式（无爆炸符） */
        .nav-menu a:hover {
            background: #000000;
            color: #FFFFFF;
            transform: scale(1.05) translateY(-3px);
            box-shadow: 6px 6px 0 #333;
            border-color: #fff;
        }

        .nav-menu a.active {
            background: #000000;
            color: #ffffff;
            border: 3px solid white;
            box-shadow: 5px 5px 0 #3a3a3a;
            position: relative;
        }

        .nav-menu a.active::after {
            content: "";
            position: absolute;
            top: 50%;
            left: 50%;
            width: 120%;
            height: 120%;
            background: repeating-radial-gradient(circle at 30% 40%, black 0px, black 2px, transparent 2px, transparent 6px);
            opacity: 0.2;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: -1;
        }

        /* 汉堡按钮 */
        .burger {
            display: none;
            flex-direction: column;
            justify-content: space-between;
            width: 44px;
            height: 34px;
            cursor: pointer;
            background: #000;
            padding: 6px 8px;
            border: 2px solid white;
            box-shadow: 4px 4px 0 #333;
            transition: 0.1s;
        }

        .burger span {
            display: block;
            height: 4px;
            width: 100%;
            background: white;
            border-radius: 0px;
            transition: 0.2s;
            border: 1px solid black;
        }

        .burger:hover {
            background: #2c2c2c;
            transform: scale(0.98);
            box-shadow: 1px 1px 0 #000;
        }

        /* ---------- 响应式 ---------- */
        @media screen and (max-width: 850px) {
            .burger {
                display: flex;
            }
            .nav-menu {
                position: absolute;
                top: 100%;
                left: 0;
                width: 100%;
                background: #FFFFFF;
                border-top: 4px solid black;
                border-bottom: 4px solid black;
                max-height: 0;
                overflow: hidden;
                transition: max-height 0.3s ease-out;
                z-index: 100;
                box-shadow: 0 10px 12px rgba(0,0,0,0.2);
            }
            .nav-menu.active {
                max-height: 400px;
                overflow-y: auto;
                border-bottom: 4px solid black;
            }
            .nav-menu ul {
                flex-direction: column;
                padding: 1rem 0;
                gap: 1rem;
                align-items: center;
            }
            .nav-menu a {
                width: 80%;
                text-align: center;
                margin: 0 auto;
                font-size: 1.4rem;
                border-width: 3px;
            }
            .nav-container {
                padding: 0.8rem 1.2rem;
            }
            .logo {
                font-size: 1.5rem;
            }
            .logo span {
                font-size: 1.2rem;
            }
        }

        @media screen and (min-width: 851px) {
            .nav-menu {
                position: static;
                max-height: none;
                border: none;
                background: transparent;
                overflow: visible;
            }
            .nav-menu ul {
                flex-direction: row;
            }
        }
    </style>
</head>
<body>
<div class="demo-wrapper">
    <header class="manga-nav">
        <div class="nav-container">
            <div class="logo">
                <span class="burst">💢</span>
                <span>KAPOW!</span>
                <span style="background:transparent; color:#000; padding:0;">NAVI</span>
            </div>
            <div class="burger" id="burgerBtn">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <nav class="nav-menu" id="navMenu">
                <ul>
                    <li><a href="#" class="active">🏠 主页</a></li>
                    <li><a href="#">📘 漫画</a></li>
                    <li><a href="#">💥 角色</a></li>
                    <li><a href="#">🎨 画廊</a></li>
                    <li><a href="#">⚡ 爆裂联络</a></li>
                </ul>
            </nav>
        </div>
    </header>
</div>

<script>
    const burger = document.getElementById('burgerBtn');
    const navMenu = document.getElementById('navMenu');
    
    if (burger && navMenu) {
        burger.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('active');
            burger.style.transform = 'scale(0.94)';
            setTimeout(() => { burger.style.transform = ''; }, 120);
        });
        
        const allLinks = document.querySelectorAll('.nav-menu a');
        allLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                allLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                if (window.innerWidth <= 850) {
                    navMenu.classList.remove('active');
                }
                // 点击小特效（保留增加漫画感）
                const temp = document.createElement('span');
                temp.innerText = '💢';
                temp.style.position = 'fixed';
                temp.style.left = (e.clientX - 15) + 'px';
                temp.style.top = (e.clientY - 20) + 'px';
                temp.style.fontSize = '28px';
                temp.style.fontWeight = 'bold';
                temp.style.pointerEvents = 'none';
                temp.style.zIndex = '9999';
                temp.style.transform = 'rotate(10deg)';
                temp.style.opacity = '1';
                temp.style.transition = 'opacity 0.3s ease';
                document.body.appendChild(temp);
                setTimeout(() => {
                    temp.style.opacity = '0';
                    setTimeout(() => temp.remove(), 300);
                }, 200);
            });
        });
    }
    
    window.addEventListener('resize', function() {
        if (window.innerWidth > 850 && navMenu) navMenu.classList.remove('active');
    });

    // 桌面端悬浮添加“!! 咚 !!”拟声词（保留）
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', (e) => {
            if (window.innerWidth > 850) {
                const boom = document.createElement('small');
                boom.innerText = '!! 咚 !!';
                boom.style.position = 'absolute';
                boom.style.top = '-30px';
                boom.style.left = '10px';
                boom.style.fontSize = '14px';
                boom.style.fontWeight = 'bold';
                boom.style.background = 'black';
                boom.style.color = 'white';
                boom.style.padding = '2px 6px';
                boom.style.border = '1px solid white';
                boom.style.fontFamily = "'Comic Neue'";
                boom.style.whiteSpace = 'nowrap';
                boom.style.zIndex = '99';
                boom.style.transform = 'rotate(-5deg)';
                boom.style.pointerEvents = 'none';
                const existing = link.querySelector('.fly-comic');
                if (existing) existing.remove();
                boom.classList.add('fly-comic');
                link.style.position = 'relative';
                link.appendChild(boom);
                setTimeout(() => boom.remove(), 500);
            }
        });
    });
</script>
</body>
</html>