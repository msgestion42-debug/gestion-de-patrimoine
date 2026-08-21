// Automatic property overview on the cadastral map.
(function(){
  let overviewLayer=null;
  let fitted=false;

  function propertyBounds(p){
    try{
      if(!(p.parcels||[]).length)return null;
      const b=L.geoJSON(p.parcels).getBounds();
      return b.isValid()?b:null;
    }catch{return null}
  }
  function propertyCenter(p){const b=propertyBounds(p);return b?b.getCenter():null}
  function ownerName(p){return state.accounts.find(a=>a.id===p.accountId)?.name||'Société non renseignée'}
  function propColor(t){return t==='Forêt'?'#2e7d32':t==='Pré'?'#b58b00':(t==='Habitation'||t==='Immeuble')?'#b23a3a':'#276b92'}
  function popup(p){
    const refs=(p.parcels||[]).map(parcelRef).join(', ')||p.parcelRefs||'Sans référence';
    return `<strong>${esc(p.name||'Bien')}</strong><br>${esc(ownerName(p))}<br>${esc(p.type||'Bien')} · ${Number(p.area||0).toLocaleString('fr-FR')} m²<br><small>${esc(refs)}</small>`;
  }
  function flagIcon(label){return L.divIcon({className:'property-flag-wrap',html:`<div class="property-flag">🚩<span>${esc(label)}</span></div>`,iconSize:[120,32],iconAnchor:[12,28]})}
  function clusterIcon(n){return L.divIcon({className:'property-cluster-wrap',html:`<div class="property-cluster">🚩 ${n}</div>`,iconSize:[54,34],iconAnchor:[27,17]})}

  function groupNearby(props,zoom){
    const groups=[];
    const threshold=zoom<=6?4:zoom<=8?1.5:0.45;
    for(const p of props){
      const c=propertyCenter(p);if(!c)continue;
      let g=groups.find(x=>Math.abs(x.lat-c.lat)<threshold&&Math.abs(x.lng-c.lng)<threshold);
      if(!g){g={lat:c.lat,lng:c.lng,items:[]};groups.push(g)}
      g.items.push(p);
      g.lat=g.items.reduce((s,i)=>s+propertyCenter(i).lat,0)/g.items.length;
      g.lng=g.items.reduce((s,i)=>s+propertyCenter(i).lng,0)/g.items.length;
    }
    return groups;
  }

  function renderOverview(){
    if(!map)return;
    if(overviewLayer)overviewLayer.clearLayers(); else overviewLayer=L.layerGroup().addTo(map);
    const props=(state.properties||[]).filter(p=>(p.parcels||[]).length);
    const z=map.getZoom();
    if(!props.length)return;

    if(z<=9){
      for(const g of groupNearby(props,z)){
        if(g.items.length>1){
          L.marker([g.lat,g.lng],{icon:clusterIcon(g.items.length),zIndexOffset:400})
            .bindPopup(g.items.map(p=>popup(p)).join('<hr>')).addTo(overviewLayer);
        }else{
          const p=g.items[0],c=propertyCenter(p);
          L.marker(c,{icon:flagIcon(p.name||'Bien'),zIndexOffset:400}).bindPopup(popup(p)).addTo(overviewLayer);
        }
      }
    } else if(z<=14){
      for(const p of props){const c=propertyCenter(p);if(c)L.marker(c,{icon:flagIcon(p.name||'Bien'),zIndexOffset:400}).bindPopup(popup(p)).addTo(overviewLayer)}
    } else {
      for(const p of props){
        const color=propColor(p.type);
        const layer=L.geoJSON(p.parcels||[],{style:{color,weight:3,fillOpacity:.18}}).bindPopup(popup(p)).addTo(overviewLayer);
        const c=propertyCenter(p);if(c)L.marker(c,{icon:flagIcon(p.name||'Bien'),zIndexOffset:450}).bindPopup(popup(p)).addTo(overviewLayer);
        if(z>=18){
          for(const parcel of (p.parcels||[])){
            try{const c2=L.geoJSON(parcel).getBounds().getCenter();L.marker(c2,{interactive:false,icon:L.divIcon({className:'parcel-label',html:`<span>${esc(parcelRef(parcel))}</span>`,iconSize:[80,20],iconAnchor:[40,10]})}).addTo(overviewLayer)}catch{}
          }
        }
      }
    }
  }

  function fitAll(){
    if(!map)return;
    const all=[];
    for(const p of state.properties||[]){const b=propertyBounds(p);if(b)all.push(b)}
    if(!all.length)return;
    const fg=L.featureGroup(all.map(b=>L.rectangle(b,{opacity:0,fillOpacity:0})));
    map.fitBounds(fg.getBounds(),{padding:[35,35],maxZoom:13});
  }

  function hookMap(){
    if(!map)return;
    map.off('zoomend',renderOverview);map.off('moveend',renderOverview);
    map.on('zoomend',renderOverview);map.on('moveend',renderOverview);
    renderOverview();
    if(!fitted){fitAll();fitted=true}
  }

  const oldInitMap=initMap;
  initMap=function(){oldInitMap();setTimeout(hookMap,0)};
  const oldRender=render;
  render=function(){oldRender();if(map)setTimeout(renderOverview,0)};

  const style=document.createElement('style');
  style.textContent=`.property-flag-wrap,.property-cluster-wrap{background:none;border:0}.property-flag{white-space:nowrap;background:white;border:1px solid #bbb;border-radius:7px;padding:4px 7px;box-shadow:0 2px 7px #0003;font-weight:700;font-size:12px}.property-flag span{margin-left:3px}.property-cluster{background:white;border:2px solid #165d4a;border-radius:18px;padding:5px 9px;font-weight:800;box-shadow:0 2px 7px #0003}.parcel-label{background:rgba(255,255,255,.88);border:1px solid #888;border-radius:4px;text-align:center;font-size:11px;font-weight:700}`;
  document.head.appendChild(style);
})();