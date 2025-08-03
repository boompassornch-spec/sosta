const GAS_URL = "YOUR_DEPLOYED_GAS_URL"; // แทนด้วย URL Web App

// เปิดแท็บ
function openTab(tab) {
  document.querySelectorAll(".tab").forEach(e => e.style.display="none");
  document.getElementById(tab).style.display = "block";
}
openTab('report');

// ฟอร์มแจ้งเหตุ
document.getElementById("reportForm").addEventListener("submit", async function(e){
  e.preventDefault();
  Swal.fire({title:'กำลังบันทึก...', allowOutsideClick:false, didOpen:()=>Swal.showLoading()});
  const files = document.getElementById("images").files;
  const base64Images = [];
  for (let file of files) {
    base64Images.push(await toBase64(file));
  }
  const data = {
    fullName: document.getElementById("fullName").value,
    address: document.getElementById("address").value,
    phone: document.getElementById("phone").value,
    details: document.getElementById("details").value,
    problemType: document.getElementById("problemType").value,
    latitude: document.getElementById("latitude").value,
    longitude: document.getElementById("longitude").value,
    images: base64Images
  };
  jsonp(GAS_URL, {action:"add", data:JSON.stringify(data)}, function(res){
    Swal.close();
    if(res.success){
      Swal.fire('สำเร็จ!', `เลขที่รับแจ้งของคุณคือ ${res.reportNumber}`, 'success');
      document.getElementById("reportForm").reset();
    }else{
      Swal.fire('ผิดพลาด', res.error, 'error');
    }
  });
});

// ดึงข้อมูลร้องเรียน
function fetchReports(){
  jsonp(GAS_URL, {action:"list", search:document.getElementById("searchReportNumber").value}, function(res){
    const tbody = document.querySelector("#reportTable tbody");
    tbody.innerHTML="";
    res.data.forEach(r=>{
      const tr=document.createElement("tr");
      tr.innerHTML=`<td>${r[0]}</td><td>${r[1]}</td><td>${r[4]}</td><td>${r[5]}</td><td>${r[7]}</td>`;
      tbody.appendChild(tr);
    });
  });
}

// ล็อกอินเจ้าหน้าที่
function adminLogin(){
  const user=document.getElementById("adminUser").value;
  const pass=document.getElementById("adminPass").value;
  if(user==="admin" && pass==="053797149ta"){
    document.getElementById("adminLogin").style.display="none";
    document.getElementById("adminPanel").style.display="block";
    fetchAdminData();
  }else{
    Swal.fire('ผิดพลาด','ข้อมูลเข้าสู่ระบบไม่ถูกต้อง','error');
  }
}

// ดึงข้อมูล Admin
function fetchAdminData(){
  jsonp(GAS_URL, {action:"list"}, function(res){
    const tbody = document.querySelector("#adminTable tbody");
    tbody.innerHTML="";
    res.data.forEach((r,i)=>{
      const tr=document.createElement("tr");
      tr.innerHTML=`<td>${r[0]}</td><td>${r[1]}</td><td>${r[4]}</td><td>${r[5]}</td>
        <td>
          <select onchange="updateStatus('${r[0]}',this.value)">
            <option ${r[7]=='รอดำเนินการ'?'selected':''}>รอดำเนินการ</option>
            <option ${r[7]=='กำลังตรวจสอบ'?'selected':''}>กำลังตรวจสอบ</option>
            <option ${r[7]=='ดำเนินการแล้วเสร็จ'?'selected':''}>ดำเนินการแล้วเสร็จ</option>
          </select>
        </td>`;
      tbody.appendChild(tr);
    });
  });
}

// อัปเดตสถานะ
function updateStatus(reportNumber,status){
  jsonp(GAS_URL, {action:"update", reportNumber:reportNumber, status:status}, function(res){
    if(res.success) Swal.fire('สำเร็จ','อัปเดตสถานะเรียบร้อย','success');
  });
}

// Export PDF
function exportPDF(){
  jsonp(GAS_URL, {action:"list"}, function(res){
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.addImage("logo.png", "PNG", 10, 5, 30, 30);
    doc.setFontSize(16);
    doc.text("รายงานสรุปข้อมูลแจ้งเหตุ", 50, 20);
    doc.autoTable({
      startY:40,
      head:[['เลขที่','ชื่อ','รายละเอียด','ประเภท','สถานะ']],
      body:res.data.map(r=>[r[0],r[1],r[4],r[5],r[7]])
    });
    const pageCount = doc.internal.getNumberOfPages();
    for(let i=1;i<=pageCount;i++){
      doc.setPage(i);
      doc.text(`หน้า ${i}/${pageCount}`, 180, 290);
    }
    doc.save("report.pdf");
  });
}

// Helper JSONP
function jsonp(url, params, callback){
  const cbName = 'cb'+Date.now();
  params.callback = cbName;
  window[cbName] = function(data){ callback(data); document.body.removeChild(script); delete window[cbName]; };
  const qs = Object.keys(params).map(k=>`${k}=${encodeURIComponent(params[k])}`).join('&');
  const script = document.createElement('script');
  script.src = `${url}?${qs}`;
  document.body.appendChild(script);
}

// Helper แปลง Base64
function toBase64(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.readAsDataURL(file);
    reader.onload=()=>resolve(reader.result);
    reader.onerror=error=>reject(error);
  });
}
