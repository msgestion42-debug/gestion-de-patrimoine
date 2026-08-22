// V5.3 editing layer: make companies, properties and tenants editable after creation.
(function(){
  const q=s=>document.querySelector(s);

  function ensureEditMediaBox(){
    const form=q('#propertyForm');
    if(!form||q('#existingMediaBox'))return;
    const box=document.createElement('div');
    box.id='existingMediaBox';
    box.className='card';
    box.style.margin='10px 0';
    box.innerHTML='<div class="meta"><strong>Médias existants</strong></div><div id="existingPhotos"></div><div id="existingPlans"></div>';
    const actions=form.querySelector('.actions');
    form.insertBefore(box,actions);
  }

  function addEditButtons(){
    document.querySelectorAll('[data-delete-property]').forEach(btn=>{
      const id=btn.dataset.deleteProperty;
      const row=btn.parentElement;
      if(row&&!row.querySelector(`[data-edit-property="${id}"]`)){
        const b=document.createElement('button'); b.textContent='✏️ Modifier'; b.dataset.editProperty=id; row.insertBefore(b,btn);
      }
    });
    document.querySelectorAll('[data-delete-tenant]').forEach(btn=>{
      const id=btn.dataset.deleteTenant;
      const row=btn.parentElement;
      if(row&&!row.querySelector(`[data-edit-tenant="${id}"]`)){
        const b=document.createElement('button'); b.textContent='✏️ Modifier'; b.dataset.editTenant=id; row.insertBefore(b,btn);
      }
    });
    document.querySelectorAll('#accountList article').forEach(card=>{
      const del=card.querySelector('[data-delete-account]');
      let id=del?.dataset.deleteAccount;
      if(!id){
        const name=card.querySelector('h3')?.textContent;
        id=(state.accounts||[]).find(a=>a.name===name)?.id;
      }
      const row=card.querySelector('.row');
      if(id&&row&&!row.querySelector(`[data-edit-account="${id}"]`)){
        const b=document.createElement('button'); b.textContent='✏️ Modifier'; b.dataset.editAccount=id; if(del)row.insertBefore(b,del); else row.appendChild(b);
      }
    });
  }

  const originalRender=render;
  render=function(){originalRender();addEditButtons()};

  function setDialogTitle(dialogId,title){const h=q(dialogId+' h2');if(h)h.textContent=title}

  function openAccountEdit(id){
    const a=state.accounts.find(x=>x.id===id); if(!a)return;
    const f=q('#accountForm'); f.dataset.editId=id; f.elements.name.value=a.name||''; f.elements.siren.value=a.siren||'';
    setDialogTitle('#accountDialog','Modifier la société'); q('#accountDialog').showModal();
  }

  function openTenantEdit(id){
    const t=state.tenants.find(x=>x.id===id); if(!t)return;
    const f=q('#tenantForm'); f.dataset.editId=id;
    for(const [k,v] of Object.entries(t)){if(f.elements[k])f.elements[k].value=v??''}
    setDialogTitle('#tenantDialog','Modifier le locataire'); q('#tenantDialog').showModal();
  }

  function renderExistingMedia(p){
    ensureEditMediaBox();
    const photos=p.photos||[],plans=p.plans||[];
    q('#existingPhotos').innerHTML=photos.length?'<div class="meta">Photos :</div>'+photos.map((x,i)=>`<label style="display:flex;gap:8px;align-items:center"><input type="checkbox" name="removePhoto" value="${i}"> Supprimer ${esc(x.name||'photo '+(i+1))}</label>`).join(''):'<div class="meta">Aucune photo existante</div>';
    q('#existingPlans').innerHTML=plans.length?'<div class="meta">Plans :</div>'+plans.map((x,i)=>`<label style="display:flex;gap:8px;align-items:center"><input type="checkbox" name="removePlan" value="${i}"> Supprimer ${esc(x.name||'plan '+(i+1))}</label>`).join(''):'<div class="meta">Aucun plan existant</div>';
    q('#existingMediaBox').style.display='block';
  }

  function openPropertyEdit(id){
    const p=state.properties.find(x=>x.id===id); if(!p)return;
    const f=q('#propertyForm'); f.dataset.editId=id; f.dataset.parcels=JSON.stringify(p.parcels||[]);
    for(const [k,v] of Object.entries(p)){if(f.elements[k]&&typeof v!=='object')f.elements[k].value=v??''}
    renderExistingMedia(p); setDialogTitle('#propertyDialog','Modifier le bien'); q('#propertyDialog').showModal();
  }

  document.addEventListener('click',e=>{
    const d=e.target.dataset;
    if(d.editAccount){e.preventDefault();openAccountEdit(d.editAccount)}
    if(d.editTenant){e.preventDefault();openTenantEdit(d.editTenant)}
    if(d.editProperty){e.preventDefault();openPropertyEdit(d.editProperty)}
  },true);

  q('#addAccountBtn')?.addEventListener('click',()=>{delete q('#accountForm').dataset.editId;setDialogTitle('#accountDialog','Nouvelle société')});
  q('#addAccountBtn2')?.addEventListener('click',()=>{delete q('#accountForm').dataset.editId;setDialogTitle('#accountDialog','Nouvelle société')});
  q('#addTenantBtn')?.addEventListener('click',()=>{delete q('#tenantForm').dataset.editId;setDialogTitle('#tenantDialog','Ajouter un locataire')});
  q('#addPropertyBtn')?.addEventListener('click',()=>{const f=q('#propertyForm');delete f.dataset.editId;delete f.dataset.parcels;setDialogTitle('#propertyDialog','Ajouter un bien');ensureEditMediaBox();q('#existingMediaBox').style.display='none'});

  q('#accountForm')?.addEventListener('submit',e=>{
    const f=e.currentTarget,id=f.dataset.editId;if(!id||e.submitter?.value==='cancel')return;
    e.preventDefault();e.stopImmediatePropagation();
    const a=state.accounts.find(x=>x.id===id);Object.assign(a,Object.fromEntries(new FormData(f)));delete f.dataset.editId;f.reset();q('#accountDialog').close();save();
  },true);

  q('#tenantForm')?.addEventListener('submit',e=>{
    const f=e.currentTarget,id=f.dataset.editId;if(!id||e.submitter?.value==='cancel')return;
    e.preventDefault();e.stopImmediatePropagation();
    const t=state.tenants.find(x=>x.id===id);Object.assign(t,Object.fromEntries(new FormData(f)));delete f.dataset.editId;f.reset();q('#tenantDialog').close();save();
  },true);

  q('#propertyForm')?.addEventListener('submit',async e=>{
    const f=e.currentTarget,id=f.dataset.editId;if(!id||e.submitter?.value==='cancel')return;
    e.preventDefault();e.stopImmediatePropagation();
    const p=state.properties.find(x=>x.id===id);if(!p)return;
    const data=Object.fromEntries(new FormData(f));
    delete data.removePhoto;delete data.removePlan;
    const removePhotos=[...f.querySelectorAll('input[name="removePhoto"]:checked')].map(x=>Number(x.value));
    const removePlans=[...f.querySelectorAll('input[name="removePlan"]:checked')].map(x=>Number(x.value));
    const keptPhotos=(p.photos||[]).filter((_,i)=>!removePhotos.includes(i));
    const keptPlans=(p.plans||[]).filter((_,i)=>!removePlans.includes(i));
    const newPhotos=await filesData(q('#propertyPhotos').files),newPlans=await filesData(q('#propertyPlans').files);
    Object.assign(p,data,{photos:[...keptPhotos,...newPhotos],plans:[...keptPlans,...newPlans],parcels:f.dataset.parcels?JSON.parse(f.dataset.parcels):(p.parcels||[])});
    delete f.dataset.editId;delete f.dataset.parcels;f.reset();q('#existingMediaBox').style.display='none';q('#propertyDialog').close();save();
  },true);

  addEditButtons();
})();