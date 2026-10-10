// KWF 2026 public annual financial dashboard and owner-only audited removal.
// This file is concatenated to the existing app.js during GitHub Pages build.
Object.assign(langs.ur, {
  annualDonations:'اس سال کے کل عطیات (Total donations this year)',
  annualExpenses:'اس سال کے کل اخراجات (Total expenses this year)',
  annualBalance:'اس سال کی باقی رقم (Balance this year)',
  publicTransparency:'فاؤنڈیشن کے منظورشدہ عطیات، خرچ اور باقی رقم سب کے سامنے',
  publicNote:'اعداد و شمار پاکستان کے موجودہ سال کے لیے ہیں؛ صرف تصدیق شدہ عطیات شامل ہیں، اور اخراجات میں تقسیم شدہ امداد بھی شامل ہے۔',
  backHome:'ہوم پیج', delete:'حذف کریں', deleted:'حذف / آرکائیو کر دیا گیا',
  deleteReason:'حذف کرنے کی وجہ لکھیں (کم از کم 5 حروف):',
  deleteConfirm:'کیا واقعی یہ ریکارڈ حذف/آرکائیو کرنا ہے؟ مالی ریکارڈ کا آڈٹ محفوظ رہے گا۔',
  audit:'حذف اور تبدیلیوں کا آڈٹ ریکارڈ', noDeleteApproved:'منظورشدہ عطیات کو حذف نہیں کیا جا سکتا',
  visitorLogin:'ڈونر / ایڈمن لاگ اِن', visitorRegister:'نیا ڈونر اکاؤنٹ'
});
Object.assign(langs.en, {
  annualDonations:'Total donations this year',annualExpenses:'Total expenses this year',
  annualBalance:'Balance this year',publicTransparency:'Transparent verified giving and spending',
  publicNote:'Figures cover the current calendar year in Pakistan. Only approved donations count; expenses include distributed aid.',
  backHome:'Public home',delete:'Delete',deleted:'Record removed / archived',
  deleteReason:'Why do you want to delete this record? (minimum 5 characters)',
  deleteConfirm:'Delete/archive this record? Financial history remains in the audit trail.',
  audit:'Removal / audit history',noDeleteApproved:'Approved donations cannot be deleted',
  visitorLogin:'Donor / Admin login',visitorRegister:'Create donor account'
});
state.publicPage='home';
state.recordActions=[];

stats=function(includeDonors=true){
  const year=Number(state.dashboard.year||new Date().getFullYear());
  let items=[
    stat(t('annualDonations'),money(state.dashboard.approved)),
    stat(t('annualExpenses'),money(state.dashboard.spent),'red'),
    stat(t('annualBalance'),money(state.dashboard.balance),'gold')
  ];
  if(includeDonors)items.push(stat(t('donors'),Number(state.dashboard.donor_count||0),'blue'));
  return `<div class="stats annual-stats" aria-label="KWF ${year} financial totals">${items.join('')}</div>`;
};

function publicHome(){
  const year=Number(state.dashboard.year||new Date().getFullYear());
  const currentCampaigns=state.campaigns.filter(c=>c.status==='active'&&!c.archived_at);
  return `<div class="public-home">
  <header class="public-top"><div class="public-brand">${logo()}<div><strong>Kalwal Welfare Foundation</strong><small>KWF · ${year}</small></div></div>
  <div class="public-buttons"><button class="btn ghost tiny" data-action="language">${t('changeLang')}</button><button class="btn" data-action="visitorLogin">${t('visitorLogin')}</button><button class="btn tiny ghost" data-action="visitorRegister">${t('visitorRegister')}</button></div></header>
  <main class="public-content"><div class="hero public-hero"><div><span class="public-eyebrow">KWF · ${year} · PUBLIC FINANCIAL DASHBOARD</span><h1>${t('welcome')}</h1><p>${t('publicTransparency')}</p><button class="btn" data-action="visitorLogin">${t('donate')} →</button></div><div class="heroquote"><strong>KWF</strong>Kalwal Welfare Foundation</div></div>
  <section class="public-stats"><div class="panelhead"><h2>${year} · ${state.language==='ur'?'عوامی سالانہ حساب':'Public annual accounts'}</h2><button class="btn tiny ghost" data-action="refresh">↻ ${t('refresh')}</button></div>
  ${stats(false)}<p class="muted small">${t('publicNote')}</p></section>
  <section class="panel public-campaigns"><h2>${t('activeCampaigns')}</h2><div class="public-campaign-grid">${campaignsCards(currentCampaigns.slice(0,6),true)}</div></section>
  <footer class="public-footer">KWF · Kalwal Welfare Foundation · ${year}<p>${state.language==='ur'?'رسید کی تصویر اپ لوڈ کرنے سے خودکار منظوری نہیں ملتی؛ ادائیگی کی تصدیق ایڈمن کرتا ہے۔':'Receipt upload does not automatically verify payment; staff verifies the provider transaction.'}</p></footer>
  </main></div>`;
}

