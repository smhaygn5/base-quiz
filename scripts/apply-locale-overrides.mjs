import fs from "node:fs/promises";
import path from "node:path";

const overrides = {
  tr: {
    "common.connectWallet": "Cüzdan bağla",
    "common.connectBaseWallet": "Base Wallet’ı bağla",
    "common.mute": "Sesi kapat",
    "home.kicker": "Zincir üstü bilgi yarışması · Base",
    "home.titleLine1": "Günlük bilgi yarışması.",
    "home.titleLine2": "Base üzerinde.",
    "home.description": "Bir kategori seç, beş soruyu yanıtla ve zamana karşı yarış. Serini geliştir, puanını zincire kaydet ve küresel liderlik tablosunda yüksel.",
    "home.streak": "{count} günlük seri",
    "home.facts": "5 soru · Her soru için 15 saniye · Puanlar zincire kaydedilir",
    "category.meta": "{count} soru · Tur başına 5 soru",
    "category.imageAlt": "{category} quiz kategorisi",
    "category.geography.description": "Dünyanın dört bir yanındaki ülkeler, başkentler, okyanuslar ve simge yapılar arasında yolculuğa çık.",
    "quiz.fallbackName": "Quiz",
    "quiz.questionProgress": "Soru {current}/{total}",
    "quiz.answeredAria": "{total} sorudan {answered} tanesi yanıtlandı",
    "quiz.points": "+{points} puan",
    "result.summaryAria": "Tur özeti",
    "result.save.error.title": "Skor kaydedilemedi",
    "result.replayKicker": "Serini sürdür",
    "leaderboard.kicker": "Base Mainnet · Tüm zamanlar",
    "leaderboard.description": "Oyuncular zincirdeki toplam puanlarına göre sıralanır.",
    "leaderboard.empty": "Henüz kayıtlı skor yok. Liderlik tablosuna giren ilk oyuncu sen ol.",
    "leaderboard.streak": "Seri",
    "leaderboard.you": "Sen",
    "leaderboard.players": "{count} oyuncu",
    "badges.kicker": "Seri NFT’leri · Base Mainnet",
    "badges.roadmapTitle": "Seri Rozetleri",
    "badges.roadmapDescription": "Oynamaya devam et, serini geliştir ve ulaştığın her zincir üstü kilometre taşının rozetini al.",
    "badges.bronze.description": "İlk 3 günlük serini tamamla",
    "badges.silver.description": "Serini bir hafta boyunca koru",
    "badges.gold.description": "30 günlük istikrarlı bir seri oluştur",
    "badges.diamond.description": "100 günlük en büyük hedefe ulaş",
    "badges.unlock": "{count} günlük seride açılır",
    "badges.owned": "Sahipsin",
    "badges.claim": "Rozeti al",
    "badges.claiming": "Rozet alınıyor…",
    "badges.loading": "Rozetler Base’den okunuyor…",
    "tutorial.welcomeDetail": "Base üzerinde günlük bir bilgi yarışması. Bilgini test et, seriler oluştur ve dünyanın her yerinden oyuncularla yarış.",
    "tutorial.questionsTitle": "Her gün 5 soru.",
    "tutorial.badgesDetail": "Serini koru ve zincir üstü NFT rozetlerini al: Bronz (3 gün), Gümüş (7 gün), Altın (30 gün), Elmas (100 gün).",
    "footer.blockData": "BLOK VERİSİ · BASE MAINNET",
    "footer.playersOnchain": "ZİNCİRDE {count} OYUNCU",
    "share.text": "🧠 Base Quiz’de {score} puan kazandım! 🔥 Seri: {streak} gün\n\nBeni geçebileceğini düşünüyor musun? 👇",
    "error.alreadyPlayed": "Bugünkü skorun zaten kaydedildi. Yarın tekrar gel.",
    "activation.kicker": "Base Quiz kurulumu",
    "activation.title": "Tur sözleşmesini etkinleştir",
    "activation.copy": "Bu tek seferlik Base işlemi, Turu Başlat özelliğinde kullanılan küçük sözleşmeyi dağıtır. Skorları, serileri veya rozetleri değiştirmez ve ETH transfer etmez.",
    "activation.active": "Tur sözleşmesi etkin",
    "activation.activate": "Tur Sözleşmesini Etkinleştir",
    "activation.back": "Base Quiz’e dön",
    "activation.errorCheck": "Base sözleşmesi kontrol edilemedi. Lütfen tekrar deneyin."
  },
  es: {
    "common.connectBaseWallet": "Conectar Base Wallet",
    "common.unmute": "Activar sonido",
    "home.kicker": "Trivia onchain · Base",
    "home.titleLine1": "Trivia diaria.",
    "home.titleLine2": "Creado sobre Base.",
    "home.description": "Elige una categoría, responde cinco preguntas y compite contra el reloj. Aumenta tu racha, guarda tu puntuación onchain y sube en la clasificación mundial.",
    "home.streak": "Racha de {count} días",
    "category.meta": "{count} preguntas · 5 por ronda",
    "category.imageAlt": "Categoría de quiz: {category}",
    "result.streakPill": "Racha de {count} días",
    "result.streakUpdatedDetail": "Ahora llevas una racha de aprendizaje de {count} días.",
    "leaderboard.kicker": "Base Mainnet · Clasificación histórica",
    "leaderboard.loading": "Leyendo puntuaciones desde Base…",
    "leaderboard.you": "Tú",
    "leaderboard.players": "{count} jugadores",
    "badges.kicker": "NFT de racha · Base Mainnet",
    "badges.streak": "Racha de {count} días",
    "badges.claim": "Reclamar insignia",
    "badges.daysLeft": "Quedan {count} días",
    "badges.loading": "Leyendo insignias desde Base…",
    "footer.blockData": "DATOS DE BLOQUE · BASE MAINNET",
    "footer.playersOnchain": "{count} JUGADORES ONCHAIN",
    "share.text": "🧠 ¡Conseguí {score} puntos en Base Quiz! 🔥 Racha: {streak} días\n\n¿Crees que puedes superarme? 👇",
    "activation.kicker": "Configuración de Base Quiz",
    "activation.title": "Activar el contrato de rondas",
    "activation.active": "El contrato de rondas está activo",
    "activation.confirming": "Confirmando en Base…",
    "activation.activate": "Activar contrato de rondas",
    "activation.back": "Volver a Base Quiz",
    "activation.errorCheck": "No se pudo comprobar el contrato de Base. Inténtalo de nuevo."
  },
  pt: {
    "common.connectBaseWallet": "Conectar Base Wallet",
    "common.mute": "Silenciar",
    "home.kicker": "Quiz onchain · Base",
    "home.titleLine1": "Quiz diário.",
    "home.titleLine2": "Criado na Base.",
    "home.description": "Escolha uma categoria, responda a cinco perguntas e corra contra o relógio. Aumente sua sequência, salve sua pontuação onchain e suba no ranking global.",
    "home.streak": "Sequência de {count} dias",
    "home.streakBadges": "Emblemas de sequência",
    "category.meta": "{count} perguntas · 5 por rodada",
    "category.crypto.name": "Cripto",
    "quiz.time": "Tempo",
    "quiz.answeredAria": "{answered} de {total} perguntas respondidas",
    "result.streakPill": "Sequência de {count} dias",
    "result.streakUpdatedDetail": "Agora você está em uma sequência de aprendizado de {count} dias.",
    "result.save.pending.detail": "Aprove a transação na sua carteira para concluir o salvamento.",
    "leaderboard.kicker": "Base Mainnet · Ranking histórico",
    "leaderboard.players": "{count} jogadores",
    "badges.kicker": "NFTs de sequência · Base Mainnet",
    "badges.streak": "Sequência de {count} dias",
    "badges.owned": "Obtido",
    "badges.claim": "Resgatar emblema",
    "footer.playersOnchain": "{count} JOGADORES ONCHAIN",
    "share.text": "🧠 Fiz {score} pontos no Base Quiz! 🔥 Sequência: {streak} dias\n\nAcha que consegue me superar? 👇",
    "activation.kicker": "Configuração do Base Quiz",
    "activation.title": "Ativar o contrato de rodadas",
    "activation.active": "O contrato de rodadas está ativo",
    "activation.activate": "Ativar contrato de rodadas",
    "activation.back": "Voltar ao Base Quiz",
    "activation.errorCheck": "Não foi possível verificar o contrato da Base. Tente novamente."
  },
  fr: {
    "common.connectBaseWallet": "Connecter Base Wallet",
    "home.kicker": "Quiz onchain · Base",
    "home.titleLine1": "Quiz quotidien.",
    "home.titleLine2": "Propulsé par Base.",
    "home.description": "Choisissez une catégorie, répondez à cinq questions et jouez contre la montre. Développez votre série, enregistrez votre score onchain et montez dans le classement mondial.",
    "home.streak": "Série de {count} jours",
    "home.startRound": "Commencer la partie",
    "category.meta": "{count} questions · 5 par partie",
    "result.streakPill": "Série de {count} jours",
    "result.save.error.title": "Problème d’enregistrement",
    "leaderboard.kicker": "Base Mainnet · Classement historique",
    "leaderboard.players": "{count} joueurs",
    "badges.kicker": "NFT de série · Base Mainnet",
    "badges.streak": "Série de {count} jours",
    "badges.claim": "Réclamer le badge",
    "footer.blockData": "DONNÉES DE BLOC · BASE MAINNET",
    "footer.playersOnchain": "{count} JOUEURS ONCHAIN",
    "share.text": "🧠 J’ai marqué {score} points sur Base Quiz ! 🔥 Série : {streak} jours\n\nTu penses pouvoir me battre ? 👇",
    "activation.kicker": "Configuration de Base Quiz",
    "activation.title": "Activer le contrat de partie",
    "activation.active": "Le contrat de partie est actif",
    "activation.activate": "Activer le contrat de partie",
    "activation.back": "Retour à Base Quiz",
    "activation.errorCheck": "Impossible de vérifier le contrat Base. Réessayez."
  },
  de: {
    "common.connectBaseWallet": "Base Wallet verbinden",
    "home.kicker": "Onchain-Quiz · Base",
    "home.titleLine1": "Tägliches Quiz.",
    "home.titleLine2": "Auf Base gebaut.",
    "home.description": "Wähle eine Kategorie, beantworte fünf Fragen und spiele gegen die Zeit. Baue deine Serie aus, speichere deinen Punktestand onchain und steige in der globalen Bestenliste auf.",
    "home.streak": "{count}-Tage-Serie",
    "home.facts": "5 Fragen · je 15 Sekunden · Punkte werden onchain gespeichert",
    "category.meta": "{count} Fragen · 5 pro Runde",
    "result.streakPill": "{count}-Tage-Serie",
    "leaderboard.kicker": "Base Mainnet · Gesamtwertung",
    "leaderboard.players": "{count} Spieler",
    "badges.kicker": "Serien-NFTs · Base Mainnet",
    "badges.streak": "{count}-Tage-Serie",
    "footer.blockData": "BLOCKDATEN · BASE MAINNET",
    "footer.playersOnchain": "{count} SPIELER ONCHAIN",
    "activation.kicker": "Base Quiz Einrichtung",
    "activation.title": "Rundenvertrag aktivieren",
    "activation.active": "Der Rundenvertrag ist aktiv",
    "activation.activate": "Rundenvertrag aktivieren",
    "activation.back": "Zurück zu Base Quiz",
    "activation.errorCheck": "Der Base-Vertrag konnte nicht geprüft werden. Bitte versuche es erneut."
  },
  ru: {
    "common.connectBaseWallet": "Подключить Base Wallet",
    "home.kicker": "Ончейн-викторина · Base",
    "home.titleLine1": "Ежедневная викторина.",
    "home.titleLine2": "Создано на Base.",
    "home.description": "Выберите категорию, ответьте на пять вопросов и сыграйте на время. Увеличивайте серию, сохраняйте результат в блокчейне и поднимайтесь в глобальной таблице лидеров.",
    "home.streak": "Серия: {count} дней",
    "home.facts": "5 вопросов · по 15 секунд · результаты сохраняются в блокчейне",
    "category.meta": "{count} вопросов · 5 за раунд",
    "result.streakPill": "Серия: {count} дней",
    "leaderboard.kicker": "Base Mainnet · За всё время",
    "leaderboard.players": "Игроков: {count}",
    "badges.kicker": "NFT за серии · Base Mainnet",
    "badges.streak": "Серия: {count} дней",
    "footer.blockData": "ДАННЫЕ БЛОКЧЕЙНА · BASE MAINNET",
    "footer.playersOnchain": "ИГРОКОВ В БЛОКЧЕЙНЕ: {count}",
    "share.text": "🧠 Я набрал {score} очков в Base Quiz! 🔥 Серия: {streak} дней\n\nСможешь меня обойти? 👇",
    "activation.kicker": "Настройка Base Quiz",
    "activation.title": "Активировать контракт раундов",
    "activation.active": "Контракт раундов активен",
    "activation.activate": "Активировать контракт раундов",
    "activation.back": "Вернуться в Base Quiz",
    "activation.errorCheck": "Не удалось проверить контракт Base. Попробуйте ещё раз."
  },
  ar: {
    "common.connectBaseWallet": "ربط Base Wallet",
    "home.kicker": "مسابقة معلومات على السلسلة · Base",
    "home.titleLine1": "مسابقة يومية.",
    "home.titleLine2": "مبنية على Base.",
    "home.description": "اختر فئة، وأجب عن خمسة أسئلة، وسابق الوقت. حافظ على سلسلتك، واحفظ نتيجتك على السلسلة، وتقدّم في لوحة الصدارة العالمية.",
    "home.streak": "سلسلة لمدة {count} أيام",
    "home.facts": "5 أسئلة · 15 ثانية لكل سؤال · النتائج محفوظة على السلسلة",
    "category.meta": "{count} سؤالًا · 5 في كل جولة",
    "quiz.questionProgress": "السؤال {current} من {total}",
    "quiz.answeredAria": "تمت الإجابة عن {answered} من {total} أسئلة",
    "result.streakPill": "سلسلة لمدة {count} أيام",
    "leaderboard.kicker": "Base Mainnet · كل الأوقات",
    "leaderboard.players": "{count} لاعبًا",
    "badges.kicker": "NFT للسلسلة · Base Mainnet",
    "badges.streak": "سلسلة لمدة {count} أيام",
    "footer.blockData": "بيانات الكتل · BASE MAINNET",
    "footer.playersOnchain": "{count} لاعبًا على السلسلة",
    "share.text": "🧠 حققت {score} نقطة في Base Quiz! 🔥 السلسلة: {streak} أيام\n\nهل يمكنك التفوق عليّ؟ 👇",
    "activation.kicker": "إعداد Base Quiz",
    "activation.title": "تفعيل عقد الجولات",
    "activation.active": "عقد الجولات مفعّل",
    "activation.activate": "تفعيل عقد الجولات",
    "activation.back": "العودة إلى Base Quiz",
    "activation.errorCheck": "تعذر التحقق من عقد Base. حاول مرة أخرى."
  },
  zh: {
    "common.connectBaseWallet": "连接 Base Wallet",
    "home.kicker": "链上知识问答 · Base",
    "home.titleLine1": "每日知识问答。",
    "home.titleLine2": "构建于 Base。",
    "home.description": "选择一个类别，回答五道问题并与时间赛跑。保持连续答题记录，将分数保存到链上，并登上全球排行榜。",
    "home.streak": "连续 {count} 天",
    "home.facts": "5 道题 · 每题 15 秒 · 分数保存到链上",
    "category.meta": "{count} 道题 · 每轮 5 道",
    "quiz.questionProgress": "第 {current}/{total} 题",
    "result.streakPill": "连续 {count} 天",
    "leaderboard.kicker": "Base Mainnet · 历史总榜",
    "leaderboard.players": "{count} 名玩家",
    "badges.kicker": "连续答题 NFT · Base Mainnet",
    "badges.streak": "连续 {count} 天",
    "footer.blockData": "区块数据 · BASE MAINNET",
    "footer.playersOnchain": "{count} 名链上玩家",
    "activation.kicker": "Base Quiz 设置",
    "activation.title": "激活回合合约",
    "activation.active": "回合合约已激活",
    "activation.activate": "激活回合合约",
    "activation.back": "返回 Base Quiz",
    "activation.errorCheck": "无法检查 Base 合约，请重试。"
  },
  ja: {
    "common.connectBaseWallet": "Base Walletを接続",
    "home.kicker": "オンチェーンクイズ · Base",
    "home.titleLine1": "毎日のクイズ。",
    "home.titleLine2": "Base上に構築。",
    "home.description": "カテゴリーを選び、5問のクイズに制限時間内で挑戦しましょう。連続記録を伸ばし、スコアをオンチェーンに保存して、世界ランキングを上りましょう。",
    "home.streak": "{count}日連続",
    "home.facts": "5問 · 各15秒 · スコアはオンチェーンに保存",
    "category.meta": "{count}問 · 1ラウンド5問",
    "quiz.questionProgress": "問題 {current}/{total}",
    "result.streakPill": "{count}日連続",
    "leaderboard.kicker": "Base Mainnet · 歴代ランキング",
    "leaderboard.players": "{count}人のプレイヤー",
    "badges.kicker": "連続記録NFT · Base Mainnet",
    "badges.streak": "{count}日連続",
    "footer.blockData": "ブロックデータ · BASE MAINNET",
    "footer.playersOnchain": "オンチェーンプレイヤー {count}人",
    "activation.kicker": "Base Quizのセットアップ",
    "activation.title": "ラウンドコントラクトを有効化",
    "activation.active": "ラウンドコントラクトは有効です",
    "activation.activate": "ラウンドコントラクトを有効化",
    "activation.back": "Base Quizに戻る",
    "activation.errorCheck": "Baseコントラクトを確認できませんでした。もう一度お試しください。"
  },
  ko: {
    "common.connectBaseWallet": "Base Wallet 연결",
    "home.kicker": "온체인 퀴즈 · Base",
    "home.titleLine1": "매일 즐기는 퀴즈.",
    "home.titleLine2": "Base에서 구축.",
    "home.description": "카테고리를 선택하고 제한 시간 안에 5문제에 도전하세요. 연속 기록을 이어가고 점수를 온체인에 저장해 글로벌 리더보드에 올라보세요.",
    "home.streak": "{count}일 연속",
    "home.facts": "5문제 · 문제당 15초 · 점수는 온체인에 저장",
    "category.meta": "{count}문제 · 라운드당 5문제",
    "quiz.questionProgress": "{current}/{total}번 문제",
    "result.streakPill": "{count}일 연속",
    "leaderboard.kicker": "Base Mainnet · 역대 순위",
    "leaderboard.players": "플레이어 {count}명",
    "badges.kicker": "연속 기록 NFT · Base Mainnet",
    "badges.streak": "{count}일 연속",
    "footer.blockData": "블록 데이터 · BASE MAINNET",
    "footer.playersOnchain": "온체인 플레이어 {count}명",
    "activation.kicker": "Base Quiz 설정",
    "activation.title": "라운드 컨트랙트 활성화",
    "activation.active": "라운드 컨트랙트가 활성화되었습니다",
    "activation.activate": "라운드 컨트랙트 활성화",
    "activation.back": "Base Quiz로 돌아가기",
    "activation.errorCheck": "Base 컨트랙트를 확인할 수 없습니다. 다시 시도해 주세요."
  }
};

