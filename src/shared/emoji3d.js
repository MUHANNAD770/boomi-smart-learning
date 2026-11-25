/* emoji3d.js — عرض الرموز التعبيرية صورًا ثلاثية الأبعاد والرسوم الكاملة للبطاقات التعليمية */
(() => {
  'use strict';
  const AV = new Set('1f1ec-1f1e7,1f1f8-1f1e6,1f305,1f308,1f309,1f30a,1f30b,1f30d,1f310,1f319,1f31e,1f31f,1f320,1f321-fe0f,1f327-fe0f,1f32c-fe0f,1f330,1f331,1f332,1f333,1f334,1f335,1f337,1f338,1f339,1f33a,1f33b,1f33c,1f33d,1f33e,1f33f,1f340,1f341,1f342,1f343,1f344,1f345,1f347,1f349,1f34a,1f34b,1f34c,1f34d,1f34e,1f34f,1f350,1f351,1f352,1f353,1f355,1f35a,1f35e,1f35f,1f366,1f369,1f36a,1f36b,1f36c,1f36d,1f36f,1f372,1f373,1f375,1f376,1f37d-fe0f,1f381,1f382,1f383,1f388,1f389,1f392,1f393,1f399-fe0f,1f3a4,1f3a7,1f3a8,1f3a9,1f3ab,1f3ae,1f3af,1f3b2,1f3b8,1f3b9,1f3ba,1f3bb,1f3be,1f3c0,1f3c3,1f3c5,1f3c6,1f3c8,1f3ca,1f3cb-fe0f,1f3d0,1f3d4-fe0f,1f3d6-fe0f,1f3d9-fe0f,1f3da-fe0f,1f3db-fe0f,1f3dc-fe0f,1f3dd-fe0f,1f3de-fe0f,1f3df-fe0f,1f3e0,1f3e1,1f3e2,1f3e5,1f3e8,1f3ea,1f3eb,1f3ed,1f3ee,1f3f0,1f400,1f401,1f402,1f403,1f404,1f407,1f408,1f40a,1f40b,1f40c,1f40d,1f410,1f411,1f412,1f413,1f414,1f415,1f416,1f418,1f419,1f41a,1f41b,1f41c,1f41d,1f41e,1f41f,1f422,1f424,1f426,1f427,1f428,1f42a,1f42c,1f42d,1f42e,1f42f,1f430,1f431,1f434,1f435,1f436,1f437,1f438,1f439,1f43a,1f43b,1f43c,1f43f-fe0f,1f440,1f441-fe0f,1f442,1f443,1f444,1f445,1f446,1f447,1f44b,1f44d,1f44e,1f44f,1f450,1f451,1f455,1f456,1f457,1f45c,1f45f,1f462,1f466,1f467,1f468,1f468-200d-1f469-200d-1f467,1f469,1f469-200d-1f3eb,1f46e,1f474,1f475,1f476,1f477,1f478,1f487,1f48a,1f48b,1f494,1f497,1f499,1f49b,1f49c,1f4a1,1f4a4,1f4a7,1f4a8,1f4aa,1f4ab,1f4ac,1f4b0,1f4b8,1f4bb,1f4c4,1f4c5,1f4c8,1f4ca,1f4cb,1f4cc,1f4cd,1f4cf,1f4d0,1f4d3,1f4d5,1f4d6,1f4d7,1f4d8,1f4da,1f4dd,1f4de,1f4e5,1f4e6,1f4e7,1f4f1,1f4f4,1f4f6,1f4f7,1f4fa,1f500,1f501,1f504,1f506,1f509,1f50a,1f50b,1f50d,1f511,1f512,1f513,1f514,1f517,1f51f,1f520,1f521,1f522,1f524,1f525,1f527,1f528,1f52a,1f52c,1f52d,1f534,1f535,1f536,1f537,1f538,1f53a,1f54a-fe0f,1f54c,1f550,1f552,1f556,1f559,1f55f,1f56f-fe0f,1f570-fe0f,1f573-fe0f,1f577-fe0f,1f578-fe0f,1f58a-fe0f,1f58c-fe0f,1f58d-fe0f,1f5a5-fe0f,1f5bc-fe0f,1f5c2-fe0f,1f5d1-fe0f,1f5d3-fe0f,1f5e3-fe0f,1f5fa-fe0f,1f5fc,1f600,1f602,1f60a,1f620,1f622,1f628,1f632,1f634,1f63a,1f642,1f648,1f64b,1f64f,1f680,1f682,1f686,1f689,1f68c,1f690,1f695,1f697,1f699,1f69a,1f6a2,1f6a6,1f6a9,1f6aa,1f6ab,1f6b0,1f6b2,1f6b4,1f6b6,1f6bf,1f6c1,1f6c2,1f6cc,1f6cd-fe0f,1f6cf-fe0f,1f6d1,1f6d2,1f6e3-fe0f,1f6eb,1f7e0,1f7e1,1f7e2,1f7e3,1f7e4,1f7e5,1f7e6,1f7e7,1f7e8,1f7e9,1f7eb,1f7f0,1f90d,1f912,1f914,1f915,1f916,1f91d,1f924,1f938,1f940,1f941,1f944,1f94a,1f952,1f954,1f955,1f95a,1f95b,1f95c,1f964,1f966,1f96d,1f971,1f976,1f980,1f981,1f982,1f983,1f985,1f986,1f987,1f988,1f989,1f98a,1f98b,1f992,1f993,1f99a,1f99b,1f99c,1f99f,1f9a6,1f9b6,1f9b7,1f9c0,1f9c1,1f9c3,1f9c4,1f9c5,1f9ca,1f9d1-200d-1f33e,1f9d1-200d-1f373,1f9d1-200d-1f3a8,1f9d1-200d-1f3eb,1f9d1-200d-1f52c,1f9d1-200d-1f680,1f9d1-200d-1f692,1f9d1-200d-2695-fe0f,1f9d1-200d-2696-fe0f,1f9d1-200d-2708-fe0f,1f9d2,1f9d3,1f9d4,1f9e0,1f9e2,1f9e5,1f9e6,1f9e9,1f9ed,1f9ee,1f9f1,1f9f2,1f9f3,1f9f4,1f9f8,1f9f9,1f9fc,1f9fd,1f9fe,1fa77,1fa7a,1fa80,1fa81,1fa90,1fa91,1fa99,1fa9a,1fa9b,1fa9c,1fa9e,1fa9f,1faa1,1faa5,1faa8,1faae,1fab0,1fab6,1fab8,1faba,1facf,1fad6,1fad9,1fada,1fae7,231a,23f0,23f1-fe0f,23f3,23f9-fe0f,2600-fe0f,2601-fe0f,2602-fe0f,2614,2615,267b-fe0f,2696-fe0f,2699-fe0f,26a0-fe0f,26a1,26aa,26ab,26bd,26c4,26f0-fe0f,26f1-fe0f,26f5,26fa,2702-fe0f,2705,2708-fe0f,2709-fe0f,270b,270d-fe0f,270f-fe0f,2716-fe0f,2728,2744-fe0f,274c,2753,2754,2764-fe0f,2795,2796,2797,27a1-fe0f,2b05-fe0f,2b06-fe0f,2b07-fe0f,2b1b,2b50'.split(','));
  const EM = /(?:[\u{1F1E6}-\u{1F1FF}]{2}|[\u{1F300}-\u{1FAFF}☀-➿⬀-⯿⌀-⏿]️?[\u{1F3FB}-\u{1F3FF}]?(?:‍[\u{1F300}-\u{1FAFF}☀-➿♀♂]️?)*)/gu;
  const nm = e => {
    const c = [...e].map(x => x.codePointAt(0).toString(16));
    for (const n of [c.join('-'), c.filter(x => x !== 'fe0f').join('-'), c.join('-') + '-fe0f']) if (AV.has(n)) return n;
    return null;
  };
  window.SCENES = ['1f305', '1f308', '1f309', '1f30a', '1f30b', '1f30d', '1f310', '1f319', '1f31e', '1f321', '1f327', '1f32c', '1f330', '1f331', '1f332', '1f333', '1f334', '1f335', '1f337', '1f338', '1f339', '1f33a', '1f33d', '1f33f', '1f342', '1f343', '1f344', '1f345', '1f347', '1f349', '1f34a', '1f34b', '1f34c', '1f34d', '1f34e', '1f350', '1f351', '1f352', '1f353', '1f355', '1f35a', '1f35e', '1f35f', '1f366', '1f36a', '1f36b', '1f36c', '1f36f', '1f372', '1f373', '1f375', '1f37d', '1f381', '1f382', '1f383', '1f388', '1f392', '1f3a4', '1f3a7', '1f3a8', '1f3a9', '1f3ab', '1f3b8', '1f3b9', '1f3ba', '1f3bb', '1f3be', '1f3c0', '1f3c3', '1f3ca', '1f3d9', '1f3db', '1f3dc', '1f3dd', '1f3de', '1f3df', '1f3e0', '1f3e1', '1f3e2', '1f3e5', '1f3e8', '1f3ea', '1f3eb', '1f3ed', '1f3ee', '1f3f0', '1f400', '1f402', '1f403', '1f407', '1f408', '1f40a', '1f40b', '1f40c', '1f40d', '1f410', '1f411', '1f412', '1f413', '1f414', '1f415', '1f418', '1f419', '1f41a', '1f41b', '1f41c', '1f41d', '1f41f', '1f422', '1f424', '1f426', '1f427', '1f428', '1f42a', '1f42c', '1f42e', '1f42f', '1f430', '1f431', '1f434', '1f436', '1f437', '1f438', '1f43a', '1f43b', '1f440', '1f441', '1f442', '1f443', '1f444', '1f445', '1f44b', '1f450', '1f451', '1f455', '1f457', '1f45c', '1f45f', '1f462', '1f466', '1f467', '1f468', '1f468-200d-1f469-200d-1f467', '1f469', '1f46e', '1f474', '1f475', '1f476', '1f477', '1f478', '1f487', '1f48a', '1f48b', '1f499', '1f4a1', '1f4a7', '1f4a8', '1f4b0', '1f4b8', '1f4bb', '1f4c4', '1f4cc', '1f4cd', '1f4cf', '1f4d3', '1f4d5', '1f4da', '1f4de', '1f4e6', '1f4e7', '1f4f1', '1f4f7', '1f4fa', '1f506', '1f50b', '1f511', '1f514', '1f51f', '1f525', '1f527', '1f528', '1f52a', '1f52c', '1f52d', '1f534', '1f535', '1f536', '1f53a', '1f54a', '1f54c', '1f550', '1f552', '1f556', '1f559', '1f55f', '1f570', '1f578', '1f58a', '1f58c', '1f5a5', '1f5d1', '1f5e3', '1f5fa', '1f5fc', '1f600', '1f602', '1f60a', '1f620', '1f622', '1f628', '1f632', '1f634', '1f64b', '1f64f', '1f680', '1f686', '1f689', '1f68c', '1f690', '1f695', '1f697', '1f699', '1f69a', '1f6a2', '1f6a6', '1f6a9', '1f6aa', '1f6ab', '1f6b0', '1f6b2', '1f6b4', '1f6b6', '1f6bf', '1f6c1', '1f6c2', '1f6cc', '1f6cd', '1f6cf', '1f6d1', '1f6d2', '1f6e3', '1f6eb', '1f7e0', '1f7e1', '1f7e2', '1f7e3', '1f7e4', '1f7e6', '1f7f0', '1f912', '1f914', '1f915', '1f916', '1f91d', '1f924', '1f938', '1f941', '1f944', '1f94a', '1f952', '1f954', '1f955', '1f95a', '1f95b', '1f95c', '1f964', '1f966', '1f96d', '1f971', '1f976', '1f980', '1f981', '1f982', '1f983', '1f985', '1f986', '1f987', '1f988', '1f989', '1f98a', '1f98b', '1f98c', '1f992', '1f993', '1f99a', '1f99b', '1f99f', '1f9a6', '1f9b6', '1f9b7', '1f9c0', '1f9c3', '1f9c4', '1f9c5', '1f9ca', '1f9d1-200d-1f33e', '1f9d1-200d-1f373', '1f9d1-200d-1f3a8', '1f9d1-200d-1f3eb', '1f9d1-200d-1f52c', '1f9d1-200d-1f680', '1f9d1-200d-1f692', '1f9d1-200d-2695', '1f9d1-200d-2696', '1f9d1-200d-2708', '1f9d2', '1f9d4', '1f9e2', '1f9e5', '1f9e6', '1f9f1', '1f9f2', '1f9f3', '1f9f4', '1f9f8', '1f9f9', '1f9fc', '1f9fe', '1fa77', '1fa81', '1fa90', '1fa91', '1fa9a', '1fa9b', '1fa9c', '1fa9e', '1fa9f', '1faa1', '1faa5', '1faa8', '1fab0', '1fab6', '1fab8', '1faba', '1facf', '1fada', '231a', '23f0', '23f3', '2600', '2601', '2602', '2615', '267b', '2696', '26a1', '26aa', '26ab', '26bd', '26f0', '26f1', '26f5', '26fa', '2702', '2708', '2709', '270b', '270d', '270f', '2716', '2744', '2764', '2795', '2796', '2797', '27a1', '2b05', '2b06', '2b07', '2b1b'];
  const SC = new Set(window.SCENES);
  const BIG = '#app .grid .card,#app .grid .opt,#app .opts .opt,.chips.bm-pics button,#app .q,.lf-pic,#app .engrid .opt,#app .sb-opts .opt,.enpic,.enpic2,.vq-pic,.g2-pic,.g2-card .big,.g2-opt,#app .mem .card,#app .card-back,.artx .pic,.arteach .pic,.vq-opts button,#app .opt.pic,#app .pics button,.g2-q,#app .g2 .opt,#app .g2 button.o';
  const SKIP = 'script,style,textarea,input,select,option,svg,canvas,code,pre,.e3w,[data-no3d]';
  function conv(root) {
    if (!root || (root.nodeType !== 1 && root.nodeType !== 3)) return;
    const nodes = [];
    if (root.nodeType === 3) {
      if (root.parentElement && !root.parentElement.closest(SKIP)) nodes.push(root);
    } else {
      if (root.closest && root.closest(SKIP)) return;
      const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: n => {
          EM.lastIndex = 0;
          return EM.test(n.nodeValue) && !(n.parentElement && n.parentElement.closest(SKIP)) ? 1 : 2;
        }
      });
      let n;
      while ((n = w.nextNode())) nodes.push(n);
    }
    for (const t of nodes) {
      const s = t.nodeValue;
      EM.lastIndex = 0;
      if (!EM.test(s)) continue;
      EM.lastIndex = 0;
      const f = document.createDocumentFragment();
      let last = 0, m, any = false;
      while ((m = EM.exec(s))) {
        const n = nm(m[0]);
        if (!n) continue;
        any = true;
        if (m.index > last) f.appendChild(document.createTextNode(s.slice(last, m.index)));
        const big = SC.has(n.replace(/-fe0f$/, '')) && t.parentElement && t.parentElement.closest(BIG);
        const w = document.createElement('span');
        w.className = 'e3w' + (big ? ' e3sw' : '');
        const i = document.createElement('img');
        i.className = 'e3d' + (big ? ' e3s' : '');
        i.alt = '';
        i.decoding = 'async';
        i.loading = 'lazy';
        i.draggable = false;
        i.src = big ? 'img/scenes/' + n.replace(/-fe0f$/, '') + '.webp' : 'img/3d/' + n + '.webp';
        const tx = document.createElement('span');
        tx.className = 'e3t';
        tx.textContent = m[0];
        w.append(i, tx);
        f.appendChild(w);
        last = m.index + m[0].length;
      }
      if (!any) continue;
      if (last < s.length) f.appendChild(document.createTextNode(s.slice(last)));
      t.parentNode && t.parentNode.replaceChild(f, t);
    }
  }
  const run = () => conv(document.body);
  new MutationObserver(rows => {
    for (const r of rows) {
      if (r.type === 'characterData') conv(r.target);
      else for (const n of r.addedNodes) conv(n);
    }
  }).observe(document.body, { childList: true, subtree: true, characterData: true });
  run();
  window.Emoji3D = { conv, name: nm };
})();
