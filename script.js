const API_URL = "https://script.google.com/macros/s/YOUR_DEPLOYED_SCRIPT_ID/exec";

// สลับแท็บ
document.querySelectorAll(".tab-btn").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    document.querySelectorAll(".tab-btn").forEach(b=>b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(tab=>tab.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

// ฟังก์ชันแปลงภาพเป็น Base64
function toBase64(file){
  return new Promise((resolve,reject)=>{
    const reader = new FileReader();
    reader.onload = ()=> resolve(reader.result.split(",")[1]);
    reader.onerror = e => reject(e);
    reader.readAsDataURL(file);
  });
}

// ส่งข้อมูลแจ้งเหตุ
document.getElementById("reportForm").addEventListener("submit", async e=>{
  e.preventDefault();
  Swal.fire({title:"กำลังบันทึก...",allowOutsideClick:false,didOpen:()=>Swal.showLoading()});
  const form = new FormData(e.target);
  let images = [];
  const files = document.getElementById("images").files;
  for(let i=0;i<files.length && i<3;i++){
    images.push(await toBase64(files[i]));
  }
  const data = {
    action:"add",
    fullName:form.get("fullName"),
    address:form.get("address"),
    phone:form.get("phone"),
    details:form.get("details"),
    problemType:form.get("problemType"),
    latitude:form.get("latitude"),
    longitude:form.get("longitude"),
    images:images
  };
  const callback = "cb"+Date.now();
  window[callback] = (res)=>{
    Swal.close();
    if(res.success){
      Swal.fire("สำเร็จ","เลขที่รับแจ้งของคุณคือ "+res.reportNumber,"success");
      e.target.reset();
    }else{
      Swal.fire("ผิดพลาด",res.error,"error");
    }
  };
  const script = document.createElement("script");
  script.src = API_URL+"?callback="+callback+"&data="+encodeURIComponent(JSON.stringify(data));
  document.body.appendChild(script);
});

// โหลดข้อมูลร้องเรียน
function loadReports(){
  const callback = "cb"+Date.now();
  window[callback] = (res)=>{
    const tbody = document.querySelector("#reportTable tbody");
    tbody.innerHTML = "";
    res.data.forEach(r=>{
      tbody.innerHTML += `<tr>
        <td>${r[0]}</td>
        <td>${r[1]}</td>
        <td>${r[4]}</td>
        <td>${r[5]}</td>
        <td>${r[7]}</td>
        <td><button onclick="viewImages('${r[9]}')">ดูรูป</button></td>
      </tr>`;
    });
  };
  const script = document.createElement("script");
  script.src = API_URL+"?callback="+callback;
  document.body.appendChild(script);
}
loadReports();

// ดูภาพ
function viewImages(base64s){
  if(!base64s) return Swal.fire("ไม่มีรูป");
  const imgs = base64s.split("|").map(b=>`<img src="data:image/jpeg;base64,${b}" style="max-width:100%;margin-bottom:5px;">`).join("<br>");
  Swal.fire({html:imgs,width:600});
}
