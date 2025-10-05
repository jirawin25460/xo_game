# XO Game

## วิธีการ Setup และ Run โปรแกรม

### 1. ติดตั้งเครื่องมือที่จำเป็น

| ส่วน | เครื่องมือ | เหตุผล |
|------|------------|--------|
| Backend | Java 17+, IntelliJ IDEA, Maven | รัน Spring Boot API และ build project |
| Database | MySQL 8+ | เก็บข้อมูลเกมและการเดินหมาก |
| Frontend | Node.js 18+, VSCode | สร้างเว็บ React และรัน dev server |
| Optional | Postman | ทดสอบ API แบบ manual |

### 2. Setup Database

สร้างฐานข้อมูลและผู้ใช้:

```sql
CREATE DATABASE xo_game;

CREATE USER 'root'@'localhost' IDENTIFIED BY '1234';
GRANT ALL PRIVILEGES ON xo_game.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Run Backend

ตรวจสอบ `application.properties` แล้วรัน:

```
mvn clean install  
mvn spring-boot:run
```

Backend จะรันที่: http://localhost:8080

### 4. Run Frontend

```
cd xogame_frontend  
npm install  
npm start
```

Frontend จะรันที่: http://localhost:3000

---

## วิธีออกแบบโปรแกรม

### Backend (Spring Boot)

**หน้าที่:** จัดการข้อมูลเกม, การเดินหมาก, ตรวจชนะ/แพ้  

**องค์ประกอบหลัก:**

- Model
  - `Game` → เก็บข้อมูลเกม เช่น ขนาดบอร์ด, ผู้เล่น, สถานะเกม
  - `Move` → เก็บการเดินแต่ละตา (แถว, คอลัมน์, ผู้เล่น)
- Repository
  - ใช้ JPA บันทึก `Game` และ `Move` ลงฐานข้อมูล
- Service
  - `GameService` → จัดการตรรกะหลัก เช่น เริ่มเกม, ตรวจชนะ, เปลี่ยนตา
  - `BotService` → คำนวณการเดินของบอทด้วย Minimax + Alpha-Beta Pruning
- Controller
  - `GameController` → เปิด API สำหรับ Frontend เช่น `/create`, `/{gameId}/move`, `/{gameId}/moves`, `/{gameId}`

### Frontend (React)

**หน้าที่:** แสดงกระดาน XO, รับการคลิก, แสดง Replay  

**องค์ประกอบหลัก:**

- `Home.js` → หน้าแรกของเกม: ตั้งขนาดกระดาน, เลือกโหมด, ปุ่มดู All Games / Replay
- `Play.js` → เล่นเกมจริง: แสดงกระดาน, คะแนน, สถานะเกม, Bot Move อัตโนมัติ
- `All Game.js` → หน้าแสดงรายการเกม: เกมที่เล่น, ผู้ชนะ, สถานะเกม
- `Replay.js` → เล่นย้อนหลังเกม: แสดงกระดานทีละตา, ปุ่มเล่น/หยุด, เดินหน้า/ถอยหลัง
- `GameBoard.js` → แสดงกระดาน XO ขนาด N×N
- `api.js` → ติดต่อ Backend ผ่าน REST API: createGame(), makeMove(), getGame(), getMoves(), getAllGames()

---

## วิธีการทำงาน

**1. หน้า Home**
- ผู้ใช้เลือก:
  - ขนาดกระดาน (3×3 ถึง 19×19)
  - โหมดเกม: Human vs Human หรือ Human vs Bot
- กดปุ่ม Start Game หรือ View Replays
- React เรียก API:
  - createGame() → สร้างเกมใหม่ (Play)
  - getAllGames() → ดูรายการเกมทั้งหมด (Replay)

**2. หน้า Play**
- GameService.createGame(size, playerX, playerO, botX, botO)
  - สร้าง Entity Game:
    - ขนาดกระดาน, ผู้เล่น, Bot, สถานะ = ONGOING
- บันทึกลงฐานข้อมูล
- สุ่มผู้เริ่มเกม (Math.random() < 0.5)
- ถ้าฝ่ายเริ่มเป็น Bot → เรียก:
  - BotService.getBotMove(game, botPlayer) → คำนวณตาแรก
  - บันทึก Move ลงฐานข้อมูล (makeMoveInternal)
- ส่งข้อมูลเกมกลับไปยัง React → อัปเดตกระดาน

**3. การเล่นเกม**
- Human vs Human
  - ผู้เล่นคลิกช่องบนกระดาน
  - React เรียก makeMove(gameId, player, row, col) → Backend
  - Backend:
    - บันทึก Move (makeMoveInternal)
    - ตรวจผลชนะ (checkWinner())
  - ส่งสถานะเกม + กระดานล่าสุดกลับ React → แสดงผลผู้ชนะ / ตาต่อไป

- Human vs Bot
  - ผู้เล่นเดินหมาก → ส่งไป Backend
  - Backend บันทึก Move → ตรวจผลชนะ
  - ถ้าเกมยังไม่จบ และเป็นตาของ Bot:
    - BotService.getBotMove(game, botPlayer) → คำนวณ Move
    - บันทึก Move ของ Bot → ตรวจผลชนะ
  - ส่งสถานะเกม + กระดานล่าสุดกลับ React → อัปเดตกระดานทันที
    
**4.วิธีคิดของ Bot**
  - Bot ของเราใช้ สองขั้นตอนหลัก ขึ้นอยู่กับว่าเป็นตาแรกหรือไม่:
    - ตาแรก (firstSmartMove())
    - Bot จะเลือก ตำแหน่งที่ดีที่สุดเบื้องต้น เพื่อสร้างความได้เปรียบตั้งแต่เริ่ม:
      - กลางกระดาน (ถ้าว่าง) → เพราะมีโอกาสชนะหลายทิศทาง
      - มุมทั้ง 4 → หากกลางถูกจับไปแล้ว
      - ช่องว่างอื่น ๆ → ถ้าไม่มีตำแหน่งที่ "preferred" ว่าง
  - Bot จะสุ่มเลือกจากตำแหน่งที่ว่างในลำดับความสำคัญนี้
  - ผล: ตาแรกจะเป็นตำแหน่งที่ช่วยให้ Bot มีโอกาสชนะสูงสุดในอนาคต
  - หลังตาแรก (minimaxMove())
    - Bot ใช้ Minimax Algorithm + Alpha-Beta Pruning เพื่อตัดสินใจ
    - หลักการ Minimax:
      - Bot สมมุติว่าเล่น ทุกความเป็นไปได้ ของเกมจนถึงความลึกที่กำหนด (depthLimit)
      - สร้าง Tree ของการเดินหมาก
      - Maximizing player (Bot): เลือกทางที่ได้คะแนนสูงสุด
      - Minimizing player (Opponent): สมมุติว่าเลือกทางที่ Bot เสียเปรียบมากที่สุด
  - Alpha-Beta Pruning:
      - ตัดสาขาของ Tree ที่ไม่จำเป็น → ลดเวลาในการคิด
  - การประเมินคะแนน:
     - Bot ชนะ: +10 + depth → ชนะเร็วได้คะแนนสูงกว่า
     - Opponent ชนะ: -10 - depth → แพ้ช้าเสียคะแนนน้อยกว่า
     - Draw: 0
     - ถ้า depth ถึง 0 → ใช้ evaluateBoard()
       - นับ sequence ของ Bot และ Opponent → ให้คะแนนตามความใกล้ชนะ
  - ความสามารถในการบล็อคและชนะ
  - Bot จะตรวจทุกความเป็นไปได้:
      - ถ้าฝ่ายตรงข้ามมีโอกาสชนะในตาถัดไป → Bot จะ บล็อค ตรงนั้น
      - ถ้า Bot สามารถชนะได้ → Bot จะเลือกชนะทันที
  - สรุป: Bot ไม่ได้เดินแบบสุ่มหลังตาแรก แต่คำนวณทั้ง โอกาสชนะ และ ป้องกันคู่ต่อสู้

**5.การตรวจผลชนะ**
  - หลังทุก Move:
    - ตรวจทุก แถว, คอลัมน์, แนวทแยง
    - ถ้า X หรือ O เรียงครบ → winner = X/O และ status = FINISHED
    - ถ้ากระดานเต็ม → winner = Draw

**6. หน้า AllGame / Replay**
  - React เรียก:
    - getAllGames() → แสดงรายการเกมทั้งหมด
    - getGame(gameId) → ดึง Move ทั้งหมดสำหรับ Replay
  - ผู้ใช้สามารถ:
    - กด Next / Previous / Play / Pause / Back
    - React แสดงกระดานทีละ Move → Replay เหมือนเกมจริง
---
