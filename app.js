const doc = document.getElementById('doc');
const taskText = document.getElementById('taskText');
const levelEl = document.getElementById('level');
const pointsEl = document.getElementById('points');
const timeEl = document.getElementById('time');
const leaderboardEl = document.getElementById('leaderboard');

const btnCheck = document.getElementById('checkBtn');
const btnHint = document.getElementById('hintBtn');
const btnSkip = document.getElementById('skipBtn');
const btnReset = document.getElementById('resetBtn');

const fontFamilySel = document.getElementById('fontFamily');
const fontSizeSel   = document.getElementById('fontSize');
const lineHeightSel = document.getElementById('lineHeight');
const colorInput    = document.getElementById('fontColor');
const highlightBtn  = document.getElementById('highlightBtn');
const insertTableBtn= document.getElementById('insertTableBtn');
const insertImageBtn= document.getElementById('insertImageBtn');

let points = 0, level = 1, timeLeft = 60, timerId = null;

const challenges = [
  { title:"Currículo — Título centralizado, Arial 16 e Negrito",
    description:"No parágrafo 1 (título), aplique: fonte Arial, tamanho 16, centralizado e negrito.",
    target:'[data-p="1"]',
    hint:"Fonte=Arial, Tamanho=16, Negrito, alinhar Centro.",
    check:()=>{ const el=doc.querySelector('[data-p="1"]'); const cs=getComputedStyle(el);
      return cs.fontFamily.toLowerCase().includes('arial') &&
             Math.round(parseFloat(cs.fontSize))===16 &&
             cs.textAlign==='center' &&
             (el.style.fontWeight==='700'||cs.fontWeight>=600||el.querySelector('b,strong'));
    }
  },
  { title:"Memorando — Corpo justificado e espaçamento 1.5",
    description:"No parágrafo 2, deixe alinhamento justificado e espaçamento 1.5.",
    target:'[data-p="2"]',
    hint:"Botão Justificar e Espaçamento 1.5.",
    check:()=>{ const el=doc.querySelector('[data-p="2"]'); const cs=getComputedStyle(el);
      return cs.textAlign==='justify' && Math.abs(parseFloat(cs.lineHeight)/parseFloat(cs.fontSize)-1.5)<0.05;
    }
  },
  { title:"Relatório — Subtítulo sublinhado e azul (#1E3A8A)",
    description:"No parágrafo 4, aplique sublinhado e cor #1E3A8A.",
    target:'[data-p="4"]',
    hint:"Sublinhe e mude a cor.",
    check:()=>{ const el=doc.querySelector('[data-p="4"]'); const cs=getComputedStyle(el);
      const rgb=cs.color.replace(/\s+/g,''); return cs.textDecorationLine.includes('underline') &&
        (rgb==='rgb(30,58,138)'||rgb==='rgba(30,58,138,1)');
    }
  },
  { title:"Ajuste — Direita e tamanho 14", target:'[data-p="5"]',
    description:"No parágrafo 5, alinhe à direita e defina tamanho 14.",
    hint:"⟹ Direita e Tamanho 14.",
    check:()=>{ const el=doc.querySelector('[data-p="5"]'); const cs=getComputedStyle(el);
      return cs.textAlign==='right' && Math.round(parseFloat(cs.fontSize))===14; }
  },
  { title:"Fechamento — Esquerda, itálico e cor #444444", target:'[data-p="6"]',
    description:"No parágrafo 6, alinhe à esquerda, itálico e cor #444444.",
    hint:"⟸ Esquerda, Itálico e cor #444444.",
    check:()=>{ const el=doc.querySelector('[data-p="6"]'); const cs=getComputedStyle(el);
      const rgb=cs.color.replace(/\s+/g,''); const colorOk=(rgb==='rgb(68,68,68)'||rgb==='rgba(68,68,68,1)');
      return cs.textAlign==='left' && (cs.fontStyle==='italic'||el.querySelector('i,em')) && colorOk;
    }
  },
  { title:"Lista numerada — Parágrafo 3", target:'[data-p="3"]',
    description:"Converta o parágrafo 3 em lista numerada.",
    hint:"Selecione e clique em “1. Lista”.",
    check:()=>!!doc.querySelector('ol li')
  },
  { title:"Formatação acadêmica — P2 Times 12 e espaço 2.0", target:'[data-p="2"]',
    description:"Times New Roman, 12pt, espaçamento 2.0 no parágrafo 2.",
    hint:"Fonte=Times, Tam=12, Espaço=2.0.",
    check:()=>{ const el=doc.querySelector('[data-p="2"]'); const cs=getComputedStyle(el);
      return cs.fontFamily.toLowerCase().includes('times') &&
             Math.round(parseFloat(cs.fontSize))===12 &&
             Math.abs(parseFloat(cs.lineHeight)/parseFloat(cs.fontSize)-2)<0.05;
    }
  },
  { title:"Inserir tabela 2×2 — Em qualquer lugar", target:null,
    description:"Insira uma tabela 2×2.",
    hint:"Use botão “Tabela 2×2”.",
    check:()=>{ const t=doc.querySelector('table'); if(!t) return false;
      const rows=t.querySelectorAll('tr').length;
      const cols=t.querySelectorAll('tr:first-child td, tr:first-child th').length;
      return rows>=2 && cols>=2;
    }
  },
  { title:"Inserir imagem e centralizar", target:null,
    description:"Insira uma imagem por URL e centralize.",
    hint:"Botão “Imagem (URL)”, depois alinhar Centro.",
    check:()=>{ const img=doc.querySelector('img'); if(!img) return false;
      const parent=img.closest('p,div')||img.parentElement; return getComputedStyle(parent).textAlign==='center';
    }
  },
  { title:"Realce amarelo na palavra “Equipamentos”", target:'[data-p="4"]',
    description:"Selecione só a palavra e aplique realce.",
    hint:"Selecione a palavra e clique “🖍 Realce”.",
    check:()=>{ const el=doc.querySelector('[data-p="4"]');
      return !!el.querySelector('span[style*="background-color: rgb(255, 245, 157)"], span[style*="#fff59d"]'); }
  }
];