const quizOverrides = {
  tr: {
    "crypto:37": {
      question: "OpenSea esas olarak hangisidir?",
      answers: { DEX: "DEX", "NFT marketplace": "NFT pazarı", Wallet: "Cüzdan", "L2 chain": "L2 zinciri" }
    },
    "sports:37": {
      question: "Teniste bir oyuncu deuce’tan sonra sayı aldığında ne olur?",
      answers: { Game: "Oyun", Advantage: "Avantaj", Set: "Set", Match: "Maç" }
    },
    "science:37": {
      question: "Nefes almak için hangi organ kullanılır?",
      answers: { Heart: "Kalp", Lungs: "Akciğerler", Stomach: "Mide", Liver: "Karaciğer" }
    },
    "art:73": {
      question: "Kırmızı ile beyaz karıştırıldığında hangi renk oluşur?",
      answers: { Blue: "Mavi", Pink: "Pembe", Green: "Yeşil", Brown: "Kahverengi" }
    },
    "science:73": {
      question: "Dünya’nın hangi katmanında yaşıyoruz?",
      answers: { Core: "Çekirdek", Mantle: "Manto", Crust: "Yer kabuğu", Atmosphere: "Atmosfer" }
    },
    "crypto:13": {
      question: "Layer-2 çözümlerinin temel amacı nedir?",
      answers: { "Minting more tokens": "Daha fazla token üretmek", "Scalability & lower fees": "Ölçeklenebilirlik ve daha düşük ücretler", Mining: "Madencilik", Staking: "Staking" }
    },
    "science:13": {
      question: "Yalnızca bitkilerle beslenen hayvanlara ne ad verilir?",
      answers: { Carnivores: "Etoburlar", Herbivores: "Otoburlar", Omnivores: "Hepçiller", Predators: "Yırtıcılar" }
    },
    "crypto:91": {
      question: "Bir işlemdeki nonce nedir?",
      answers: { "A random word": "Rastgele bir kelime", "A per-account transaction counter": "Hesaba özel işlem sayacı", "A token": "Bir token", "A wallet": "Bir cüzdan" }
    }
  },
  es: {
    "crypto:37": {
      question: "¿Qué es principalmente OpenSea?",
      answers: { DEX: "DEX", "NFT marketplace": "Mercado de NFT", Wallet: "Cartera", "L2 chain": "Cadena L2" }
    },
    "sports:37": {
      question: "En tenis, ¿qué viene después del deuce cuando un jugador gana el siguiente punto?",
      answers: { Game: "Juego", Advantage: "Ventaja", Set: "Set", Match: "Partido" }
    },
    "science:37": {
      question: "¿Qué órgano se utiliza para respirar?",
      answers: { Heart: "Corazón", Lungs: "Pulmones", Stomach: "Estómago", Liver: "Hígado" }
    },
    "art:73": {
      question: "¿Qué color se obtiene al mezclar rojo y blanco?",
      answers: { Blue: "Azul", Pink: "Rosa", Green: "Verde", Brown: "Marrón" }
    },
    "science:73": {
      question: "¿En qué capa de la Tierra vivimos?",
      answers: { Core: "Núcleo", Mantle: "Manto", Crust: "Corteza", Atmosphere: "Atmósfera" }
    },
    "crypto:13": {
      question: "¿Cuál es el objetivo principal de las soluciones Layer-2?",
      answers: { "Minting more tokens": "Acuñar más tokens", "Scalability & lower fees": "Escalabilidad y comisiones más bajas", Mining: "Minería", Staking: "Staking" }
    },
    "science:13": {
      question: "¿Cómo se llaman los animales que solo comen plantas?",
      answers: { Carnivores: "Carnívoros", Herbivores: "Herbívoros", Omnivores: "Omnívoros", Predators: "Depredadores" }
    },
    "crypto:91": {
      question: "¿Qué es un nonce en una transacción?",
      answers: { "A random word": "Una palabra aleatoria", "A per-account transaction counter": "Un contador de transacciones por cuenta", "A token": "Un token", "A wallet": "Una cartera" }
    }
  },
  pt: {
    "crypto:37": {
      question: "O que é principalmente a OpenSea?",
      answers: { DEX: "DEX", "NFT marketplace": "Mercado de NFT", Wallet: "Carteira", "L2 chain": "Rede L2" }
    },
    "sports:37": {
      question: "No tênis, o que vem depois do deuce quando um jogador ganha o ponto seguinte?",
      answers: { Game: "Game", Advantage: "Vantagem", Set: "Set", Match: "Partida" }
    },
    "science:37": {
      question: "Qual órgão é usado para respirar?",
      answers: { Heart: "Coração", Lungs: "Pulmões", Stomach: "Estômago", Liver: "Fígado" }
    },
    "art:73": {
      question: "Que cor se obtém ao misturar vermelho e branco?",
      answers: { Blue: "Azul", Pink: "Rosa", Green: "Verde", Brown: "Marrom" }
    },
    "science:73": {
      question: "Em qual camada da Terra vivemos?",
      answers: { Core: "Núcleo", Mantle: "Manto", Crust: "Crosta", Atmosphere: "Atmosfera" }
    },
    "crypto:13": {
      question: "Qual é o principal objetivo das soluções Layer-2?",
      answers: { "Minting more tokens": "Criar mais tokens", "Scalability & lower fees": "Escalabilidade e taxas menores", Mining: "Mineração", Staking: "Staking" }
    },
    "science:13": {
      question: "Como são chamados os animais que comem apenas plantas?",
      answers: { Carnivores: "Carnívoros", Herbivores: "Herbívoros", Omnivores: "Onívoros", Predators: "Predadores" }
    },
    "crypto:91": {
      question: "O que é um nonce em uma transação?",
      answers: { "A random word": "Uma palavra aleatória", "A per-account transaction counter": "Um contador de transações por conta", "A token": "Um token", "A wallet": "Uma carteira" }
    }
  },
  fr: {
    "crypto:37": {
      question: "OpenSea est principalement quel type de service ?",
      answers: { DEX: "DEX", "NFT marketplace": "Place de marché NFT", Wallet: "Portefeuille", "L2 chain": "Chaîne L2" }
    },
    "sports:37": {
      question: "Au tennis, que vient après l’égalité lorsqu’un joueur gagne le point suivant ?",
      answers: { Game: "Jeu", Advantage: "Avantage", Set: "Set", Match: "Match" }
    },
    "science:37": {
      question: "Quel organe sert à respirer ?",
      answers: { Heart: "Cœur", Lungs: "Poumons", Stomach: "Estomac", Liver: "Foie" }
    },
    "art:73": {
      question: "Quelle couleur obtient-on en mélangeant du rouge et du blanc ?",
      answers: { Blue: "Bleu", Pink: "Rose", Green: "Vert", Brown: "Marron" }
    },
    "science:73": {
      question: "Sur quelle couche de la Terre vivons-nous ?",
      answers: { Core: "Noyau", Mantle: "Manteau", Crust: "Croûte", Atmosphere: "Atmosphère" }
    },
    "crypto:13": {
      question: "Quel est l’objectif principal des solutions Layer-2 ?",
      answers: { "Minting more tokens": "Créer davantage de tokens", "Scalability & lower fees": "Améliorer l’évolutivité et réduire les frais", Mining: "Minage", Staking: "Staking" }
    },
    "science:13": {
      question: "Comment appelle-t-on les animaux qui mangent uniquement des plantes ?",
      answers: { Carnivores: "Carnivores", Herbivores: "Herbivores", Omnivores: "Omnivores", Predators: "Prédateurs" }
    },
    "crypto:91": {
      question: "Qu’est-ce qu’un nonce dans une transaction ?",
      answers: { "A random word": "Un mot aléatoire", "A per-account transaction counter": "Un compteur de transactions propre à chaque compte", "A token": "Un token", "A wallet": "Un portefeuille" }
    }
  },
  de: {
    "crypto:37": {
      question: "Was ist OpenSea hauptsächlich?",
      answers: { DEX: "DEX", "NFT marketplace": "NFT-Marktplatz", Wallet: "Wallet", "L2 chain": "L2-Chain" }
    },
    "sports:37": {
      question: "Was folgt im Tennis auf Einstand, wenn ein Spieler den nächsten Punkt gewinnt?",
      answers: { Game: "Spiel", Advantage: "Vorteil", Set: "Satz", Match: "Match" }
    },
    "science:37": {
      question: "Welches Organ wird zum Atmen verwendet?",
      answers: { Heart: "Herz", Lungs: "Lunge", Stomach: "Magen", Liver: "Leber" }
    },
    "art:73": {
      question: "Welche Farbe entsteht, wenn man Rot und Weiß mischt?",
      answers: { Blue: "Blau", Pink: "Rosa", Green: "Grün", Brown: "Braun" }
    },
    "science:73": {
      question: "Auf welcher Schicht der Erde leben wir?",
      answers: { Core: "Erdkern", Mantle: "Erdmantel", Crust: "Erdkruste", Atmosphere: "Atmosphäre" }
    },
    "crypto:13": {
      question: "Was ist das Hauptziel von Layer-2-Lösungen?",
      answers: { "Minting more tokens": "Mehr Token erzeugen", "Scalability & lower fees": "Skalierbarkeit und niedrigere Gebühren", Mining: "Mining", Staking: "Staking" }
    },
    "science:13": {
      question: "Wie nennt man Tiere, die ausschließlich Pflanzen fressen?",
      answers: { Carnivores: "Fleischfresser", Herbivores: "Pflanzenfresser", Omnivores: "Allesfresser", Predators: "Raubtiere" }
    },
    "crypto:91": {
      question: "Was ist eine Nonce in einer Transaktion?",
      answers: { "A random word": "Ein zufälliges Wort", "A per-account transaction counter": "Ein Transaktionszähler pro Konto", "A token": "Ein Token", "A wallet": "Eine Wallet" }
    }
  },
  ru: {
    "crypto:37": {
      question: "Что представляет собой OpenSea?",
      answers: { DEX: "DEX", "NFT marketplace": "NFT-маркетплейс", Wallet: "Кошелёк", "L2 chain": "Сеть L2" }
    },
    "sports:37": {
      question: "Что следует в теннисе после счёта «ровно», если игрок выигрывает следующий розыгрыш?",
      answers: { Game: "Гейм", Advantage: "Преимущество", Set: "Сет", Match: "Матч" }
    },
    "science:37": {
      question: "Какой орган используется для дыхания?",
      answers: { Heart: "Сердце", Lungs: "Лёгкие", Stomach: "Желудок", Liver: "Печень" }
    },
    "art:73": {
      question: "Какой цвет получится, если смешать красный и белый?",
      answers: { Blue: "Синий", Pink: "Розовый", Green: "Зелёный", Brown: "Коричневый" }
    },
    "science:73": {
      question: "На каком слое Земли мы живём?",
      answers: { Core: "Ядро", Mantle: "Мантия", Crust: "Земная кора", Atmosphere: "Атмосфера" }
    },
    "crypto:13": {
      question: "Какова главная цель решений Layer-2?",
      answers: { "Minting more tokens": "Выпуск большего числа токенов", "Scalability & lower fees": "Масштабируемость и более низкие комиссии", Mining: "Майнинг", Staking: "Стейкинг" }
    },
    "science:13": {
      question: "Как называются животные, которые питаются только растениями?",
      answers: { Carnivores: "Плотоядные", Herbivores: "Травоядные", Omnivores: "Всеядные", Predators: "Хищники" }
    },
    "crypto:91": {
      question: "Что такое nonce в транзакции?",
      answers: { "A random word": "Случайное слово", "A per-account transaction counter": "Счётчик транзакций для каждого аккаунта", "A token": "Токен", "A wallet": "Кошелёк" }
    }
  },
  ar: {
    "crypto:37": {
      question: "ما نوع الخدمة التي تقدمها OpenSea أساسًا؟",
      answers: { DEX: "DEX", "NFT marketplace": "سوق NFT", Wallet: "محفظة", "L2 chain": "شبكة L2" }
    },
    "sports:37": {
      question: "في التنس، ما الذي يأتي بعد التعادل عندما يفوز اللاعب بالنقطة التالية؟",
      answers: { Game: "شوط", Advantage: "أفضلية", Set: "مجموعة", Match: "مباراة" }
    },
    "science:37": {
      question: "ما العضو المستخدم للتنفس؟",
      answers: { Heart: "القلب", Lungs: "الرئتان", Stomach: "المعدة", Liver: "الكبد" }
    },
    "art:73": {
      question: "ما اللون الناتج عن مزج الأحمر بالأبيض؟",
      answers: { Blue: "أزرق", Pink: "وردي", Green: "أخضر", Brown: "بني" }
    },
    "science:73": {
      question: "على أي طبقة من طبقات الأرض نعيش؟",
      answers: { Core: "اللب", Mantle: "الوشاح", Crust: "القشرة الأرضية", Atmosphere: "الغلاف الجوي" }
    },
    "crypto:13": {
      question: "ما الهدف الرئيسي من حلول Layer-2؟",
      answers: { "Minting more tokens": "إنشاء المزيد من الرموز", "Scalability & lower fees": "قابلية توسع أكبر ورسوم أقل", Mining: "التعدين", Staking: "التخزين بالحصص" }
    },
    "science:13": {
      question: "ماذا تسمى الحيوانات التي تتغذى على النباتات فقط؟",
      answers: { Carnivores: "آكلات اللحوم", Herbivores: "آكلات الأعشاب", Omnivores: "القوارت", Predators: "الحيوانات المفترسة" }
    },
    "crypto:91": {
      question: "ما المقصود بالـ nonce في المعاملة؟",
      answers: { "A random word": "كلمة عشوائية", "A per-account transaction counter": "عداد معاملات خاص بكل حساب", "A token": "رمز مميز", "A wallet": "محفظة" }
    }
  },
  zh: {
    "crypto:37": {
      question: "OpenSea 主要是什么平台？",
      answers: { DEX: "DEX", "NFT marketplace": "NFT 市场", Wallet: "钱包", "L2 chain": "L2 网络" }
    },
    "sports:37": {
      question: "网球比赛中，平分后球员再得一分叫什么？",
      answers: { Game: "局", Advantage: "占先", Set: "盘", Match: "比赛" }
    },
    "science:37": {
      question: "哪个器官用于呼吸？",
      answers: { Heart: "心脏", Lungs: "肺", Stomach: "胃", Liver: "肝脏" }
    },
    "art:73": {
      question: "红色和白色混合会变成什么颜色？",
      answers: { Blue: "蓝色", Pink: "粉色", Green: "绿色", Brown: "棕色" }
    },
    "science:73": {
      question: "我们生活在地球的哪一层？",
      answers: { Core: "地核", Mantle: "地幔", Crust: "地壳", Atmosphere: "大气层" }
    },
    "crypto:13": {
      question: "Layer-2 解决方案的主要目标是什么？",
      answers: { "Minting more tokens": "铸造更多代币", "Scalability & lower fees": "提升扩展性并降低费用", Mining: "挖矿", Staking: "质押" }
    },
    "science:13": {
      question: "只吃植物的动物叫什么？",
      answers: { Carnivores: "食肉动物", Herbivores: "食草动物", Omnivores: "杂食动物", Predators: "捕食者" }
    },
    "crypto:91": {
      question: "交易中的 nonce 是什么？",
      answers: { "A random word": "一个随机单词", "A per-account transaction counter": "每个账户的交易计数器", "A token": "一个代币", "A wallet": "一个钱包" }
    },
    "science:91": {
      question: "哪个器官负责过滤血液中的废物？",
      answers: { Heart: "心脏", Kidneys: "肾脏", Lungs: "肺", Brain: "大脑" }
    }
  },
  ja: {
    "crypto:37": {
      question: "OpenSeaは主に何のサービスですか？",
      answers: { DEX: "DEX", "NFT marketplace": "NFTマーケットプレイス", Wallet: "ウォレット", "L2 chain": "L2チェーン" }
    },
    "sports:37": {
      question: "テニスで、デュースの後に選手が次のポイントを取ると何になりますか？",
      answers: { Game: "ゲーム", Advantage: "アドバンテージ", Set: "セット", Match: "マッチ" }
    },
    "science:37": {
      question: "呼吸に使われる器官はどれですか？",
      answers: { Heart: "心臓", Lungs: "肺", Stomach: "胃", Liver: "肝臓" }
    },
    "art:73": {
      question: "赤と白を混ぜると何色になりますか？",
      answers: { Blue: "青", Pink: "ピンク", Green: "緑", Brown: "茶色" }
    },
    "science:73": {
      question: "私たちは地球のどの層に住んでいますか？",
      answers: { Core: "核", Mantle: "マントル", Crust: "地殻", Atmosphere: "大気" }
    },
    "crypto:13": {
      question: "Layer-2ソリューションの主な目的は何ですか？",
      answers: { "Minting more tokens": "より多くのトークンを発行する", "Scalability & lower fees": "拡張性の向上と手数料の削減", Mining: "マイニング", Staking: "ステーキング" }
    },
    "science:13": {
      question: "植物だけを食べる動物を何と呼びますか？",
      answers: { Carnivores: "肉食動物", Herbivores: "草食動物", Omnivores: "雑食動物", Predators: "捕食動物" }
    },
    "crypto:91": {
      question: "トランザクションにおけるnonceとは何ですか？",
      answers: { "A random word": "ランダムな単語", "A per-account transaction counter": "アカウントごとのトランザクションカウンター", "A token": "トークン", "A wallet": "ウォレット" }
    },
    "science:91": {
      question: "血液中の老廃物をろ過する臓器はどれですか？",
      answers: { Heart: "心臓", Kidneys: "腎臓", Lungs: "肺", Brain: "脳" }
    }
  },
  ko: {
    "crypto:37": {
      question: "OpenSea는 주로 어떤 서비스인가요?",
      answers: { DEX: "DEX", "NFT marketplace": "NFT 마켓플레이스", Wallet: "지갑", "L2 chain": "L2 네트워크" }
    },
    "sports:37": {
      question: "테니스에서 듀스 이후 한 선수가 다음 포인트를 따면 무엇이 되나요?",
      answers: { Game: "게임", Advantage: "어드밴티지", Set: "세트", Match: "매치" }
    },
    "science:37": {
      question: "호흡에 사용되는 기관은 무엇인가요?",
      answers: { Heart: "심장", Lungs: "폐", Stomach: "위", Liver: "간" }
    },
    "art:73": {
      question: "빨간색과 흰색을 섞으면 어떤 색이 되나요?",
      answers: { Blue: "파란색", Pink: "분홍색", Green: "초록색", Brown: "갈색" }
    },
    "science:73": {
      question: "우리는 지구의 어느 층에 살고 있나요?",
      answers: { Core: "핵", Mantle: "맨틀", Crust: "지각", Atmosphere: "대기" }
    },
    "crypto:13": {
      question: "Layer-2 솔루션의 주요 목표는 무엇인가요?",
      answers: { "Minting more tokens": "더 많은 토큰 발행", "Scalability & lower fees": "확장성 향상과 수수료 절감", Mining: "채굴", Staking: "스테이킹" }
    },
    "science:13": {
      question: "식물만 먹는 동물을 무엇이라고 하나요?",
      answers: { Carnivores: "육식동물", Herbivores: "초식동물", Omnivores: "잡식동물", Predators: "포식자" }
    },
    "crypto:91": {
      question: "트랜잭션에서 nonce란 무엇인가요?",
      answers: { "A random word": "임의의 단어", "A per-account transaction counter": "계정별 트랜잭션 카운터", "A token": "토큰", "A wallet": "지갑" }
    },
    "science:91": {
      question: "혈액에서 노폐물을 걸러내는 기관은 무엇인가요?",
      answers: { Heart: "심장", Kidneys: "신장", Lungs: "폐", Brain: "뇌" }
    }
  }
};

const root = process.cwd();
const directory = path.join(root, "app", "i18n", "catalogs");

for (const [locale, messages] of Object.entries(overrides)) {
  const catalogPath = path.join(directory, `${locale}.json`);
  const catalog = JSON.parse(await fs.readFile(catalogPath, "utf8"));
  Object.assign(catalog.messages, messages);
  Object.assign(catalog.quiz, quizOverrides[locale] || {});
  await fs.writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
}

console.log(`Applied reviewed UI and quiz overrides to ${Object.keys(overrides).length} locales.`);
