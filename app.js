const KEY="patrimoine-v1";
const initial={accounts:[{id:crypto.randomUUID(),name:"Mon patrimoine",siren:""}],activeAccountId:null,properties:[],tenants:[]};
let state=load();let installPrompt;
function load(){try{const s=JSON.parse(localStorage.getItem(KEY));if(s?.accounts?.length){s.activeAccountId||=s.accounts[0].id;return s}}catch{}initial.activeAccountId=initial.accounts[0].id;return initial}
function save(){localStorage.setItem(KEY,JSON.stringify(state));render()}
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
function current(){return state.accounts.find(a=>a.id===state.activeAccountId)}
function mine(list){return list.filter(x=>x.accountId===state.activeAccountId)}
function euro(n){return new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(n||0)}
function esc(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function render(){
 $("#accountSelect").innerHTML=state.accounts.map(a=>`<option value="${a.id}" ${a.id===state.activeAccountId?"selected":""}>${esc(a.name)}</option>`).join("");
 const props=mine(state.properties), tenants=mine(state.tenants);
 $("#statProperties").textContent=props.length;
 $("#statUnits").textContent=props.reduce((n,p)=>n+Number(p.units||0),0);
 $("#statTenants").textContent=tenants.length;
 $("#statRent").textContent=euro(tenants.reduce((n,t)=>n+Number(t.rent||0),0));
 $("#propertyList").innerHTML=props.length?props.map(p=>`<article class="item card"><span class="badge">${esc(p.type)}</span><h3>${esc(p.name)}</h3><div class="meta">${esc(p.zip)} ${esc(p.city)}</div><div class="meta">Cadastre : ${esc(p.section||"—")} ${esc(p.parcel||"")}</div><div class="row"><span>${Number(p.area||0).toLocaleString("fr-FR")} m² · ${p.units||0} logement(s)</span><button class="danger" data-delete-property="${p.id}">Supprimer</button></div></article>`).join(""):'<div class="empty card">Ajoutez votre première forêt, parcelle ou habitation.</div>';
 $("#tenantProperty").innerHTML=props.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join("");
 $("#tenantList").innerHTML=tenants.length?tenants.map(t=>{const p=state.properties.find(x=>x.id===t.propertyId);return `<article class="item card"><span class="badge">${esc(t.unit||"Location")}</span><h3>${esc(t.name)}</h3><div class="meta">${esc(p?.name||"Bien supprimé")}</div><div class="meta">${esc(t.phone||"")} ${t.email?"· "+esc(t.email):""}</div><div class="row"><strong>${euro(t.rent)}/mois</strong><button class="danger" data-delete-tenant="${t.id}">Supprimer</button></div></article>`}).join(""):'<div class="empty card">Aucun locataire pour cette société.</div>';
 $("#accountList").innerHTML=state.accounts.map(a=>`<article class="item card"><span class="badge">${a.id===state.activeAccountId?"Compte actif":"Propriétaire"}</span><h3>${esc(a.name)}</h3><div class="meta">SIREN : ${esc(a.siren||"Non renseigné")}</div><div class="row"><span>${state.properties.filter(p=>p.accountId===a.id).length} bien(s)</span>${state.accounts.length>1?`<button class="danger" data-delete-account="${a.id}">Supprimer</button>`:""}</div></article>`).join("");
}
$$(".tab").forEach(b=>b.onclick=()=>{$$(".tab,.view").forEach(x=>x.classList.remove("active"));b.classList.add("active");$("#"+b.dataset.view).classList.add("active")});
$("#accountSelect").onchange=e=>{state.activeAccountId=e.target.value;save()};
function open(id){$(id).showModal()}
$("#addAccountBtn").onclick=$("#addAccountBtn2").onclick=()=>open("#accountDialog");
$("#addPropertyBtn").onclick=()=>open("#propertyDialog");
$("#addTenantBtn").onclick=()=>{if(!mine(state.properties).length)return alert("Ajoutez d’abord un bien.");open("#tenantDialog")};
function formData(form){return Object.fromEntries(new FormData(form))}
$("#accountForm").addEventListener("submit",e=>{if(e.submitter?.value==="cancel")return;const d=formData(e.target),a={id:crypto.randomUUID(),...d};state.accounts.push(a);state.activeAccountId=a.id;e.target.reset();save()});
$("#propertyForm").addEventListener("submit",e=>{if(e.submitter?.value==="cancel")return;state.properties.push({id:crypto.randomUUID(),accountId:state.activeAccountId,...formData(e.target)});e.target.reset();save()});
$("#tenantForm").addEventListener("submit",e=>{if(e.submitter?.value==="cancel")return;state.tenants.push({id:crypto.randomUUID(),accountId:state.activeAccountId,...formData(e.target)});e.target.reset();save()});
document.addEventListener("click",e=>{
 const p=e.target.dataset.deleteProperty,t=e.target.dataset.deleteTenant,a=e.target.dataset.deleteAccount;
 if(p&&confirm("Supprimer ce bien et ses locataires ?")){state.properties=state.properties.filter(x=>x.id!==p);state.tenants=state.tenants.filter(x=>x.propertyId!==p);save()}
 if(t&&confirm("Supprimer ce locataire ?")){state.tenants=state.tenants.filter(x=>x.id!==t);save()}
 if(a&&confirm("Supprimer cette société et toutes ses données ?")){state.accounts=state.accounts.filter(x=>x.id!==a);state.properties=state.properties.filter(x=>x.accountId!==a);state.tenants=state.tenants.filter(x=>x.accountId!==a);state.activeAccountId=state.accounts[0].id;save()}
});
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();installPrompt=e;$("#installBtn").classList.remove("hidden")});
$("#installBtn").onclick=async()=>{await installPrompt?.prompt();installPrompt=null;$("#installBtn").classList.add("hidden")};
if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js");
render();