render=function(){
  document.documentElement.lang=state.language;
  document.documentElement.dir=state.language==='ur'?'rtl':'ltr';
  document.title='KWF | '+(state.user?t(state.view):'Kalwal Welfare Foundation');
  $('app').innerHTML=!state.ready?setupView():!state.user?(state.publicPage==='auth'?authView():publicHome()):shell();
};
const originalAuthView=authView;
authView=function(){return originalAuthView().replace(/<\/div><\/div>$/,`<div class="authlinks"><button class="btn ghost tiny" data-action="publicHome">← ${t('backHome')}</button></div></div></div>`);};
const originalCampaignsCards=campaignsCards;
campaignsCards=function(records,compact=false){
  const list=(records||[]).filter(c=>!c.archived_at);
  if(!list.length)return originalCampaignsCards([],compact);
  return list.map(c=>{
    let card=originalCampaignsCards([c],compact);
    if(isOwner())card=card.replace('</article>',`<div class="record-tools"><button class="btn tiny danger" data-action="deleteRecord" data-kind="campaign" data-id="${html(c.id)}">${t('delete')}</button></div></article>`);
    return card;
  }).join('');
};

// Insert an owner-only Delete column into existing admin tables.
function withDeleteColumn(markup,records,kind){
  if(!isOwner()||!records?.length)return markup;
  return markup.replace(/(<table class="dataTable"><thead><tr>)([\s\S]*?)(<\/tr><\/thead><tbody>)([\s\S]*?)(<\/tbody>)/,(_,pre,heads,middle,body,end)=>{
    let rowIndex=0;
    const rows=body.replace(/<\/tr>/g,()=>{
      const record=records[rowIndex++];
      if(!record)return '</tr>';
      return `<td><button class="btn tiny danger" data-action="deleteRecord" data-kind="${kind}" data-id="${html(record.id)}">${t('delete')}</button></td></tr>`;
    });
    return pre+heads+`<th>${t('actions')}</th>`+middle+rows+end;
  });
}
const originalFamiliesView=familiesView;
familiesView=function(){return withDeleteColumn(originalFamiliesView(),state.families,'beneficiary');};
const originalExpensesView=expensesView;
expensesView=function(){return withDeleteColumn(originalExpensesView(),state.expenses,'expense');};
const originalAidView=aidView;
aidView=function(){return withDeleteColumn(originalAidView(),state.aid,'aid');};
const originalDonationRows=donationRows;
donationRows=function(records,mini=false){
  let markup=originalDonationRows(records,mini);
  if(mini||!isOwner()||!records?.length)return markup;
  return markup.replace(/(<tbody>)([\s\S]*?)(<\/tbody>)/,(_,start,body,end)=>{
    let i=0;
    return start+body.replace(/<\/tr>/g,()=>{
      const d=records[i++];
      if(!d||d.status==='approved')return '</tr>';
      return `<button class="btn tiny danger" data-action="deleteRecord" data-kind="donation" data-id="${html(d.id)}">${t('delete')}</button></td></tr>`;
    }).replace(/(<\/td>)<button class="btn tiny danger"/g,'<button class="btn tiny danger"')+end;
  });
};
const originalGetRows=getRows;
getRows=async function(tableName,cols='*'){
  const rows=await originalGetRows(tableName,cols);
  if(tableName==='donations')return rows.filter(x=>!x.deleted_at);
  if(tableName==='beneficiaries')return rows.filter(x=>!x.archived_at);
  if(tableName==='expenses'||tableName==='aid_records')return rows.filter(x=>!x.voided_at);
  return rows;
};
const originalRefresh=refresh;
refresh=async function(silent=false){
  await originalRefresh(silent);
  state.campaigns=state.campaigns.filter(c=>!c.archived_at);
  if(state.user&&isStaff()){
    try{state.recordActions=await originalGetRows('record_actions');}
    catch(e){console.warn('Audit history unavailable:',errorStr(e));}
  }else state.recordActions=[];
  render();
};
const originalReportsView=reportsView;
reportsView=function(){
  const body=originalReportsView();
  if(!isStaff())return body;
  const audit=table([t('date'),t('category'),t('actions'),t('details')],(state.recordActions||[]).slice(0,50).map(a=>
  `<tr><td>${shortDate(a.created_at)}</td><td>${html(a.record_type)}</td><td>${html(a.action)}</td><td>${html(a.reason)}</td></tr>`));
  return body+`<section class="panel"><h3>${t('audit')}</h3>${audit}</section>`;
};
const originalClickAction=clickAction;
clickAction=async function(el){
  const action=el.dataset.action;
  if(action==='visitorLogin'||action==='visitorRegister'){
    state.publicPage='auth';state.authView=action==='visitorRegister'?'register':'login';render();return;
  }
  if(action==='publicHome'){state.publicPage='home';render();return;}
  if(action==='deleteRecord'){
    if(!isOwner()){notify('Owner only',true);return;}
    const kind=el.dataset.kind,id=el.dataset.id;
    if(!['campaign','beneficiary','expense','aid','donation'].includes(kind)||!id)return;
    if(kind==='donation'&&state.donations.find(d=>d.id===id)?.status==='approved'){
      notify(t('noDeleteApproved'),true);return;
    }
    const reason=window.prompt(t('deleteReason'));
    if(reason===null)return;
    if(reason.trim().length<5){notify(t('deleteReason'),true);return;}
    if(!window.confirm(t('deleteConfirm')))return;
    try{
      const {error}=await state.client.rpc('archive_kwf_record',{
        p_kind:kind,p_id:id,p_reason:reason.trim()
      });
      if(error)throw error;
      if(kind==='donation')state.reviewId=null;
      await refresh(true);notify(t('deleted'));
    }catch(e){notify(errorStr(e),true);console.error(e);}
    return;
  }
  return originalClickAction(el);
};