function loadChallenge(){ const c=challenges[level-1]; taskText.innerHTML=`<strong>${c.title}</strong><br>${c.description}`; levelEl.textContent=level; }
function startTimer(){ clearInterval(timerId); timeLeft=60; timeEl.textContent=timeLeft;
  timerId=setInterval(()=>{ timeLeft--; timeEl.textContent=timeLeft;
    if(timeLeft<=0){ clearInterval(timerId); alert('⏰ Tempo esgotado! -5 pts'); addPoints(-5); nextChallenge(); }
  },1000);
}
function addPoints(n){ points=Math.max(0, points+n); pointsEl.textContent=points; }
function nextChallenge(){ if(level<challenges.length){ level++; loadChallenge(); startTimer(); }
  else{ clearInterval(timerId); alert(`🏁 Concluído! Pontos: ${points}`); } }

/* barra básica */
document.querySelectorAll('.toolbar button[data-cmd]').forEach(b=>b.addEventListener('click',()=>{
  document.execCommand(b.getAttribute('data-cmd'), false, null); doc.focus();
}));
document.querySelectorAll('.toolbar button[data-align]').forEach(b=>b.addEventListener('click',()=>{
  const a=b.getAttribute('data-align');
  if(a==='left')document.execCommand('justifyLeft');
  if(a==='center')document.execCommand('justifyCenter');
  if(a==='right')document.execCommand('justifyRight');
  if(a==='justify')document.execCommand('justifyFull');
  doc.focus();
}));
fontFamilySel.addEventListener('change',()=>{document.execCommand('fontName',false,fontFamilySel.value);doc.focus();});
fontSizeSel.addEventListener('change',()=>{wrapSelectionStyle('font-size',fontSizeSel.value);doc.focus();});
lineHeightSel.addEventListener('change',()=>{applyBlockStyle('line-height',lineHeightSel.value);doc.focus();});
colorInput.addEventListener('input',()=>{document.execCommand('foreColor',false,colorInput.value);doc.focus();});

/* extras */
highlightBtn.addEventListener('click',()=>{wrapSelectionStyle('background-color','#fff59d');doc.focus();});
insertTableBtn.addEventListener('click',()=>{
  const table=document.createElement('table'); table.style.borderCollapse='collapse'; table.style.margin='8px 0';
  for(let r=0;r<2;r++){ const tr=document.createElement('tr');
    for(let c=0;c<2;c++){ const td=document.createElement('td'); td.textContent=' '; td.style.border='1px solid #444'; td.style.padding='6px 10px'; tr.appendChild(td); }
    table.appendChild(tr);
  }
  insertNodeAtCaret(table);
});
insertImageBtn.addEventListener('click',()=>{
  const url=prompt('Cole a URL da imagem:'); if(!url) return;
  const p=document.createElement('p'); p.style.textAlign='left';
  const img=document.createElement('img'); img.src=url; img.alt='imagem'; img.style.maxWidth='100%'; img.style.height='auto';
  p.appendChild(img); insertNodeAtCaret(p);
});

