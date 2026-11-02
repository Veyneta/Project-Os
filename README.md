# CPU Scheduling Lab

เว็บแอปพลิเคชันสำหรับจำลองและศึกษาอัลกอริทึมการจัดตารางการทำงานของ CPU
ผู้ใช้สามารถกำหนด Process, Arrival Time, Burst Time และ Time Quantum
จากหน้าเว็บ แล้วดูผลลัพธ์การคำนวณพร้อมกราฟและตารางเปรียบเทียบได้ทันที

## อัลกอริทึมที่รองรับ

### FCFS (First-Come, First-Served)

ประมวลผลตามลำดับ Process ที่รับเข้ามา โดย Process ที่มาก่อนได้ทำงานก่อน

### SJF-NP (Shortest Job First, Non-preemptive)

เลือก Process ที่มี Burst Time น้อยที่สุดจาก Process ที่มาถึงแล้ว
เมื่อเริ่มทำงานแล้วจะทำต่อจนเสร็จ ก่อนเลือก Process ถัดไป

### RR (Round Robin)

แบ่งเวลาให้แต่ละ Process ตาม Time Quantum
เมื่อหมด Quantum และ Process ยังทำงานไม่เสร็จ จะนำกลับไปต่อท้ายคิว

> SRTF ยังไม่รองรับและไม่ได้แสดงในหน้า UI

## ความสามารถของระบบ

- เพิ่มและลดจำนวน Process ได้สูงสุด 10 Process
- กำหนด Process ID, Arrival Time (AT) และ Burst Time (BT)
- เลือก FCFS, SJF-NP หรือ Round Robin
- กำหนด Time Quantum สำหรับ Round Robin
- สุ่มค่า Arrival Time และ Burst Time
- แสดงผล `ST`, `CT`, `TAT`, `WT` ของทุก Process
- แสดง `AVG WT` หรือค่าเฉลี่ย Waiting Time
- แสดง Execution Order
- แสดง Gantt Chart ของช่วงเวลาที่ CPU ทำงาน
- แสดงกราฟเปรียบเทียบ Average WT
- แสดงตารางเปรียบเทียบ FCFS, SJF และ Round Robin
- ไฮไลต์อัลกอริทึมที่มี Average WT ต่ำที่สุด
- แสดงสูตรคำนวณที่ใช้ในระบบ
- แจ้งข้อผิดพลาดเมื่อข้อมูลไม่ถูกต้อง
- ล้างผลลัพธ์เก่าเมื่อการคำนวณครั้งใหม่ไม่ผ่าน validation
- รองรับหน้าจอขนาดเล็กด้วย Responsive Layout

## ค่าที่ใช้ในการคำนวณ

| ค่า | ความหมาย | สูตรหรือแหล่งข้อมูล |
|---|---|---|
| AT (Arrival Time) | เวลาที่ Process มาถึง | กำหนดจากข้อมูลนำเข้า ต้องเป็นตัวเลขตั้งแต่ 0 ขึ้นไป |
| BT (Burst Time) | เวลาที่ Process ต้องใช้ CPU | กำหนดจากข้อมูลนำเข้า ต้องเป็นจำนวนเต็มบวก |
| ST (Start Time) | เวลาเริ่มทำงานครั้งแรก | คำนวณจากลำดับการจัดตาราง |
| CT (Completion Time) | เวลาที่ Process ทำงานเสร็จ | เวลาสิ้นสุดการทำงาน |
| TAT (Turnaround Time) | เวลาตั้งแต่มาถึงจนทำงานเสร็จ | `TAT = CT - AT` |
| WT (Waiting Time) | เวลาที่รอ CPU รวม | `WT = TAT - BT` |
| AVG WT | ค่าเฉลี่ย Waiting Time | `AVG WT = ผลรวม WT / จำนวน Process` |

สำหรับ Round Robin ค่า `ST` คือเวลาเริ่มทำงานครั้งแรก และ `CT` คือเวลาที่
Quantum สุดท้ายทำให้ Process เสร็จ นอกจากนี้ระบบจะสร้าง `timeline`
สำหรับนำไปแสดงเป็น Gantt Chart

## โครงสร้างไฟล์

- `index.html` — โครงสร้างหน้าเว็บ ฟอร์ม ตาราง กราฟ และส่วนแสดงผล
- `styles.css` — Dark Theme, Responsive Layout, การ์ด ตาราง และกราฟ
- `app.js` — จัดการ UI รับข้อมูล เรียก Scheduler และ render ผลลัพธ์
- `scheduler.js` — แกนคำนวณอัลกอริทึมและ validation
- `scheduler.test.js` — Unit Tests และ Edge-case Tests

## การใช้งานหน้าเว็บ

