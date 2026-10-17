'use strict';
(() => {
  const ENDPOINT = 'https://hobbyquest-ai.krishnagautam1997.workers.dev/chat';
  const KEY = 'hobbyquest.conversations.v1';
  const el = id => document.getElementById(id);
  const dialog = el('chat-dialog');
  let worlds = load();
  let current = null, pending = null, storageWarning = false;
  const drafts = new Map();
  const errors = {
    daily_limit:'The shared free AI allowance is used up today. It resets at 00:00 UTC (4 a.m. Dubai). Your saved chats and notes are still here.',
    rate_limited:'A little breathing room: this network can send about 5 questions per minute. Please try again in a minute.',
    timeout:'The AI took too long. Your question is still here. Try again when you are ready; a timed-out request may still use some free allowance.',
    unavailable:'Live AI is temporarily unavailable, or the free allowance may be exhausted. Your question is still here. No paid fallback is used.',
    invalid_request:'Please shorten the question and try again.',
    network:'We could not reach the AI. Check your connection and try again. Your question has not been lost.'
  };
  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(KEY) || '[]');
      if (!Array.isArray(data)) return [];
      return data.filter(w => w && typeof w.id === 'string' && w.id.length <= 220 && typeof w.title === 'string' && w.title.length <= 100 && Array.isArray(w.messages)).slice(0,50).map(w => {
        const messages = [];
        // Only complete, valid user/assistant pairs survive a reload.
        for (let i=0;i+1<w.messages.length;i+=2) {
          const a=w.messages[i],b=w.messages[i+1];
          if (a?.role==='user' && b?.role==='assistant' && typeof a.content==='string' && a.content.length<=1000 && a.content.trim() && typeof b.content==='string' && b.content.length<=4000 && b.content.trim()) messages.push({role:'user',content:a.content},{role:'assistant',content:b.content});
        }
        return {id:w.id,title:w.title,messages:messages.slice(-20)};
      });
    } catch {return [];}
  }
  function save() {
    try {localStorage.setItem(KEY,JSON.stringify(worlds));storageWarning=false;}
    catch {storageWarning=true;}
    el('chat-storage').textContent = storageWarning ? 'Browser storage is unavailable or full. New replies last only for this session. Existing notes are unchanged.' : 'Latest 10 exchanges per interest stay in this browser—not a cloud account. Clearing browser data removes them.';
  }
  function rememberDraft() {if(current) drafts.set(current.id,el('chat-input').value);}
  function setTopic(topic) {
    if(pending) return;
    rememberDraft();
    current = getTopic(topic.title,topic.id);
    el('chat-world').value = current.title;
    el('chat-title').textContent = current.title;
    el('chat-input').value = drafts.get(current.id) || '';
    el('chat-status').textContent = '';
    render();
  }
  function open(topic) {
    if(topic) setTopic(topic);
    if(!dialog.open) dialog.showModal();
    if(!current) el('chat-world').focus(); else el('chat-input').focus();
    render();
  }
  function history() {return worlds.find(w => w.id===current?.id)?.messages || [];}
  function bubble(role,text) {
    const article=document.createElement('article');article.className=`chat-message chat-${role}`;
    const label=document.createElement('span');label.className='chat-speaker';label.textContent=role==='user'?'YOU':'HOBBYQUEST AI';
    const body=document.createElement('div');body.className='chat-message-body';body.textContent=text;
    article.append(label,body);return article;
  }
  function render() {
    window.HobbyQuestExplorer?.sparks.refresh();
    const log=el('chat-log'); const messages=history();
    log.replaceChildren(...messages.map(m=>bubble(m.role,m.content)));
    if(pending && pending.id===current?.id) log.append(bubble('user',pending.question),bubble('assistant','Following the thread…'));
    if(!log.children.length) {
      const empty=document.createElement('p');empty.className='chat-empty';empty.textContent=current ? `A fresh thread for ${current.title}. Ask for a beginner introduction, a conversation starter, or a deeper explanation.` : 'Pick any interest above. F1, ancient coins, perfumes, black holes—your curiosity chooses.';log.append(empty);
    }
    el('chat-send').disabled=!current || Boolean(pending);
    el('chat-input').disabled=!current || Boolean(pending);
    el('chat-topic-submit').disabled=Boolean(pending);
    el('chat-world').disabled=Boolean(pending);
    el('chat-suggestions').hidden=!current || messages.length>0 || Boolean(pending);
    el('chat-forget').hidden=!current || !messages.length;
    el('chat-forget').disabled=Boolean(pending);
    el('chat-log').setAttribute('aria-busy',String(Boolean(pending && pending.id===current?.id)));
    log.scrollTop=log.scrollHeight;
  }
  function requestMessages(question) {
    const recent=history().slice(-6).map(m=>({role:m.role,content:m.content}));
    while(recent.length && recent.reduce((n,m)=>n+m.content.length,question.length)>6500) recent.splice(0,2);
    return [...recent,{role:'user',content:question}];
  }
  async function send(event) {
    event.preventDefault();
    if(!current || pending) return;
    const question=el('chat-input').value.trim();
    if(!question || question.length>1000) {el('chat-input').focus();return;}
    if(!el('chat-consent').checked) {el('chat-status').textContent='Please confirm the privacy notice before sending.';el('chat-consent').focus();return;}
    if(!worlds.some(w=>w.id===current.id) && worlds.length>=50) {el('chat-status').textContent='This browser holds 50 interest chats. Reset one you no longer need before starting another.';return;}
    if(window.HobbyQuestExplorer && !window.HobbyQuestExplorer.sparks.available()) {el('chat-status').textContent='Today’s 10 Sparks are used on this browser. They reset at 00:00 UTC (4 a.m. Dubai). Stories, discoveries and notes are still available.';return;}
    const topic={id:current.id,title:current.title};
    const messages=requestMessages(question);
    pending={...topic,question};el('chat-input').value='';drafts.set(topic.id,'');el('chat-status').textContent='Asking live AI…';render();
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),40000);
    try {
      const response=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({topic:topic.title,messages}),signal:controller.signal,credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer'});
      let data;try {data=await response.json();}catch {throw Error(response.status===429?'rate_limited':'unavailable');}
      if(!response.ok) throw Error(Object.hasOwn(errors,data.error)?data.error:'unavailable');
      if(typeof data.answer!=='string' || !data.answer.trim() || data.answer.length>4000) throw Error('unavailable');
      window.HobbyQuestExplorer?.sparks.use();
      let world=worlds.find(w=>w.id===topic.id);
      if(!world) {world={...topic,messages:[]};worlds.push(world);}
      world.messages.push({role:'user',content:question},{role:'assistant',content:data.answer.trim()});world.messages=world.messages.slice(-20);
      save();el('chat-status').textContent=storageWarning?'Reply received. This session only—browser saving failed.':'Reply received · Saved on this browser. AI can make mistakes.';
    } catch(error) {
      drafts.set(topic.id,question);if(current?.id===topic.id) el('chat-input').value=question;
      el('chat-status').textContent=errors[error.name==='AbortError'?'timeout':error.message] || errors.network;
    } finally {clearTimeout(timer);pending=null;render();if(dialog.open) el('chat-input').focus();}
  }
  el('open-guide').addEventListener('click',()=>open());
  el('topic-chat').addEventListener('click',()=>open(activeTopic));
  el('f1-chat').addEventListener('click',()=>open(getTopic('Formula 1','f1')));
  el('close-chat').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',rememberDraft);
  el('chat-form').addEventListener('submit',send);
  el('chat-topic-form').addEventListener('submit',event=>{event.preventDefault();if(pending)return;const title=el('chat-world').value.trim();if(title) {setTopic(getTopic(title));el('chat-input').focus();}});
  el('chat-input').addEventListener('input',rememberDraft);
  el('chat-input').addEventListener('keydown',event=>{if(event.key==='Enter' && !event.shiftKey && !event.isComposing) {event.preventDefault();el('chat-form').requestSubmit();}});
  document.querySelectorAll('[data-chat-prompt]').forEach(button=>button.addEventListener('click',()=>{el('chat-input').value=button.dataset.chatPrompt;rememberDraft();el('chat-input').focus();}));
  el('chat-forget').addEventListener('click',()=>{
    if(!current || pending || !window.confirm(`Reset the saved chat for ${current.title} in this browser? Notes, world saves, and other chats will remain unchanged.`)) return;
    worlds=worlds.filter(w=>w.id!==current.id);save();el('chat-status').textContent=storageWarning?'Chat reset for this session only. Browser saving failed.':'This interest’s chat was reset. Your notes are unchanged.';render();
  });
  // No network requests on load/open. Sending is always an explicit user action.
  render();
})();
