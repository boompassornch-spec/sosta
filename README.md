# ระบบแจ้งเหตุสาธารณภัย อบต.ต้า

Web App สำหรับแจ้งเหตุ + จัดการข้อมูล + สถิติ + Export PDF  
เชื่อม Google Apps Script ผ่าน JSONP และ Deploy บน GitHub Pages

## โครงสร้าง
- index.html : หน้าเว็บหลัก
- style.css : CSS
- script.js : Logic + SweetAlert + JSONP
- logo.png : โลโก้
- google_app_script.gs : โค้ดฝั่ง Google Apps Script

## วิธีใช้งาน
1. อัปโหลดไฟล์ทั้งหมดไปที่ GitHub Repository
2. เปิด Settings > Pages > เลือก Branch `main` และโฟลเดอร์ `/ (root)`
3. Deploy Google Apps Script เพื่อใช้เป็น Backend
4. แก้ไขค่า `GAS_URL` ใน script.js ให้ตรงกับ Web App URL