ปุ่ม `คู่มือสั้น` ด้านบนหรือท้ายหน้าเว็บจะเปิดขั้นตอนการใช้งานแบบย่อ
และมีลิงก์ไปยัง README ฉบับเต็ม

1. เปิด `index.html` ด้วยเว็บเบราว์เซอร์
2. เพิ่มหรือลด Process ตามต้องการ
3. กรอก Arrival Time และ Burst Time
4. เลือกอัลกอริทึม
5. หากเลือก Round Robin ให้กรอก Time Quantum
6. กด `เริ่มจำลอง`
7. ดูผลลัพธ์ในตาราง, Gantt Chart และกราฟ
8. กด `เปรียบเทียบทั้งหมด` เพื่อคำนวณและจัดอันดับทั้ง 3 อัลกอริทึม

ปุ่ม `สุ่มค่า AT และ BT` จะสุ่ม:

- Arrival Time ในช่วง `0–5`
- Burst Time ในช่วง `1–9`

ค่าที่สุ่มจะถูกตรวจสอบด้วย validation เดียวกับข้อมูลที่ผู้ใช้กรอกเอง

## API ของ Scheduler

ไฟล์ `scheduler.js` สามารถใช้ได้ทั้งใน Browser ผ่าน `window.Scheduler`
และใน Node.js ผ่าน `require`

```javascript
const processes = [
  { id: "P1", arrivalTime: 0, burstTime: 5 },
  { id: "P2", arrivalTime: 0, burstTime: 3 },
  { id: "P3", arrivalTime: 0, burstTime: 8 }
];

const fcfsResult = Scheduler.fcfs(processes);
const sjfResult = Scheduler.sjf(processes);
const rrResult = Scheduler.roundRobin(processes, 2);
const selectedResult = Scheduler.runScheduler("sjf", processes, 2);
```

ฟังก์ชันหลัก:

- `fcfs(processes)`
- `sjf(processes)`
- `roundRobin(processes, quantum)`
- `calculateMetrics(processes)`
- `runScheduler(algorithm, processes, quantum)`

รูปแบบผลลัพธ์หลัก:

```javascript
{
  algorithm: "SJF",
  processes: [
    {
      id: "P2",
      arrivalTime: 0,
      burstTime: 3,
      ST: 0,
      CT: 3,
      TAT: 3,
      WT: 0
    }
  ],
  avgWT: 3.67,
  AVG_WT: 3.67,
  executionOrder: ["P2", "P1", "P3"],
  timeline: [
    { id: "P2", start: 0, end: 3 }
  ]
}
```

`executionOrder` จะมีในผลลัพธ์ Round Robin และ `timeline` ใช้สำหรับ
สร้าง Gantt Chart

## Validation

ระบบจะปฏิเสธข้อมูลต่อไปนี้:

- ไม่มี Process
- `processes` ไม่ใช่ Array
- Burst Time เป็น 0, ค่าติดลบ, ทศนิยม หรือไม่ใช่ตัวเลข
- Arrival Time ติดลบหรือไม่ใช่ตัวเลข
- Time Quantum เป็น 0, ค่าติดลบ, ทศนิยม หรือไม่ใช่ตัวเลข
- เลือก Algorithm ที่ไม่รองรับ

เมื่อเกิดข้อผิดพลาด หน้าเว็บจะแสดงข้อความแจ้งเตือนและล้างผลลัพธ์เก่า
เพื่อป้องกันการแสดงข้อมูลที่ไม่ตรงกับ Input ปัจจุบัน

## วิธีรันทดสอบ

ต้องติดตั้ง Node.js ก่อน จากนั้นเปิด Terminal หรือ PowerShell
ในโฟลเดอร์โปรเจกต์:

```powershell
node --test scheduler.test.js
```

หรือใช้คำสั่ง:

```powershell
node scheduler.test.js
```

ผลลัพธ์ที่คาดหวัง:

```text
scheduler tests passed
pass 1
fail 0
```

ชุดทดสอบครอบคลุม:

- ผลคำนวณ FCFS, SJF และ Round Robin
- ค่า ST, CT, TAT, WT และ AVG WT
- Arrival Time ที่แตกต่างกัน
- Execution Order และ Round Robin Timeline
- Empty Process List
- Burst Time ไม่ถูกต้อง
- Time Quantum ไม่ถูกต้อง
- Dispatcher `runScheduler`

## หมายเหตุ

- โปรเจกต์เป็น Static Web App ไม่ต้องใช้ Backend
- ต้องวาง `index.html`, `styles.css`, `app.js` และ `scheduler.js`
  ไว้ในโฟลเดอร์เดียวกัน
- Browser รุ่นใหม่สามารถเปิด `index.html` ได้โดยตรง
- ค่า Average WT ในหน้าเว็บแสดงทศนิยม 2 ตำแหน่ง
- SJF ในระบบนี้เป็น Non-preemptive