/* helpers */
function wrapSelectionStyle(prop,val){
  const sel=window.getSelection(); if(!sel.rangeCount) return;
  const range=sel.getRangeAt(0); const span=document.createElement('span'); span.style[prop]=val;
  try{ range.surroundContents(span); } catch{ span.appendChild(range.extractContents()); range.insertNode(span); }
}
function applyBlockStyle(prop,val){
  const sel=window.getSelection(); if(!sel.rangeCount) return;
  let node=sel.getRangeAt(0).startContainer; node=node.nodeType===1?node:node.parentElement;
  while(node && !node.matches('p,h1,h2,h3,li')) node=node.parentElement;
  if(node) node.style[prop]=val;
}
function insertNodeAtCaret(node){
  const sel=window.getSelection(); if(!sel.rangeCount){ doc.appendChild(node); return; }
  const range=sel.getRangeAt(0); range.collapse(false); range.insertNode(node);
}

/* verificar / dica / pular / reset */
btnCheck.addEventListener('click',()=>{ const ok=challenges[level-1].check();
  if(ok){ addPoints(10); alert('✅ Perfeito! +10 pts'); nextChallenge(); }
  else { addPoints(-2); alert('❌ Ainda não está certo. -2 pts'); }
});
btnHint.addEventListener('click',()=>{ addPoints(-3); alert('💡 Dica: '+challenges[level-1].hint); });
btnSkip.addEventListener('click',()=>{ addPoints(-2); nextChallenge(); });
btnReset.addEventListener('click',()=>{ resetDocument(); startTimer(); });

/* atalhos */
doc.addEventListener('keydown',e=>{
  if(!e.ctrlKey) return; const k=e.key.toLowerCase();
  if(k==='b'){document.execCommand('bold');e.preventDefault();}
  if(k==='i'){document.execCommand('italic');e.preventDefault();}
  if(k==='u'){document.execCommand('underline');e.preventDefault();}
  if(k==='l'){document.execCommand('justifyLeft');e.preventDefault();}
  if(k==='e'){document.execCommand('justifyCenter');e.preventDefault();}
  if(k==='r'){document.execCommand('justifyRight');e.preventDefault();}
  if(k==='j'){document.execCommand('justifyFull');e.preventDefault();}
});

/* ranking */
const saveBtn=document.getElementById('saveScore');
const nameInput=document.getElementById('playerName');
function loadBoard(){ const data=JSON.parse(localStorage.getItem('wt_board')||'[]');
  leaderboardEl.innerHTML=''; data.slice(0,10).forEach((it,i)=>{ const li=document.createElement('li'); li.textContent=`${i+1}. ${it.name} — ${it.points} pts`; leaderboardEl.appendChild(li); });
}
saveBtn.addEventListener('click',()=>{ const name=(nameInput.value||'Aluno').trim().slice(0,20);
  const data=JSON.parse(localStorage.getItem('wt_board')||'[]'); data.push({name,points,ts:Date.now()});
  data.sort((a,b)=>b.points-a.points||a.ts-b.ts); localStorage.setItem('wt_board',JSON.stringify(data)); loadBoard(); alert('Pontuação salva no dispositivo!');
});

/* estado inicial */
function resetDocument(){
  doc.innerHTML=`
    <h1 data-p="1">Memorando — Laboratório de Informática</h1>
    <p data-p="2">Este é um parágrafo de exemplo. Ajuste a formatação conforme os desafios. Você pode usar a barra de ferramentas ou os atalhos de teclado como faria no Word.</p>
    <p data-p="3">Outro parágrafo de prática. Altere alinhamento, negrito, itálico, sublinhado, fonte, tamanho e espaçamento quando solicitado.</p>
    <h2 data-p="4">Seção — Equipamentos</h2>
    <p data-p="5">Listagem e observações sobre os equipamentos do laboratório. Texto de exemplo para validação de estilo.</p>
    <p data-p="6">Texto extra para justificar, centralizar ou ajustar cor. Use sua criatividade e leia o desafio com atenção.</p>`;
}
function init(){ resetDocument(); loadChallenge(); startTimer(); loadBoard(); }
init();
