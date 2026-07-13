# Base Quiz — v2 kontrat taşıma rehberi

Amaç: günlük tx limitini kaldırmak, ama mevcut 13 oyuncunun skor/streak/sıralamasını
ve kazanılmış rozetleri **kaybetmeden** taşımak.

Deploy'u **kendi cüzdanınla** (`0x509549D76B75F58dfda659cFca25b234086DdD7F`) yap —
`seed` / `seedMint` yalnızca owner (deploy eden) tarafından çağrılabilir.

Ortam: Remix → Environment **"Injected Provider - MetaMask"** (veya cüzdanın),
ağ **Base Mainnet (8453)**. Az miktarda Base ETH (gas) gerekir.

---

## 1) QuizLeaderboard deploy et

1. Remix'te `QuizLeaderboard.sol` dosyasını aç, **Compile** et (Solidity 0.8.20+).
2. Deploy sekmesinde Environment = Injected (Base Mainnet), kontrat = `QuizLeaderboard`.
3. **Deploy** → cüzdanda onayla. Deploy edilen adresi **not al** → buna `LB_V2` diyelim.

## 2) Leaderboard verisini taşı — `seed(...)`

Deployed Contracts altında `seed` fonksiyonunu aç, 5 alanı **aynen** şöyle doldur:

**addrs**
```
["0xD03CBBD536d32e5DF9a54dEa93FCE665303c2f20","0x509549D76B75F58dfda659cFca25b234086DdD7F","0xce835359202acbB4a10d9a2f97a72E6d0B76f1e2","0x480e398c7E261dACB2239e1d68E08f20af89F06a","0xD8a83e7C41b5a49dA16D7a73bda7a6A448477B6f","0x71AAD1110dFd8F60249cD45ce4fb05163b6f812B","0xa2435fD3AB620e5221bEEca3062BEb04D9B72A93","0x3185110662ceCe9585c5399016bf4AEE7AE33FCD","0x06486305d05C6ed2e940cd49341F8AD2c707a86a","0x6C169b4D43E93500849F06D1A058d6f105ab64Bc","0xF159092AD36E8D0524BE07f703866B1866d3d94D","0xBe96fB12585Bd1cd2822Ae451A69eA5E8970806F","0xF791813F5098D8D9aE85383aD5E18849ee32Ae04"]
```
**best**
```
[1190,1210,220,870,1040,860,1060,1140,1130,1230,1050,780,770]
```
**total**
```
[10440,12760,220,2250,1040,860,5820,9760,1130,7640,1050,780,770]
```
**streak**
```
[1,1,1,1,1,1,1,3,1,1,1,1,1]
```
**lastDay**
```
[20643,20644,20617,20647,20618,20635,20644,20645,20632,20647,20637,20637,20647]
```

`transact` → onayla. Tek işlemde 13 oyuncu taşınır. (İstersen `getPlayerCount`
çağırıp `13` döndüğünü doğrula.)

## 3) QuizBadges deploy et

1. `QuizBadges.sol` aç, **Compile** et. (İlk derlemede Remix OpenZeppelin'i indirir.)
2. Deploy sekmesinde kontrat = `QuizBadges`. Constructor alanı **`_leaderboard`**:
   → **1. adımdaki `LB_V2` adresini** gir.
3. **Deploy** → onayla. Adresi not al → `BADGES_V2`.

## 4) Rozetleri taşı — `seedMint(...)`

`seedMint` fonksiyonunu aç:

**to**
```
["0xD03CBBD536d32e5DF9a54dEa93FCE665303c2f20","0xa2435fD3AB620e5221bEEca3062BEb04D9B72A93"]
```
**ids**
```
[1,1]
```
`transact` → onayla. İki Bronze rozet sahibi taşınır.

## 5) Bana iki adresi ver

`LB_V2` ve `BADGES_V2` adreslerini bana söyle. Ben:
- `app/contract.ts` içindeki `CONTRACT_ADDRESS` ve `BADGES_ADDRESS`'i güncellerim,
- frontend'deki günlük limit engellerini kaldırırım (artık sınırsız oynanır),
- build alıp commit + push ederim.

---

### Notlar
- **Sıralama:** Tablo hâlâ `totalScore`'a göre sıralı. Limit kalkınca çok oynayan
  toplamı şişirebilir. İstersen sıralamayı `bestScore`'a çevirebilirim — söyle.
- **Streak mantığı:** Yeni kontratta günde istediğin kadar tx atarsın; streak yalnızca
  yeni bir UTC gününde ilk oynadığında artar, bir günden fazla ara verilirse 1'e döner.
- **NFT görseli:** `uri` bir placeholder; cüzdanda görsel isteniyorsa sonradan
  gerçek metadata endpoint'i ekleriz (fonksiyonu etkilemez).
- Owner sadece `seed`/`seedMint` için; normal oyun akışını etkilemez.
