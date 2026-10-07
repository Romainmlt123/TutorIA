/* @ds-bundle: {"format":4,"namespace":"TutorIA","components":[{"name":"Icon"},{"name":"Logo"},{"name":"Button"},{"name":"IconButton"},{"name":"SegmentedControl"},{"name":"ModeToggle"},{"name":"BottomNav"},{"name":"Switch"},{"name":"GoalStepper"},{"name":"StatusChip"},{"name":"ProgressRing"},{"name":"Quote"},{"name":"SubjectCard"},{"name":"StreakCard"},{"name":"LevelCard"},{"name":"ResumeCard"},{"name":"GoalCard"},{"name":"TopicCard"},{"name":"ChatBubble"},{"name":"TipCard"},{"name":"ChatInput"},{"name":"VoiceVisualizer"},{"name":"CallControls"},{"name":"CallTopBar"},{"name":"VoiceAvatar"},{"name":"VoiceStatus"},{"name":"LiveCaptions"},{"name":"CallDock"},{"name":"PanelHeader"},{"name":"VisualPanel"},{"name":"MathGraph"},{"name":"Whiteboard"},{"name":"DailyReviewCard"},{"name":"ChapterRow"},{"name":"SessionProgress"},{"name":"AnswerOption"},{"name":"QuizCard"},{"name":"TallyChips"},{"name":"KpiCard"},{"name":"BarChart"},{"name":"LineChart"},{"name":"Heatmap"},{"name":"SubjectProgressRow"},{"name":"InsightList"},{"name":"ChildSwitcher"},{"name":"HeroCard"},{"name":"AlertCard"},{"name":"AdviceCard"},{"name":"SubjectProgressCard"},{"name":"SessionSummaryCard"},{"name":"SettingRow"},{"name":"TextField"},{"name":"PasswordRules"},{"name":"Checkbox"},{"name":"OrDivider"},{"name":"AuthProviderButtons"},{"name":"AuthHero"},{"name":"ProfileChoiceCard"},{"name":"SubjectCluster"},{"name":"StepHeader"},{"name":"GradePicker"},{"name":"SelfAssessmentRow"},{"name":"GoalTile"},{"name":"DurationPicker"},{"name":"ChoiceRow"},{"name":"ToggleChip"},{"name":"ParentCodeCard"},{"name":"StepList"},{"name":"PlanRow"},{"name":"Stars"},{"name":"IslandIllustration"},{"name":"IslandCarousel"},{"name":"IslandProgressCard"},{"name":"ExplorerHud"},{"name":"LevelNode"},{"name":"MapAvatar"},{"name":"CityBanner"},{"name":"RegionSign"},{"name":"WorldMap"},{"name":"LevelTypePill"},{"name":"LevelSheet"},{"name":"IslandBackdrop"},{"name":"LevelProgressHeader"},{"name":"VoiceBoardCard"},{"name":"LevelResultCard"},{"name":"TutorFeedback"}]} */
(function () {
  'use strict';
  var React = window.React;
  var h = React.createElement;
  var useState = React.useState;
  var useEffect = React.useEffect;

  function assign() {
    var out = {};
    for (var i = 0; i < arguments.length; i++) {
      var o = arguments[i];
      if (o) for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) out[k] = o[k];
    }
    return out;
  }

  var FONT = 'var(--font-sans)';
  var LOGO_WHITE = '/_blob/6421dac2f65bda0ddabb492ecbade343';
  var LOGO_BLUE = '/_blob/0ebc4e1e46d76a4e553b2ef4190b550c';
  var VEIL = 'rgba(255,255,255,0.24)';

  /* ---------- Icônes (contour, grille 24) ---------- */
  var ICONS = {
    pencil: 'M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16zM13.5 6.5l4 4',
    crown: 'M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5zM5 19h14',
    compass: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zM15.5 8.5l-2 5-5 2 2-5z',
    checkCircle: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zM8 12.5l2.7 2.7L16 10',
    list: 'M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01',
    flag: 'M5 21V4M5 4h11l-2 4 2 4H5',
    home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
    map: 'M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5zM9 4v13M15 6.5v13',
    cards: 'M10 3h8a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM5 7v11a3 3 0 0 0 3 3h8',
    stats: 'M3 21h18M6 11h1a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1zM11.5 5h1a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM17 14h1a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z',
    trend: 'M3 17l6-6 4 4 8-8M15 7h6v6',
    sessions: 'M21 11.5a8.5 8.5 0 0 1-12.4 7.6L4 20l1-4.3A8.5 8.5 0 1 1 21 11.5zM8.5 10h7M8.5 13.5h4.5',
    chat: 'M21 11.5a8.5 8.5 0 0 1-12.4 7.6L4 20l1-4.3A8.5 8.5 0 1 1 21 11.5zM9 11.5h.01M12.5 11.5h.01M16 11.5h.01',
    sliders: 'M4 7h10M18 7h2M4 17h2M10 17h10M18 7a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM10 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0z',
    bell: 'M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 21h4',
    arrowRight: 'M5 12h14M13 6l6 6-6 6',
    arrowUp: 'M12 19V5M6 11l6-6 6 6',
    chevronLeft: 'M15 5l-7 7 7 7',
    chevronRight: 'M9 6l6 6-6 6',
    chevronDown: 'M6 9l6 6 6-6',
    chevronUp: 'M6 15l6-6 6 6',
    close: 'M6 6l12 12M18 6 6 18',
    plus: 'M12 5v14M5 12h14',
    check: 'M5 12.5 10 17l9-10',
    retry: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5',
    flip: 'M3 12a9 9 0 0 1 15.5-6.2L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.2L3 16M3 21v-5h5',
    mic: 'M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM5 11a7 7 0 0 0 14 0M12 18v3',
    micOff: 'M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM5 11a7 7 0 0 0 14 0M12 18v3M4 4l16 16',
    video: 'M5 6h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zM15 10l6-3v10l-6-3z',
    videoOff: 'M5 6h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zM15 10l6-3v10l-6-3zM3 3l18 18',
    volume: 'M11 5 6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14',
    captions: 'M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM7 15h4M15 15h2M7 11h2M13 11h4',
    hangup: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z',
    more: 'M5 12h.01M12 12h.01M19 12h.01',
    keyboard: 'M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zM6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10',
    bulb: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z',
    star: 'M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.3l-5.8 3.1 1.1-6.5L2.6 9.3l6.5-.9z',
    flame: 'M12 2.5c1 3.2 5.5 5.6 5.5 10.5a5.5 5.5 0 0 1-11 0c0-2.2 1-3.8 2.2-4.9 0 2.1 1 3.3 2.1 3.3 0-3.3-1-5.4 1.2-8.9z',
    clock: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zM12 7v5l3 2',
    target: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zM17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0zM12 12h.01',
    calendar: 'M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM4 10h16M9 3v4M15 3v4',
    warning: 'M12 3 2 20h20zM12 10v4M12 17h.01',
    shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4',
    moon: 'M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z',
    mail: 'M4 6h16v12H4zM4 7l8 6 8-6',
    expand: 'M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7',
    graph: 'M4 4v16h16M7 16l4-5 3 3 5-7',
    pen: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
    user: 'M16 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM4 21c1-4 4.5-6 8-6s7 2 8 6',
    maths: 'M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01',
    francais: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 21V5M8 7h7M8 11h5',
    'histoire-geo': 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zM3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18',
    anglais: 'M4 5h9M8.5 3v2M11 5c-1 4-3.5 7-7 8.5M6 8.5c1.5 2.5 3.5 4 6 5M13 21l4-9 4 9M14.5 18h5',
    svt: 'M5 19c0-8 5-14 15-15-1 10-7 15-15 15zM5 19l8-8',
    'physique-chimie': 'M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3M7.5 15h9',
    cap: 'M2 9l10-5 10 5-10 5zM6 11.5v4.5c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5M22 9v5',
    family: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c.8-3.5 3.6-5.5 7-5.5s6.2 2 7 5.5M16 3.5a4 4 0 0 1 0 7M18 15.8c2 .8 3.4 2.6 4 5.2',
    eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
    eyeOff: 'M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6C3.9 8.3 2 12 2 12s3.6 7 10 7c1.9 0 3.6-.6 5-1.5M9.9 9.9a3 3 0 0 0 4.2 4.2',
    lock: 'M6 11h12v10H6zM8.5 11V7.5a3.5 3.5 0 0 1 7 0V11',
    key: 'M15 7a4 4 0 1 1-3.9 4.9L4 19v2h3v-2h2v-2h2l1.1-1.1A4 4 0 0 1 15 7zM16 10h.01',
    share: 'M12 3v12M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5',
    phone: 'M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM11 18h2',
    link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
    rocket: 'M5 15c-1.5 1.5-2 4-2 6 2 0 4.5-.5 6-2M9 15l-3-3c1-4 4.5-8 12-9-1 7.5-5 11-9 12zM14.5 9.5h.01',
    medal: 'M8 3h8l-2 6h-4zM12 9a6 6 0 1 1 0 12 6 6 0 0 1 0-12zM12 13v4',
    book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 21V5M8 7h7M8 11h5',
    sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4'
  };
  var FILLED = { flame: true };

  function Icon(p) {
    var size = p.size || 24;
    var filled = p.filled != null ? p.filled : FILLED[p.name];
    return h('svg', {
      width: size, height: size, viewBox: '0 0 24 24',
      fill: filled ? (p.color || 'currentColor') : 'none',
      stroke: filled ? 'none' : (p.color || 'currentColor'),
      strokeWidth: p.strokeWidth || 1.75, strokeLinecap: 'round', strokeLinejoin: 'round',
      'aria-hidden': p.label ? undefined : 'true', role: p.label ? 'img' : undefined, 'aria-label': p.label,
      style: assign({ display: 'block', flexShrink: 0 }, p.style)
    }, h('path', { d: ICONS[p.name] || '' }));
  }

  function Logo(p) {
    var size = p.size || 40;
    var blue = p.variant === 'bleu';
    return h('img', {
      src: blue ? LOGO_BLUE : LOGO_WHITE, alt: p.alt != null ? p.alt : "Tutor'IA", width: size, height: size,
      style: assign({ display: 'block', width: size, height: size, borderRadius: p.round ? 999 : (blue ? Math.round(size * 0.28) : 0), objectFit: 'contain' }, p.style)
    });
  }

  /* ---------- Matières ---------- */
  var SUBJECTS = {
    maths: { name: 'Maths', gradient: 'linear-gradient(160deg, var(--red-400) 0%, var(--red-600) 60%, var(--red-700) 100%)', soft: 'var(--red-100)', ink: 'var(--red-600)', deep: 'var(--red-700)', bar: 'var(--red-500)' },
    francais: { name: 'Français', gradient: 'linear-gradient(160deg, var(--blue-400) 0%, var(--blue-600) 60%, var(--blue-700) 100%)', soft: 'var(--blue-100)', ink: 'var(--blue-600)', deep: 'var(--blue-700)', bar: 'var(--blue-500)' },
    'histoire-geo': { name: 'Histoire-Géo', gradient: 'linear-gradient(160deg, var(--green-600) 0%, var(--green-700) 45%, var(--green-800) 100%)', soft: 'var(--green-100)', ink: 'var(--green-800)', deep: 'var(--green-900)', bar: 'var(--green-700)' },
    anglais: { name: 'Anglais', gradient: 'linear-gradient(160deg, var(--cyan-600) 0%, var(--cyan-700) 45%, var(--cyan-800) 100%)', soft: 'var(--cyan-100)', ink: 'var(--cyan-800)', deep: 'var(--cyan-900)', bar: 'var(--cyan-700)' },
    svt: { name: 'SVT', gradient: 'linear-gradient(160deg, var(--orange-700) 0%, var(--orange-800) 65%, var(--orange-900) 100%)', soft: 'var(--orange-100)', ink: 'var(--orange-800)', deep: 'var(--orange-900)', bar: 'var(--orange-700)' },
    'physique-chimie': { name: 'Physique-Chimie', gradient: 'linear-gradient(160deg, var(--violet-400) 0%, var(--violet-600) 60%, var(--violet-700) 100%)', soft: 'var(--violet-100)', ink: 'var(--violet-600)', deep: 'var(--violet-700)', bar: 'var(--violet-500)' }
  };
  function subj(id) { return SUBJECTS[id] || SUBJECTS.maths; }

  var TONES = {
    blue: 'linear-gradient(160deg, var(--blue-500) 0%, var(--blue-600) 55%, var(--blue-700) 100%)',
    hero: 'linear-gradient(160deg, var(--blue-500) 0%, var(--blue-600) 50%, var(--violet-700) 100%)',
    cyan: SUBJECTS.anglais.gradient,
    violet: SUBJECTS['physique-chimie'].gradient,
    green: SUBJECTS['histoire-geo'].gradient,
    red: SUBJECTS.maths.gradient,
    orange: 'var(--orange-500)',
    slate: 'var(--gray-600)'
  };

  function Watermark(p) {
    return h('span', { 'aria-hidden': 'true', style: assign({ position: 'absolute', opacity: p.opacity || 0.16, pointerEvents: 'none', color: '#fff' }, p.style) },
      h(Icon, { name: p.name, size: p.size || 96, strokeWidth: 1.5, color: '#fff' }));
  }
  function Veil(p) {
    return h('span', { style: { width: p.size || 40, height: p.size || 40, borderRadius: 999, background: p.background || VEIL, color: p.color || '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } },
      h(Icon, { name: p.icon, size: p.iconSize || 22, filled: p.filled }));
  }
  function Pill(p) {
    return h('span', { style: assign({ display: 'inline-flex', alignItems: 'center', gap: 6, height: p.height || 26, padding: '0 10px', borderRadius: 999, background: p.background, color: p.color, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', boxSizing: 'border-box' }, p.style) }, p.children);
  }
  function Card(p) {
    return h(p.as || 'div', assign({}, p.attrs, { style: assign({ position: 'relative', overflow: 'hidden', background: 'var(--surface)', borderRadius: 'var(--radius-3xl)', boxShadow: 'var(--shadow-md)', padding: 20, boxSizing: 'border-box', fontFamily: FONT, color: 'var(--text)' }, p.style) }), p.children);
  }
  function Overline(p) {
    return h('span', { style: assign({ fontSize: 12, lineHeight: '16px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: p.color || 'var(--text-secondary)' }, p.style) }, p.children);
  }

  /* ---------- Actions ---------- */
  function Button(p) {
    var v = p.variant || 'primary';
    var bg = { primary: 'var(--primary)', vivid: 'var(--violet-500)', soft: 'var(--primary-soft)', white: '#fff', ghost: 'transparent', danger: 'var(--error-soft)' }[v];
    var color = { primary: '#fff', vivid: '#fff', soft: 'var(--primary)', white: 'var(--text)', ghost: 'var(--primary)', danger: 'var(--error-strong)' }[v];
    var shadow = p.brand ? (v === 'vivid' ? '0 8px 20px rgba(102,46,230,0.30)' : 'var(--shadow-brand)') : 'none';
    var small = p.size === 'sm';
    var style = {
      display: p.fullWidth ? 'flex' : 'inline-flex', width: p.fullWidth ? '100%' : undefined, alignItems: 'center', justifyContent: 'center', gap: 8,
      height: 48, padding: small ? '0 16px' : '0 20px', boxSizing: 'border-box', border: 'none', borderRadius: 'var(--radius-2xl)',
      background: bg, color: color, boxShadow: shadow, fontFamily: FONT, fontSize: small ? 14 : 16, fontWeight: small || v === 'vivid' ? 700 : 500,
      textDecoration: 'none', cursor: p.disabled ? 'default' : 'pointer', opacity: p.disabled ? 0.4 : 1
    };
    var kids = [p.icon ? h(Icon, { key: 'i', name: p.icon, size: 20 }) : null, p.children, p.iconRight ? h(Icon, { key: 'r', name: p.iconRight, size: 20, strokeWidth: 2 }) : null];
    if (p.href) return h('a', { href: p.href, style: style }, kids);
    return h('button', { type: 'button', onClick: p.onClick, disabled: p.disabled, style: style }, kids);
  }

  function IconButton(p) {
    return h('button', {
      type: 'button', onClick: p.onClick, 'aria-label': p.label,
      style: { position: 'relative', width: p.size || 48, height: p.size || 48, border: 'none', borderRadius: 'var(--radius-2xl)', background: p.tone === 'soft' ? 'var(--bg)' : 'var(--surface)', boxShadow: p.tone === 'soft' ? 'none' : 'var(--shadow-sm)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }
    }, h(Icon, { name: p.icon, size: 22 }),
      p.badge ? h('span', { 'aria-hidden': 'true', style: { position: 'absolute', top: 10, right: 12, width: 10, height: 10, borderRadius: 999, background: 'var(--accent)', border: '2px solid var(--surface)', boxSizing: 'border-box' } }) : null);
  }

  function SegmentedControl(p) {
    var full = p.fullWidth;
    return h('div', {
      role: 'group', 'aria-label': p.label || 'Choix',
      style: { display: full ? 'grid' : 'inline-flex', gridTemplateColumns: full ? 'repeat(' + p.options.length + ', minmax(0, 1fr))' : undefined, gap: 4, padding: 4, background: 'var(--surface)', borderRadius: 'var(--radius-3xl)', boxShadow: 'var(--shadow-sm)', fontFamily: FONT }
    }, p.options.map(function (o) {
      var on = o.id === p.value;
      return h('button', {
        key: o.id, type: 'button', 'aria-pressed': on, onClick: function () { if (p.onChange) p.onChange(o.id); },
        style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 40, padding: '0 20px', border: 'none', borderRadius: 20, background: on ? 'var(--primary)' : 'transparent', color: on ? '#fff' : 'var(--text-secondary)', fontFamily: FONT, fontSize: 14, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }
      }, o.icon ? h(Icon, { name: o.icon, size: 18 }) : null, o.label);
    }));
  }

  function ModeToggle(p) {
    return h(SegmentedControl, { label: 'Mode de discussion', value: p.mode || 'ecrit', onChange: p.onChange, options: [{ id: 'ecrit', label: 'Écrit', icon: 'keyboard' }, { id: 'vocal', label: 'Vocal', icon: 'mic' }] });
  }

  var NAV_TABS = {
    eleve: [
      { id: 'accueil', label: 'Accueil', icon: 'home' }, { id: 'explorer', label: 'Explorer', icon: 'compass' },
      { id: 'tuteur', label: "Tutor'IA", logo: true }, { id: 'revisions', label: 'Révisions', icon: 'cards' }, { id: 'stats', label: 'Stats', icon: 'stats' }
    ],
    parents: [
      { id: 'accueil', label: 'Accueil', icon: 'home' }, { id: 'progres', label: 'Progrès', icon: 'trend' },
      { id: 'sessions', label: 'Sessions', icon: 'sessions' }, { id: 'reglages', label: 'Réglages', icon: 'sliders' }
    ]
  };
  function BottomNav(p) {
    var tabs = NAV_TABS[p.space === 'parents' ? 'parents' : 'eleve'];
    return h('nav', {
      'aria-label': p.space === 'parents' ? 'Navigation Parents' : 'Navigation principale',
      style: { position: 'relative', height: 72, padding: '0 4px', boxSizing: 'border-box', background: 'var(--surface)', borderRadius: 'var(--radius-3xl)', boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'stretch', fontFamily: FONT }
    }, tabs.map(function (t) {
      var on = t.id === (p.active === 'parcours' ? 'explorer' : p.active);
      var bubble = t.logo ? 60 : 52;
      var glyph;
      if (on) {
        glyph = h('span', { style: { width: bubble, height: bubble, boxSizing: 'border-box', borderRadius: 999, background: 'var(--primary)', border: '4px solid var(--surface)', boxShadow: 'var(--shadow-md)', overflow: 'hidden', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
          t.logo ? h(Logo, { variant: 'bleu', size: 42, alt: '' }) : h(Icon, { name: t.icon, size: 22 }));
      } else {
        glyph = t.logo ? h(Logo, { size: 30, alt: '', style: { marginBottom: -2 } }) : h(Icon, { name: t.icon, size: 24 });
      }
      return h('button', {
        key: t.id, type: 'button', 'aria-current': on ? 'page' : undefined, onClick: function () { if (p.onNavigate) p.onNavigate(t.id); },
        style: { flex: '1 1 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 4, paddingBottom: 12, border: 'none', background: 'transparent', color: 'var(--gray-400)', cursor: 'pointer', fontFamily: FONT }
      }, glyph, h('span', { style: { fontSize: 12, lineHeight: '16px', fontWeight: on ? 700 : 500, color: on ? 'var(--primary)' : 'var(--text-secondary)' } }, t.label));
    }));
  }

  function Switch(p) {
    var on = !!p.checked;
    return h('button', {
      type: 'button', role: 'switch', 'aria-checked': on, 'aria-label': p.label, onClick: function () { if (p.onChange) p.onChange(!on); },
      style: { position: 'relative', flexShrink: 0, width: 52, height: 32, padding: 0, border: 'none', borderRadius: 999, background: on ? 'var(--primary)' : 'var(--gray-200)', cursor: 'pointer', transition: 'background 0.2s ease' }
    }, h('span', { style: { position: 'absolute', top: 4, left: on ? 24 : 4, width: 24, height: 24, borderRadius: 999, background: '#fff', boxShadow: '0 1px 3px rgba(9,17,34,0.25)', transition: 'left 0.2s ease' } }));
  }

  function GoalStepper(p) {
    var value = p.value != null ? p.value : 4;
    var min = p.min != null ? p.min : 1, max = p.max != null ? p.max : 10;
    function set(v) { if (p.onChange) p.onChange(Math.max(min, Math.min(max, v))); }
    var btn = function (label, sign, white) {
      return h('button', { type: 'button', 'aria-label': label, onClick: function () { set(value + sign); }, style: { width: 52, height: 52, border: 'none', borderRadius: 'var(--radius-2xl)', background: white ? '#fff' : VEIL, color: white ? 'var(--green-800)' : '#fff', fontFamily: FONT, fontSize: 24, fontWeight: 700, cursor: 'pointer' } }, sign > 0 ? '+' : '−');
    };
    return h(Card, { style: { background: TONES.green, color: '#fff', display: 'flex', flexDirection: 'column', gap: 16 } },
      h(Watermark, { name: 'target', size: 120, opacity: 0.14, style: { right: -28, top: -30 } }),
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: 2 } },
        h(Overline, { color: '#fff' }, p.title || 'Objectif hebdomadaire'),
        p.hint ? h('span', { style: { fontSize: 14, lineHeight: '20px', fontWeight: 500 } }, p.hint) : null),
      h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
        btn("Diminuer l'objectif", -1, false),
        h('span', { 'aria-live': 'polite', style: { fontSize: 40, lineHeight: '48px', fontWeight: 900 } }, value + ' ' + (p.unit || 'h')),
        btn("Augmenter l'objectif", 1, true)));
  }

  /* ---------- Statuts & indicateurs ---------- */
  var STATUSES = {
    acquired: { label: 'Acquis', bg: 'var(--green-700)', color: '#fff', icon: 'check' },
    inProgress: { label: 'En cours', bg: 'var(--blue-500)', color: '#fff', icon: 'trend' },
    toConsolidate: { label: 'À consolider', bg: 'var(--orange-500)', color: '#fff', icon: 'retry' },
    notStarted: { label: 'Pas commencé', bg: 'var(--gray-200)', color: 'var(--gray-700)', icon: null },
    understood: { label: 'Compris', bg: 'var(--green-700)', color: '#fff', icon: 'check' },
    progressing: { label: 'En progrès', bg: 'var(--blue-500)', color: '#fff', icon: 'trend' },
    toReview: { label: 'À revoir', bg: 'var(--orange-500)', color: '#fff', icon: 'retry' }
  };
  function StatusChip(p) {
    var s = STATUSES[p.status] || STATUSES.inProgress;
    return h(Pill, { background: s.bg, color: s.color, height: p.icon ? 28 : 26 }, p.icon && s.icon ? h(Icon, { name: s.icon, size: 14, strokeWidth: 2.5 }) : null, p.label || s.label);
  }

  function ProgressRing(p) {
    var size = p.size || 56, stroke = p.stroke || 6, r = (size - stroke) / 2, c = 2 * Math.PI * r;
    var v = Math.max(0, Math.min(1, p.value != null ? p.value : 0));
    var onColor = p.onColor;
    return h('div', { style: { position: 'relative', width: size, height: size, flexShrink: 0 } },
      h('svg', { width: size, height: size, viewBox: '0 0 ' + size + ' ' + size, 'aria-hidden': 'true' },
        h('circle', { cx: size / 2, cy: size / 2, r: r, fill: 'none', stroke: onColor ? 'rgba(255,255,255,0.22)' : 'var(--blue-100)', strokeWidth: stroke }),
        h('circle', { cx: size / 2, cy: size / 2, r: r, fill: 'none', stroke: onColor ? '#fff' : (p.color || 'var(--primary)'), strokeWidth: stroke, strokeLinecap: 'round', strokeDasharray: (c * v) + ' ' + c, transform: 'rotate(-90 ' + size / 2 + ' ' + size / 2 + ')' })),
      h('span', { style: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: p.fontSize || 14, fontWeight: 900, color: onColor ? '#fff' : 'var(--text)' } }, p.label));
  }

  function Quote(p) {
    return h('figure', { style: { margin: 0, display: 'flex', flexDirection: 'column', gap: 4, fontFamily: FONT } },
      h('blockquote', { style: { margin: 0, fontSize: 14, lineHeight: '20px', fontStyle: 'italic', color: 'var(--text-secondary)' } }, '« ' + p.text + ' »'),
      h('figcaption', { style: { fontSize: 12, lineHeight: '16px', fontWeight: 500, color: 'var(--text-secondary)' } }, '— ' + p.author));
  }

  /* ---------- Cartes élève ---------- */
  function SubjectCard(p) {
    var s = subj(p.subject);
    var sel = !!p.selected;
    var inner = [
      h(Watermark, { key: 'w', name: p.subject, style: { right: -20, bottom: -20 } }),
      h('span', { key: 't', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' } },
        h(Veil, { icon: p.subject }),
        p.progress != null ? h(Pill, { background: VEIL, color: '#fff' }, p.progress + ' %') : null,
        sel ? h('span', { 'aria-hidden': 'true', style: { width: 28, height: 28, borderRadius: 999, background: '#fff', color: s.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' } }, h(Icon, { name: 'check', size: 16, strokeWidth: 2.5 })) : null),
      h('span', { key: 'b', style: { display: 'flex', flexDirection: 'column', gap: 8, width: '100%' } },
        h('span', { style: { fontSize: 18, lineHeight: '24px', fontWeight: 900 } }, s.name),
        p.progress != null ? h('span', { style: { display: 'block', height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.3)', overflow: 'hidden' } }, h('span', { style: { display: 'block', width: p.progress + '%', height: '100%', borderRadius: 999, background: '#fff' } })) : null,
        p.count != null ? h('span', { style: { fontSize: 12, lineHeight: '16px', fontWeight: 500, marginTop: -6 } }, p.count + ' cartes') : null)
    ];
    return h(p.onClick ? 'button' : 'div', {
      type: p.onClick ? 'button' : undefined, onClick: p.onClick, 'aria-pressed': p.onClick ? sel : undefined,
      style: { position: 'relative', overflow: 'hidden', minHeight: 128, padding: 16, boxSizing: 'border-box', border: 'none', borderRadius: 'var(--radius-3xl)', background: s.gradient, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, textAlign: 'left', fontFamily: FONT, cursor: p.onClick ? 'pointer' : 'default', boxShadow: sel ? '0 0 0 3px var(--bg), 0 0 0 6px ' + s.ink + ', var(--shadow-lg)' : 'var(--shadow-md)' }
    }, inner);
  }

  function StreakCard(p) {
    return h(Card, { style: { background: TONES.orange, color: '#fff', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 } },
      h(Watermark, { name: 'flame', size: 96, opacity: 0.22, style: { right: -22, bottom: -18 } }),
      h(Veil, { icon: 'flame', background: '#fff', color: 'var(--orange-500)', filled: true }),
      h('span', { style: { display: 'flex', flexDirection: 'column', gap: 2 } },
        h('span', { style: { fontSize: 24, lineHeight: '32px', fontWeight: 900, whiteSpace: 'nowrap' } }, p.days + ' jours'),
        h('span', { style: { fontSize: 12, lineHeight: '16px', fontWeight: 700, whiteSpace: 'nowrap' } }, p.caption || 'de série, continue !')));
  }

  function LevelCard(p) {
    var pct = Math.round(100 * (p.xp || 0) / (p.xpMax || 1));
    return h(Card, { style: { background: TONES.slate, color: '#fff', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 } },
      h(Watermark, { name: 'star', size: 104, opacity: 0.12, style: { right: -26, bottom: -26 } }),
      h('span', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 } },
        h(Veil, { icon: 'star', background: 'var(--green-500)', color: 'var(--green-900)', filled: true }),
        h('span', { style: { fontSize: 12, fontWeight: 700, color: 'var(--green-200)', whiteSpace: 'nowrap' } }, p.xp + ' / ' + p.xpMax + ' XP')),
      h('span', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
        h('span', { style: { fontSize: 24, lineHeight: '32px', fontWeight: 900, whiteSpace: 'nowrap' } }, 'Niveau ' + p.level),
        h('span', { style: { display: 'block', height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.18)', overflow: 'hidden' } }, h('span', { style: { display: 'block', width: pct + '%', height: '100%', borderRadius: 999, background: 'var(--green-500)' } }))));
  }

  function ResumeCard(p) {
    var s = subj(p.subject);
    return h(Card, { style: { padding: 24, display: 'flex', flexDirection: 'column', gap: 16 } },
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 12 } },
        h('span', { style: { width: 48, height: 48, borderRadius: 'var(--radius-2xl)', background: s.gradient, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } }, h(Icon, { name: p.subject })),
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: 2 } },
          h('span', { style: { fontSize: 22, lineHeight: '30px', fontWeight: 500 } }, p.title),
          h('span', { style: { fontSize: 14, lineHeight: '20px', color: 'var(--text-secondary)' } }, p.subtitle))),
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
        h('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)' } }, h('span', null, 'Progression du chapitre'), h('strong', { style: { color: 'var(--text)' } }, p.progress + ' %')),
        h('div', { style: { height: 8, borderRadius: 999, background: 'var(--primary-soft)', overflow: 'hidden' } }, h('div', { style: { width: p.progress + '%', height: '100%', borderRadius: 999, background: 'var(--primary)' } }))),
      h(Button, { brand: true, fullWidth: true, iconRight: 'arrowRight', onClick: p.onResume, href: p.href }, p.actionLabel || 'Reprendre'));
  }

  function GoalCard(p) {
    return h(Card, { style: { padding: 16, borderRadius: 'var(--radius-2xl)', display: 'flex', alignItems: 'center', gap: 16 } },
      h(ProgressRing, { value: p.done / p.total, label: p.done + '/' + p.total }),
      h('div', { style: { flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 } },
        h('span', { style: { fontSize: 16, lineHeight: '24px', fontWeight: 700 } }, p.title || 'Objectif du jour'),
        h('span', { style: { fontSize: 14, lineHeight: '20px', color: 'var(--text-secondary)' } }, p.detail)),
      p.badge ? h(Pill, { background: 'var(--primary-soft)', color: 'var(--primary)' }, p.badge) : null);
  }

  function TopicCard(p) {
    var s = subj(p.subject);
    return h(Card, { style: { padding: '12px 16px', borderRadius: 'var(--radius-2xl)', display: 'flex', alignItems: 'center', gap: 12, overflow: 'visible' } },
      h('span', { style: { width: 40, height: 40, borderRadius: 12, background: s.gradient, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } }, h(Icon, { name: p.subject, size: 22 })),
      h('span', { style: { flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' } },
        h(Overline, { color: s.ink }, s.name),
        h('span', { style: { fontSize: 16, lineHeight: '24px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, p.title)),
      p.badge ? h(Pill, { background: s.soft, color: s.deep, height: 24 }, p.live ? h('span', { className: 'tia-blink', 'aria-hidden': 'true', style: { width: 6, height: 6, borderRadius: 999, background: 'var(--red-500)' } }) : null, p.badge) : null);
  }

  /* ---------- Tuteur ---------- */
  function ChatBubble(p) {
    var tutor = p.from !== 'student';
    var bubble = h('div', { style: { maxWidth: tutor ? 256 : 280, padding: '12px 16px', background: tutor ? 'var(--surface)' : 'var(--primary)', color: tutor ? 'var(--text)' : '#fff', borderRadius: 'var(--radius-2xl)', boxShadow: tutor ? 'var(--shadow-sm)' : 'none', fontFamily: FONT, fontSize: 16, lineHeight: '24px' } }, p.children);
    if (!tutor) return h('div', { style: { display: 'flex', justifyContent: 'flex-end' } }, bubble);
    return h('div', { style: { display: 'flex', alignItems: 'flex-end', gap: 8 } },
      p.avatar === false ? h('span', { style: { width: 32, flexShrink: 0 } }) : h(Logo, { variant: 'bleu', size: 32, round: true, style: { boxShadow: 'var(--shadow-sm)', flexShrink: 0 } }),
      bubble);
  }

  function TipCard(p) {
    return h('aside', { 'aria-label': p.title || 'Conseil', style: { display: 'flex', gap: 12, padding: 16, background: 'var(--accent-soft)', borderRadius: 'var(--radius-2xl)', fontFamily: FONT, marginLeft: p.inChat ? 40 : 0 } },
      h(Veil, { icon: 'bulb', size: 32, iconSize: 18, background: 'var(--accent)' }),
      h('span', { style: { display: 'flex', flexDirection: 'column', gap: 4 } },
        h(Overline, { color: 'var(--accent)' }, p.title || 'Conseil'),
        h('span', { style: { fontSize: 14, lineHeight: '20px', color: 'var(--gray-700)' } }, p.children)));
  }

  function ChatInput(p) {
    var st = useState(p.defaultValue || '');
    var val = p.value != null ? p.value : st[0];
    function change(e) { st[1](e.target.value); if (p.onChange) p.onChange(e.target.value); }
    function send() { if (p.onSend) p.onSend(val); if (p.value == null) st[1](''); }
    return h('form', { onSubmit: function (e) { e.preventDefault(); send(); }, style: { display: 'flex', alignItems: 'center', gap: 8, margin: 0, fontFamily: FONT } },
      h('input', { type: 'text', 'aria-label': p.label || 'Ta réponse', value: val, onChange: change, placeholder: p.placeholder || 'Écris ta réponse…', style: { flexGrow: 1, height: 48, padding: '0 16px', boxSizing: 'border-box', border: '1px solid var(--border)', borderRadius: 'var(--radius-2xl)', background: 'var(--surface)', boxShadow: 'var(--shadow-sm)', fontFamily: FONT, fontSize: 16, color: 'var(--text)' } }),
      h('button', { type: 'submit', 'aria-label': 'Envoyer', style: { width: 48, height: 48, flexShrink: 0, border: 'none', borderRadius: 999, background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' } }, h(Icon, { name: 'arrowUp', size: 22, strokeWidth: 2 })));
  }

  var VOICE_LABELS = { speaking: 'Le tuteur parle…', listening: 'Le tuteur t’écoute…', muted: 'Ton micro est coupé', idle: 'En pause', writing: 'Le tuteur écrit au tableau…', explaining: 'Le tuteur t’explique le graphique…' };
  function VoiceVisualizer(p) {
    var tk = useState(0);
    var state = p.state || 'speaking';
    var active = state === 'speaking' || state === 'writing' || state === 'explaining' || state === 'listening';
    useEffect(function () {
      if (!active) return undefined;
      var id = setInterval(function () { tk[1](function (x) { return x + 1; }); }, 100);
      return function () { clearInterval(id); };
    }, [active]);
    var compact = !!p.compact;
    var w = compact ? 28 : 40, max = compact ? 72 : 150, gap = compact ? 14 : 20;
    var t = tk[0] * 0.1;
    var bars = [0, 1, 2, 3].map(function (i) {
      var hgt = w;
      if (state === 'listening') {
        hgt = w + max * 0.4 * (0.5 + 0.5 * Math.sin(t * 3.2 + i * 1.3)) * (0.6 + 0.4 * Math.sin(t * 0.9 + i));
      } else if (active) {
        var env = 0.55 + 0.45 * Math.sin(t * 1.3 + i * 0.4);
        var wave = 0.5 + 0.5 * (0.6 * Math.sin(t * 7.1 + i * 1.7) + 0.4 * Math.sin(t * 3.3 + i * 2.9));
        var pause = Math.sin(t * 0.8) > 0.92 ? 0.15 : 1;
        hgt = w + max * wave * env * pause;
      }
      return h('span', { key: i, style: { display: 'block', width: w, height: Math.round(hgt), borderRadius: 999, background: 'linear-gradient(180deg, var(--blue-500) 0%, var(--violet-500) 100%)', transition: 'height 0.14s ease-out' } });
    });
    var content = [
      h('span', { key: 'b', 'aria-hidden': 'true', style: { height: w + max, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: gap } }, bars),
      h('span', { key: 'l', style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 } },
        h('span', { 'aria-live': 'polite', style: { fontSize: 18, lineHeight: '24px', fontWeight: 500, color: 'var(--text-secondary)' } }, p.status || VOICE_LABELS[state]),
        p.hint === false ? null : h('span', { style: { fontSize: 14, lineHeight: '20px', color: 'var(--text-secondary)' } }, p.hint || "Touche l'écran pour interrompre"))
    ];
    return h('button', { type: 'button', onClick: p.onInterrupt, 'aria-label': state === 'listening' ? 'Le tuteur t’écoute' : 'Interrompre le tuteur', style: { width: '100%', border: 'none', background: 'transparent', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: compact ? 12 : 36, cursor: 'pointer', fontFamily: FONT } }, content);
  }

  function CallButton(p) {
    return h('div', { style: { width: p.big ? 80 : 64, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, paddingTop: p.big ? 0 : 8 } },
      h('button', { type: 'button', onClick: p.onClick, 'aria-pressed': p.pressed, 'aria-label': p.label, style: { width: p.big ? 72 : 56, height: p.big ? 72 : 56, border: 'none', borderRadius: 999, background: p.background, color: p.color, boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' } },
        h(Icon, { name: p.icon, size: p.big ? 28 : 24, strokeWidth: p.big ? 2.25 : 1.75 })),
      h('span', { style: { fontSize: 12, lineHeight: '16px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', fontFamily: FONT } }, p.caption));
  }
  function CallControls(p) {
    var muted = !!p.muted, cam = !!p.cameraOn;
    return h('div', { style: { display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 32 } },
      h(CallButton, { icon: muted ? 'micOff' : 'mic', label: muted ? 'Réactiver le micro' : 'Couper le micro', caption: muted ? 'Micro coupé' : 'Micro', pressed: muted, onClick: p.onToggleMute, background: muted ? 'var(--gray-900)' : 'var(--surface)', color: muted ? '#fff' : 'var(--text-secondary)' }),
      h(CallButton, { big: true, icon: 'close', label: 'Raccrocher et revenir au chat écrit', caption: 'Raccrocher', onClick: p.onHangUp, background: 'var(--error-strong)', color: '#fff' }),
      h(CallButton, { icon: cam ? 'video' : 'videoOff', label: cam ? 'Couper la caméra' : 'Activer la caméra', caption: cam ? 'Caméra activée' : 'Caméra', pressed: cam, onClick: p.onToggleCamera, background: cam ? 'var(--primary)' : 'var(--surface)', color: cam ? '#fff' : 'var(--text-secondary)' }));
  }

  /* Visuels du tuteur (v2.6, comme dans l'app) : chaque sorte de visuel a sa couleur, le dessin reste sur une feuille blanche. */
  var VISUAL_KINDS = {
    graph: { name: 'Graphique', gradient: 'linear-gradient(160deg, var(--violet-400) 0%, var(--violet-600) 100%)', soft: 'var(--violet-100)', border: 'var(--violet-200)', ink: 'var(--violet-700)', icon: 'graph', noun: 'le graphique', label: 'Graphique du tuteur' },
    whiteboard: { name: 'Tableau', gradient: 'linear-gradient(160deg, var(--azure-400) 0%, var(--azure-600) 100%)', soft: 'var(--azure-100)', border: 'var(--azure-200)', ink: 'var(--azure-700)', icon: 'pen', noun: 'le tableau', label: 'Tableau blanc du tuteur' }
  };
  function vkind(k) { return VISUAL_KINDS[k === 'whiteboard' || k === 'board' ? 'whiteboard' : 'graph']; }
  var MATH_FONT = "'Latin Modern Math', 'STIX Two Math', 'Cambria Math', 'Times New Roman', serif";
  /* Les variables d'une formule (une lettre seule) en italique, comme dans un manuel. */
  function mathText(str) {
    return String(str).split(/((?:^|(?<=[^A-Za-zÀ-ÿ]))[a-z](?![A-Za-zÀ-ÿ]))/).map(function (part, i) {
      return /^[a-z]$/.test(part) ? h('i', { key: i }, part) : part;
    });
  }

  function PanelHeader(p) {
    var k = vkind(p.kind);
    var s = p.subject ? subj(p.subject) : null;
    var open = p.open !== false;
    var collapsible = p.collapsible !== false;
    var btn = function (label, icon, onClick, extra) {
      return h('button', assign({ type: 'button', 'aria-label': label, onClick: onClick, style: { width: 44, height: 44, flexShrink: 0, border: 'none', borderRadius: 14, background: 'var(--surface)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' } }, extra),
        h(Icon, { name: icon, size: 20, strokeWidth: 2, style: icon === 'chevronUp' ? { transform: 'rotate(' + (open ? 0 : 180) + 'deg)', transition: 'transform 0.25s ease' } : null }));
    };
    var titles = [
      h('span', { key: 'tile', 'aria-hidden': 'true', style: { width: 40, height: 40, borderRadius: 12, background: k.gradient, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } }, h(Icon, { name: k.icon, size: 22 })),
      h('span', { key: 'txt', style: { flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', textAlign: 'left' } },
        h(Overline, { color: k.ink, style: { display: 'flex', alignItems: 'center', gap: 6 } }, p.live ? h('span', { className: 'tia-blink', 'aria-hidden': 'true', style: { width: 8, height: 8, borderRadius: 999, background: 'var(--red-500)' } }) : null, p.kicker || (k.name + (s ? ' · ' + s.name : ''))),
        h('span', { style: { fontSize: 16, lineHeight: '22px', fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, p.title))
    ];
    // Tout le bandeau ouvre ou replie le panneau (le chevron n'est qu'un repère visuel).
    var band = p.onToggle
      ? h('button', { type: 'button', onClick: p.onToggle, 'aria-expanded': open, 'aria-label': (open ? 'Réduire ' : 'Afficher ') + k.noun + (p.title ? ' : ' + p.title : ''), style: { flexGrow: 1, minWidth: 0, minHeight: 48, display: 'flex', alignItems: 'center', gap: 12, padding: 0, border: 'none', background: 'transparent', color: 'inherit', cursor: 'pointer', fontFamily: FONT } }, titles)
      : h('div', { style: { flexGrow: 1, minWidth: 0, minHeight: 48, display: 'flex', alignItems: 'center', gap: 12 } }, titles);
    return h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, fontFamily: FONT } },
      band,
      p.expandable === false ? null : btn('Agrandir ' + k.noun, 'expand', p.onExpand),
      collapsible ? btn((open ? 'Réduire ' : 'Afficher ') + k.noun, 'chevronUp', p.onToggle, { 'aria-hidden': 'true', tabIndex: -1 }) : null);
  }

  function VisualPanel(p) {
    var k = vkind(p.kind);
    var st = useState(p.defaultOpen !== false);
    var collapsible = p.collapsible !== false;
    var open = collapsible ? (p.open != null ? p.open : st[0]) : true;
    function toggle() { if (p.onToggle) p.onToggle(!open); if (p.open == null) st[1](!open); }
    return h('section', { 'aria-label': k.label, style: { boxSizing: 'border-box', background: k.soft, border: '2px solid ' + k.border, borderRadius: 'var(--radius-3xl)', boxShadow: p.elevated ? '0 16px 36px rgba(3,39,110,0.35)' : 'var(--shadow-md)', padding: 12, display: 'flex', flexDirection: 'column', gap: 10, fontFamily: FONT } },
      h(PanelHeader, { kind: p.kind, subject: p.subject, kicker: p.kicker, title: p.title, live: p.live, open: open, collapsible: collapsible, onToggle: collapsible ? toggle : undefined, onExpand: p.onExpand, expandable: p.expandable }),
      open ? h('div', { style: { background: 'var(--surface)', borderRadius: 'var(--radius-2xl)', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 } }, p.children, p.footer || null) : null);
  }

  function MathGraph(p) {
    var W = 318, H = 210, L = 30, R = 310, T = 10, B = 190;
    var xr = p.xRange || [-1, 7], yr = p.yRange || [0, 28];
    var X = function (x) { return L + (x - xr[0]) / (xr[1] - xr[0]) * (R - L); };
    var Y = function (y) { return B - (y - yr[0]) / (yr[1] - yr[0]) * (B - T); };
    var s = subj(p.subject);
    var focus = p.focus;
    var els = [];
    var xs = [], ys = [];
    for (var gx = Math.ceil(xr[0]); gx <= xr[1]; gx++) xs.push(gx);
    var ystep = p.yStep || 5;
    for (var gy = Math.ceil(yr[0] / ystep) * ystep; gy <= yr[1]; gy += ystep) ys.push(gy);
    var x0 = X(Math.max(xr[0], 0)), y0 = Y(Math.max(yr[0], 0));
    xs.forEach(function (x) { els.push(h('line', { key: 'gx' + x, x1: X(x), y1: T, x2: X(x), y2: B, stroke: 'var(--gray-200)', opacity: 0.7 })); });
    ys.forEach(function (y) { els.push(h('line', { key: 'gy' + y, x1: L, y1: Y(y), x2: R, y2: Y(y), stroke: 'var(--gray-200)', opacity: 0.7 })); });
    els.push(h('line', { key: 'ax', x1: L, y1: y0, x2: R + 4, y2: y0, stroke: 'var(--gray-400)', strokeWidth: 1.5 }));
    els.push(h('line', { key: 'ay', x1: x0, y1: B + 4, x2: x0, y2: T - 2, stroke: 'var(--gray-400)', strokeWidth: 1.5 }));
    var keyX = (p.points || []).filter(function (pt) { return pt.key; }).map(function (pt) { return pt.x; });
    xs.forEach(function (x) { if (x > 0) els.push(h('text', { key: 'tx' + x, x: X(x), y: 205, textAnchor: 'middle', fontSize: 11, fontWeight: keyX.indexOf(x) >= 0 ? 700 : 400, fill: keyX.indexOf(x) >= 0 ? s.ink : 'var(--text-secondary)' }, x)); });
    ys.forEach(function (y) { els.push(h('text', { key: 'ty' + y, x: x0 - 7, y: Y(y) + 4, textAnchor: 'end', fontSize: 11, fill: 'var(--text-secondary)' }, y)); });
    var colorOf = function (ln, i) { return ln.color || (i === 0 ? s.bar : 'var(--primary)'); };
    (p.lines || []).forEach(function (ln, i) {
      var color = colorOf(ln, i), on = focus === i;
      var a = ln.from != null ? ln.from : xr[0], z = ln.to != null ? ln.to : xr[1];
      var seg = { x1: X(a), y1: Y(ln.m * a + ln.b), x2: X(z), y2: Y(ln.m * z + ln.b) };
      // Courbe nommée par le tuteur : un halo de sa couleur et un trait plus épais.
      els.push(h('line', assign({ key: 'lg' + i, stroke: color, strokeWidth: 13, strokeLinecap: 'round', strokeOpacity: 0.16, opacity: on ? 1 : 0, style: { transition: 'opacity 0.3s ease' } }, seg)));
      els.push(h('line', assign({ key: 'l' + i, stroke: color, strokeWidth: (ln.dashed ? 2.5 : 3) + (on ? 2 : 0), strokeDasharray: ln.dashed ? '7 5' : undefined, strokeLinecap: 'round', style: { transition: 'stroke-width 0.3s ease' } }, seg)));
    });
    (p.points || []).forEach(function (pt, i) {
      var right = pt.labelSide !== 'left';
      if (pt.guide) els.push(h('line', { key: 'g' + i, x1: X(pt.x), y1: Y(pt.y), x2: X(pt.x), y2: y0, stroke: s.ink, strokeWidth: 1.5, strokeDasharray: '4 4', opacity: 0.6 }));
      if (pt.pulse || (pt.key && focus === 'point')) els.push(h('circle', { key: 'h' + i, className: 'tia-halo', cx: X(pt.x), cy: Y(pt.y), r: 8, fill: s.bar }));
      els.push(h('circle', { key: 'p' + i, cx: X(pt.x), cy: Y(pt.y), r: pt.key ? 6.5 : 4, fill: pt.key ? '#fff' : s.bar, stroke: pt.key ? s.ink : 'none', strokeWidth: 3 }));
      if (pt.label) {
        var lw = Math.max(44, 12 + String(pt.label).length * 7);
        els.push(h('rect', { key: 'r' + i, x: right ? X(pt.x) + 10 : X(pt.x) - 10 - lw, y: Y(pt.y) + 8, width: lw, height: 22, rx: 11, fill: s.ink }));
        els.push(h('text', { key: 't' + i, x: right ? X(pt.x) + 10 + lw / 2 : X(pt.x) - 10 - lw / 2, y: Y(pt.y) + 23, textAnchor: 'middle', fontSize: 12, fontWeight: 700, fill: '#fff' }, pt.label));
      }
    });
    var chip = function (key, on, color, swatch, label) {
      return h('span', { key: key, style: { display: 'flex', alignItems: 'center', gap: 6, height: 26, padding: '0 10px', borderRadius: 999, background: on ? 'color-mix(in srgb, ' + color + ' 14%, transparent)' : 'transparent', color: color, fontWeight: 700, transition: 'background 0.3s ease' } }, swatch, label);
    };
    var legend = (p.lines || []).filter(function (ln) { return ln.label; }).map(function (ln) {
      var i = p.lines.indexOf(ln), color = colorOf(ln, i);
      return chip(i, focus === i, color, h('span', { 'aria-hidden': 'true', style: { width: 16, height: 0, borderTop: '3px ' + (ln.dashed ? 'dashed ' : 'solid ') + color } }), ln.label);
    });
    if (p.pointLegend) legend.push(chip('pt', focus === 'point', s.ink, h('span', { 'aria-hidden': 'true', style: { width: 10, height: 10, boxSizing: 'border-box', borderRadius: 999, border: '2.5px solid ' + s.ink, background: '#fff' } }), p.pointLegend));
    return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8, fontFamily: FONT } },
      h('svg', { width: '100%', viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': p.description || 'Graphique', style: { display: 'block', fontFamily: FONT } }, els),
      legend.length ? h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6, fontSize: 12, lineHeight: '16px' } }, legend) : null);
  }

  function Whiteboard(p) {
    var steps = p.steps || [];
    var total = steps.length + (p.result ? 1 : 0);
    var shown = p.progress != null ? p.progress : total;
    var last = Math.min(shown, total) - 1;
    var pen = function (i) { return p.writing && i === last ? h('span', { className: 'tia-pen', 'aria-hidden': 'true' }) : null; };
    var mathStyle = { fontFamily: MATH_FONT, fontSize: 24, lineHeight: 1.25, color: 'var(--text)', whiteSpace: 'nowrap' };
    var n = 0;
    var note = function (txt, color) { var mark = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧'][n++] || '•'; return h('span', { style: { flexShrink: 0, width: 118, fontSize: 12, lineHeight: '16px', fontWeight: 700, color: color || 'var(--text)' } }, mark + ' ' + txt); };
    var fade = function (vis) { return { opacity: vis ? 1 : 0, transition: 'opacity 0.45s ease' }; };
    var rows = [];
    steps.forEach(function (st, i) {
      var vis = i < shown;
      if (st.op && i > 0) rows.push(h('div', { key: 'o' + i, style: assign({ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 12, minHeight: 24, color: 'var(--primary)' }, fade(vis)) },
        h('span', { style: { fontSize: 12, fontWeight: 700 } }, '↓'), h('span', { style: { fontFamily: MATH_FONT, fontSize: 17, whiteSpace: 'nowrap' } }, mathText(st.op))));
      rows.push(h('div', { key: 'r' + i, style: assign({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, minHeight: 36 }, fade(vis)) },
        h('span', { style: { display: 'flex', alignItems: 'center', gap: 8 } }, h('span', { style: mathStyle }, mathText(st.expr)), pen(i)),
        st.note ? note(st.note) : null));
    });
    if (p.result) {
      var rvis = shown > steps.length;
      var ring = rvis && p.circled !== false;
      rows.push(h('div', { key: 'res', style: assign({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, minHeight: 40, marginTop: 4 }, fade(rvis)) },
        h('span', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
          h('span', { style: assign({}, mathStyle, { padding: '0 14px', borderRadius: 999, border: '2.5px solid ' + (ring ? 'var(--red-500)' : 'transparent'), color: 'var(--red-500)', transition: 'border-color 0.6s ease' }) }, mathText(p.result)), pen(steps.length)),
        note(p.resultNote || 'Solution', 'var(--red-600)')));
    }
    return h('div', { role: 'img', 'aria-label': p.description || 'Tableau blanc', style: { position: 'relative', display: 'flex', flexDirection: 'column', gap: 2, fontFamily: FONT, color: 'var(--text)' } }, rows);
  }

  /* ---------- Appel vocal (v2.6) ---------- */
  var GLASS = 'rgba(255,255,255,0.16)';
  var TONE_WORDS = [[/^rouges?/i, 'var(--red-500)'], [/^bleue?s?/i, 'var(--blue-500)'], [/^verte?s?/i, 'var(--green-600)'], [/^orange/i, 'var(--orange-500)'], [/^violette?s?/i, 'var(--violet-500)'], [/^grise?s?/i, 'var(--gray-500)']];

  function CallTopBar(p) {
    return h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 44, fontFamily: FONT, color: '#fff' } },
      h('button', { type: 'button', onClick: p.onWritten, 'aria-label': "Passer à l'écrit", style: { display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 16px 0 12px', border: 'none', borderRadius: 999, background: GLASS, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: FONT } }, h(Icon, { name: 'keyboard', size: 20 }), 'Écrit'),
      h('span', { 'aria-label': "Durée de l'appel " + (p.elapsed || '00:00'), style: { display: 'flex', alignItems: 'center', gap: 8, height: 32, padding: '0 12px', borderRadius: 999, background: GLASS, fontSize: 14, fontWeight: 700, fontVariantNumeric: 'tabular-nums' } },
        h('span', { className: p.live === false ? undefined : 'tia-blink', 'aria-hidden': 'true', style: { width: 8, height: 8, borderRadius: 999, background: '#fff' } }), p.elapsed || '00:00'));
  }

  /* Le logo du tuteur : il rebondit quand il parle (au niveau de sa voix), penche la tête quand il écoute. */
  function VoiceAvatar(p) {
    var size = p.size || 148;
    var hopPx = size >= 120 ? 18 : 14;
    var state = p.state || 'speaking';
    var speaking = state === 'speaking';
    var simulate = speaking && p.level == null;
    var tk = useState(0);
    useEffect(function () {
      if (!simulate) return undefined;
      var id = setInterval(function () { tk[1](function (x) { return x + 1; }); }, 100);
      return function () { clearInterval(id); };
    }, [simulate]);
    var t = tk[0] * 0.1;
    var level = speaking ? (p.level != null ? p.level : 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 2.4)) * (0.6 + 0.4 * Math.sin(t * 0.9))) : 0;
    var timer = React.useRef(null), longFired = React.useRef(false);
    function down() { if (!p.onLongPress) return; longFired.current = false; timer.current = setTimeout(function () { longFired.current = true; p.onLongPress(); }, 600); }
    function up() { if (timer.current) { clearTimeout(timer.current); timer.current = null; } }
    function click() { if (longFired.current) { longFired.current = false; return; } if (speaking && p.onInterrupt) p.onInterrupt(); }
    var img = Math.round(size * 0.82);
    return h('div', { className: 'tia-voice', style: { position: 'relative', width: size + 48, height: hopPx + size + 18, '--tia-h': String(Math.round(Math.max(0, Math.min(1, level)) * 100) / 100), '--tia-tilt': state === 'listening' ? '1' : '0', '--tia-hop': hopPx + 'px' } },
      h('span', { 'aria-hidden': 'true', style: { position: 'absolute', left: '50%', top: hopPx + size / 2, width: Math.round(size * 1.9), height: Math.round(size * 1.9), transform: 'translate(-50%, -50%)', borderRadius: 999, background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0) 70%)', pointerEvents: 'none' } }),
      h('span', { 'aria-hidden': 'true', style: { position: 'absolute', left: '50%', top: hopPx + size + 2, width: Math.round(size * 0.82), height: 14, marginLeft: -Math.round(size * 0.41) } },
        h('span', { className: 'tia-voice-shadow', style: { display: 'block', width: '100%', height: 14, borderRadius: '50%', background: 'radial-gradient(ellipse at center, rgba(2,22,66,0.55) 0%, rgba(2,22,66,0.25) 45%, rgba(2,22,66,0) 72%)' } })),
      h('div', { style: { position: 'absolute', left: '50%', top: hopPx, width: size, height: size, marginLeft: -size / 2 } },
        h('div', { className: 'tia-voice-hop', style: { width: size, height: size } },
          h('div', { className: 'tia-voice-tilt', style: { width: size, height: size } },
            h('button', { type: 'button', className: 'tia-voice-breathe', onClick: click, onPointerDown: down, onPointerUp: up, onPointerLeave: up, 'aria-label': p.label || (speaking ? 'Interrompre Tutor’IA' : 'Tutor’IA t’écoute'), style: { width: size, height: size, padding: 0, border: 'none', borderRadius: 999, overflow: 'hidden', background: '#fff', boxShadow: '0 12px 28px rgba(3,39,110,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' } },
              h('img', { src: LOGO_WHITE, alt: '', width: img, height: img, style: { display: 'block', width: img, height: img } }))))));
  }

  var VOICE_PILLS = {
    speaking: { label: 'Je t’explique…', icon: 'volume', bg: 'linear-gradient(160deg, var(--green-600) 0%, var(--green-700) 45%, var(--green-800) 100%)', glow: 'rgba(3,112,43,0.45)' },
    listening: { label: 'Je t’écoute…', icon: 'mic', bg: 'linear-gradient(160deg, var(--red-400) 0%, var(--red-600) 60%, var(--red-700) 100%)', glow: 'rgba(152,11,11,0.45)' },
    listeningOrange: { label: 'Je t’écoute…', icon: 'mic', bg: 'linear-gradient(160deg, var(--orange-400) 0%, var(--orange-600) 50%, var(--orange-700) 100%)', glow: 'rgba(163,100,13,0.45)' },
    muted: { label: 'Ton micro est coupé', icon: 'micOff', bg: GLASS },
    connecting: { label: 'Connexion…', icon: 'more', bg: GLASS },
    ended: { label: 'Appel terminé', icon: 'hangup', bg: GLASS },
    error: { label: 'Connexion perdue', icon: 'warning', bg: GLASS }
  };
  function VoiceStatus(p) {
    var state = p.state || 'speaking';
    var c = VOICE_PILLS[state === 'listening' && p.listenColor === 'orange' ? 'listeningOrange' : state] || VOICE_PILLS.speaking;
    var sm = p.size === 'sm';
    return h('span', { 'aria-live': 'polite', style: { display: 'inline-flex', alignItems: 'center', gap: 8, height: sm ? 32 : 40, padding: sm ? '0 14px 0 10px' : '0 18px 0 14px', boxSizing: 'border-box', borderRadius: 999, background: c.bg, boxShadow: c.glow ? '0 6px 18px ' + c.glow + ', inset 0 0 0 1.5px rgba(255,255,255,0.28)' : 'none', color: '#fff', fontFamily: FONT, fontSize: sm ? 13 : 15, fontWeight: 700, whiteSpace: 'nowrap', transition: 'box-shadow 0.3s ease' } },
      h(Icon, { name: c.icon, size: sm ? 16 : 18, strokeWidth: 2, style: c.icon === 'hangup' ? { transform: 'rotate(135deg)' } : null }), p.label || c.label);
  }

  /* Sous-titres en direct : mot à mot, les couleurs nommées par le tuteur dans une pastille de leur couleur. */
  function LiveCaptions(p) {
    var words = String(p.text || '').split(/ +/).filter(Boolean);
    var spoken = p.spoken != null ? p.spoken : words.length;
    var light = p.surface === 'light';
    var on = light ? 'var(--text)' : '#fff', off = light ? 'var(--gray-300)' : 'rgba(255,255,255,0.45)';
    var big = p.size !== 'md';
    var kids = [];
    words.forEach(function (w, i) {
      var said = i < spoken;
      var tone = null;
      if (p.colorWords !== false) TONE_WORDS.forEach(function (tw) { if (!tone && tw[0].test(w)) tone = tw[1]; });
      var core = tone ? w.replace(/[,.;:!?…]+$/, '') : w;
      kids.push(h('span', { key: i, style: { color: tone && said ? '#fff' : (said ? on : off), fontWeight: /[0-9=÷×+−]/.test(w) || tone ? 700 : 500, background: tone && said ? tone : 'transparent', padding: tone ? '0 6px' : 0, borderRadius: 6, transition: 'color 0.2s ease, background 0.2s ease' } }, core));
      kids.push(h('span', { key: 's' + i, style: { color: said ? on : off } }, w.slice(core.length) + ' '));
    });
    var left = p.align === 'left';
    var lh = big ? 30 : 22;
    return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: left ? 'flex-start' : 'center', gap: big ? 8 : 4, textAlign: left ? 'left' : 'center', fontFamily: FONT } },
      p.showSpeaker ? h('span', { style: { fontSize: 12, lineHeight: '16px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: light ? (p.speaker === 'student' ? 'var(--text-secondary)' : 'var(--primary)') : 'rgba(255,255,255,0.8)' } }, p.speaker === 'student' ? 'Toi' : 'Tutor’IA') : null,
      h('p', { style: { margin: 0, fontSize: big ? 20 : 16, lineHeight: lh + 'px', textWrap: 'pretty', maxHeight: p.maxLines ? lh * p.maxLines : undefined, overflow: 'hidden' } }, kids.length ? kids : (p.placeholder || null)));
  }

  function DockButton(p) {
    return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 } },
      h('button', { type: 'button', onClick: p.onClick, 'aria-pressed': p.pressed, 'aria-label': p.label, style: { width: p.big ? 64 : 56, height: p.big ? 64 : 56, margin: p.big ? 0 : '4px 0', border: 'none', borderRadius: 999, background: p.background, color: p.color, boxShadow: p.big ? '0 8px 20px rgba(194,26,26,0.35)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' } },
        h(Icon, { name: p.icon, size: p.big ? 28 : 24, style: p.rotate ? { transform: 'rotate(' + p.rotate + 'deg)' } : null })),
      h('span', { style: { fontSize: 12, lineHeight: '16px', fontWeight: 500, color: 'rgba(255,255,255,0.9)', whiteSpace: 'nowrap', fontFamily: FONT } }, p.caption));
  }
  function CallDock(p) {
    var muted = !!p.muted, cc = p.captionsOn !== false, cam = !!p.cameraOn, camVisible = p.cameraVisible !== false;
    return h('div', { role: 'group', 'aria-label': "Commandes de l'appel", style: { boxSizing: 'border-box', display: 'grid', gridTemplateColumns: 'repeat(' + (camVisible ? 4 : 3) + ', minmax(0, 1fr))', gap: 4, padding: '14px 8px 12px', borderRadius: 32, background: 'rgba(255,255,255,0.10)', fontFamily: FONT } },
      h(DockButton, { icon: muted ? 'micOff' : 'mic', label: muted ? 'Réactiver le micro' : 'Couper le micro', caption: muted ? 'Micro coupé' : 'Micro', pressed: muted, onClick: p.onToggleMute, background: muted ? '#fff' : GLASS, color: muted ? 'var(--blue-700)' : '#fff' }),
      h(DockButton, { icon: 'captions', label: cc ? 'Masquer les sous-titres' : 'Afficher les sous-titres', caption: 'Sous-titres', pressed: cc, onClick: p.onToggleCaptions, background: cc ? '#fff' : GLASS, color: cc ? 'var(--blue-600)' : '#fff' }),
      camVisible ? h(DockButton, { icon: cam ? 'video' : 'videoOff', label: cam ? 'Photo de l’exercice en cours' : 'Montrer mon exercice', caption: 'Caméra', pressed: cam, onClick: p.onCamera, background: cam ? '#fff' : GLASS, color: cam ? 'var(--blue-600)' : '#fff' }) : null,
      h(DockButton, { big: true, icon: 'hangup', rotate: 135, label: 'Raccrocher et revenir au chat écrit', caption: 'Raccrocher', onClick: p.onHangUp, background: 'var(--red-500)', color: '#fff' }));
  }

  /* ---------- Flashcards ---------- */
  function DailyReviewCard(p) {
    var list = (p.subjects || []).slice(0, 3);
    return h(Card, { style: { padding: 24, display: 'flex', flexDirection: 'column', gap: 16 } },
      h('span', { 'aria-hidden': 'true', style: { position: 'absolute', right: -40, top: -40, width: 140, height: 140, borderRadius: 999, background: 'var(--orange-100)' } }),
      h('div', { style: { position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 } },
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: 4 } },
          h('span', { style: { fontSize: 22, lineHeight: '30px', fontWeight: 700 } }, p.title || 'Révision du jour'),
          h('span', { style: { fontSize: 14, lineHeight: '20px', color: 'var(--text-secondary)' } }, p.count + ' cartes à revoir · ~' + p.minutes + ' min')),
        p.streak != null ? h(Pill, { background: 'var(--orange-500)', color: '#fff', height: 28 }, h(Icon, { name: 'flame', size: 16, color: '#fff' }), p.streak) : null),
      h('div', { style: { position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
        h('div', { style: { display: 'flex', alignItems: 'center' } },
          list.map(function (id, i) { return h('span', { key: id, style: { marginLeft: i ? -10 : 0, width: 36, height: 36, boxSizing: 'border-box', borderRadius: 999, border: '2px solid #fff', background: subj(id).gradient, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, h(Icon, { name: id, size: 16, strokeWidth: 2 })); }),
          p.extra ? h('span', { style: { marginLeft: -10, width: 36, height: 36, boxSizing: 'border-box', borderRadius: 999, border: '2px solid #fff', background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 } }, '+' + p.extra) : null),
        h(Button, { variant: 'vivid', brand: true, size: 'sm', iconRight: 'arrowRight', onClick: p.onStart, href: p.href }, p.actionLabel || "C'est parti")));
  }

  function ChapterRow(p) {
    var s = subj(p.subject);
    var sel = !!p.selected;
    return h('button', { type: 'button', onClick: p.onClick, 'aria-pressed': sel, style: { width: '100%', display: 'flex', alignItems: 'center', gap: 12, minHeight: 68, padding: '12px 16px', boxSizing: 'border-box', borderRadius: 'var(--radius-2xl)', border: '2px solid ' + (sel ? s.ink : '#fff'), background: 'var(--surface)', boxShadow: 'var(--shadow-md)', textAlign: 'left', color: 'var(--text)', fontFamily: FONT, cursor: 'pointer' } },
      h('span', { style: { width: 40, height: 40, flexShrink: 0, borderRadius: 'var(--radius-2xl)', background: s.soft, color: s.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 } }, String(p.index).padStart(2, '0')),
      h('span', { style: { flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 } },
        h('span', { style: { fontSize: 16, lineHeight: '24px', fontWeight: 700 } }, p.title),
        h('span', { style: { fontSize: 14, lineHeight: '20px', color: 'var(--text-secondary)' } }, p.cards + ' cartes · ~' + p.minutes + ' min')),
      h('span', { 'aria-hidden': 'true', style: { width: 24, height: 24, flexShrink: 0, boxSizing: 'border-box', borderRadius: 999, border: sel ? '7px solid ' + s.ink : '2px solid var(--gray-400)', background: 'var(--surface)' } }));
  }

  function SessionProgress(p) {
    var s = subj(p.subject);
    var pct = Math.round(100 * (p.value || 0) / (p.total || 1));
    return h('div', { role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': p.total, 'aria-valuenow': p.value, 'aria-label': 'Progression de la session', style: { height: 8, borderRadius: 999, background: s.soft, overflow: 'hidden' } },
      h('div', { style: { width: pct + '%', height: '100%', borderRadius: 999, background: s.gradient, transition: 'width 0.4s ease' } }));
  }

  function AnswerOption(p) {
    var st = p.state || 'default';
    var map = {
      default: { bg: 'var(--bg)', border: 'var(--bg)', color: 'var(--text)', letter: 'var(--gray-400)' },
      correct: { bg: 'var(--success-soft)', border: 'var(--success)', color: 'var(--success-strong)', letter: 'var(--success-strong)' },
      wrong: { bg: 'var(--warning-soft)', border: 'var(--warning)', color: 'var(--warning-strong)', letter: 'var(--warning-strong)' },
      dimmed: { bg: 'var(--bg)', border: 'var(--bg)', color: 'var(--text)', letter: 'var(--gray-400)' }
    }[st];
    return h('button', { type: 'button', onClick: p.onClick, disabled: p.disabled, 'aria-pressed': st === 'wrong' || (st === 'correct' && p.chosen), style: { position: 'relative', minHeight: 88, padding: 12, boxSizing: 'border-box', border: '2px solid ' + map.border, borderRadius: 'var(--radius-2xl)', background: map.bg, color: map.color, opacity: st === 'dimmed' ? 0.45 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: FONT, fontSize: 18, lineHeight: '24px', fontWeight: 700, cursor: p.disabled ? 'default' : 'pointer', transition: 'background 0.2s ease, border-color 0.2s ease, opacity 0.2s ease' } },
      h('span', { style: { position: 'absolute', top: 8, left: 10, fontSize: 12, lineHeight: '16px', fontWeight: 700, color: map.letter } }, p.letter),
      p.children,
      st === 'correct' ? h('span', { 'aria-hidden': 'true', style: { position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: 999, background: 'var(--success)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, h(Icon, { name: 'check', size: 14, strokeWidth: 3 })) : null);
  }

  function QuizCard(p) {
    var s = subj(p.subject);
    var st = useState(null);
    var picked = p.picked !== undefined ? p.picked : st[0];
    var answered = picked !== null && picked !== undefined;
    var right = answered && picked === p.answer;
    function pick(i) { if (answered) return; if (p.picked === undefined) st[1](i); if (p.onAnswer) p.onAnswer(i, i === p.answer); }
    var fb = !answered ? { bg: 'var(--bg)', color: 'var(--text-secondary)', text: p.hint || 'Choisis la bonne réponse parmi les 4 propositions.' }
      : right ? { bg: 'var(--success-soft)', color: 'var(--success-strong)', text: 'Bien joué ! ' + (p.explanation || '') + ' Carte rangée dans « Je sais ».' }
      : { bg: 'var(--warning-soft)', color: 'var(--warning-strong)', text: 'Pas tout à fait : c’était ' + p.options[p.answer] + '. ' + (p.explanation || '') + ' On la revoit demain.' };
    return h('section', { 'aria-label': 'Question', style: { overflow: 'hidden', background: 'var(--surface)', borderRadius: 'var(--radius-3xl)', boxShadow: 'var(--shadow-lg)', fontFamily: FONT, color: 'var(--text)' } },
      h('div', { 'aria-hidden': 'true', style: { height: 8, background: s.gradient } }),
      h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 24 } },
        h('span', { style: { width: 48, height: 48, borderRadius: 999, background: s.soft, color: s.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' } }, h(Icon, { name: p.subject || 'maths' })),
        h('h2', { style: { margin: 0, minHeight: 64, display: 'flex', alignItems: 'center', textAlign: 'center', fontSize: 24, lineHeight: '32px', fontWeight: 900 } }, p.question),
        h('div', { role: 'group', 'aria-label': 'Choisis ta réponse', style: { width: '100%', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 } },
          (p.options || []).map(function (o, i) {
            var state = !answered ? 'default' : (i === p.answer ? 'correct' : (i === picked ? 'wrong' : 'dimmed'));
            return h(AnswerOption, { key: i, letter: 'ABCD'.charAt(i), state: state, chosen: i === picked, disabled: answered, onClick: function () { pick(i); } }, o);
          })),
        h('div', { 'aria-live': 'polite', style: { width: '100%', boxSizing: 'border-box', minHeight: 48, padding: '12px 16px', borderRadius: 'var(--radius-2xl)', background: fb.bg, color: fb.color, fontSize: 14, lineHeight: '20px', fontWeight: 500 } }, fb.text)));
  }

  function TallyChips(p) {
    return h('div', { style: { display: 'flex', justifyContent: 'center', gap: 8, fontFamily: FONT } },
      h(Pill, { background: 'var(--success-soft)', color: 'var(--success-strong)', height: 28 }, 'Je sais · ' + (p.known || 0)),
      h(Pill, { background: 'var(--warning-soft)', color: 'var(--warning-strong)', height: 28 }, 'À revoir · ' + (p.review || 0)));
  }

  /* ---------- Stats ---------- */
  function KpiCard(p) {
    var tone = p.tone || 'blue';
    return h(Card, { style: { background: TONES[tone] || TONES.blue, color: '#fff', padding: p.compact ? '16px 12px' : 16, display: 'flex', flexDirection: 'column', gap: 8 } },
      p.icon ? h(Watermark, { name: p.icon, style: { right: -22, bottom: -22 }, opacity: tone === 'orange' ? 0.22 : 0.16 }) : null,
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
        p.icon ? h(Veil, { icon: p.icon, size: 32, iconSize: 18, background: tone === 'orange' ? '#fff' : VEIL, color: tone === 'orange' ? 'var(--orange-500)' : '#fff' }) : null,
        p.compact ? null : h('span', { style: { fontSize: 12, lineHeight: '16px', fontWeight: 500 } }, p.label)),
      h('span', { style: { fontSize: p.compact ? 22 : 28, lineHeight: p.compact ? '28px' : '36px', fontWeight: 900, whiteSpace: 'nowrap' } }, p.value),
      p.compact ? h('span', { style: { fontSize: 12, lineHeight: '16px', fontWeight: 500 } }, p.label) : null,
      p.delta ? h('span', { style: { alignSelf: 'flex-start', padding: '2px 8px', borderRadius: 999, background: VEIL, fontSize: 12, lineHeight: '16px', fontWeight: 700 } }, p.delta) : null);
  }

  function BarChart(p) {
    var data = p.data || [];
    var height = p.height || 140;
    var max = p.max || Math.max.apply(null, data.map(function (d) { return d.value; }).concat([1]));
    var goal = p.goal;
    return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8, fontFamily: FONT } },
      h('div', { style: { position: 'relative', height: height } },
        goal != null ? h('div', { 'aria-hidden': 'true', style: { position: 'absolute', left: 0, right: 0, top: height - goal / max * height, borderTop: '1.5px dashed var(--gray-300)' } }) : null,
        h('div', { style: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', gap: 12 } },
          data.map(function (d, i) {
            var low = goal != null && d.value < goal;
            return h('div', { key: i, title: d.tip || String(d.value), style: { flex: '1 1 0', height: Math.max(6, Math.round(d.value / max * height)), borderRadius: '8px 8px 3px 3px', background: d.value === 0 ? 'var(--gray-200)' : (low ? 'var(--blue-200)' : 'linear-gradient(180deg, var(--violet-500) 0%, var(--blue-500) 100%)') } });
          }))),
      h('div', { style: { display: 'flex', gap: 12 } }, data.map(function (d, i) { return h('span', { key: i, style: { flex: '1 1 0', textAlign: 'center', fontSize: 12, lineHeight: '16px', fontWeight: 500, color: 'var(--text-secondary)' } }, d.label); })));
  }

  function LineChart(p) {
    var vals = p.values || [];
    var W = 318, H = 160, L = 40, R = 306, T = 10, B = 130;
    var lo = p.min != null ? p.min : 40, hi = p.max != null ? p.max : 80;
    var X = function (i) { return L + i * (R - L) / Math.max(1, vals.length - 1); };
    var Y = function (v) { return B - (v - lo) / (hi - lo) * (B - T); };
    var pts = vals.map(function (v, i) { return X(i) + ',' + Y(v); }).join(' ');
    var onColor = p.onColor !== false;
    var ink = onColor ? '#fff' : 'var(--primary)';
    var els = [
      h('defs', { key: 'd' }, h('linearGradient', { id: onColor ? 'tia-area-on' : 'tia-area', x1: 0, y1: 0, x2: 0, y2: 1 }, h('stop', { offset: 0, stopColor: onColor ? '#fff' : '#2e6be6', stopOpacity: 0.35 }), h('stop', { offset: 1, stopColor: onColor ? '#fff' : '#2e6be6', stopOpacity: 0 })))
    ];
    [hi, (hi + lo) / 2, lo].forEach(function (v, i) {
      els.push(h('line', { key: 'g' + i, x1: L, y1: Y(v), x2: W, y2: Y(v), stroke: onColor ? 'rgba(255,255,255,0.3)' : 'var(--gray-200)', strokeDasharray: i === 2 ? undefined : '3 3' }));
      els.push(h('text', { key: 't' + i, x: 0, y: Y(v) + 4, fontSize: 12, fill: onColor ? 'rgba(255,255,255,0.85)' : 'var(--gray-500)' }, v + ' %'));
    });
    if (vals.length) {
      els.push(h('polygon', { key: 'a', points: pts + ' ' + X(vals.length - 1) + ',' + B + ' ' + L + ',' + B, fill: onColor ? 'url(#tia-area-on)' : 'url(#tia-area)' }));
      els.push(h('polyline', { key: 'l', points: pts, fill: 'none', stroke: ink, strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' }));
      vals.forEach(function (v, i) { if (i < vals.length - 1) els.push(h('circle', { key: 'c' + i, cx: X(i), cy: Y(v), r: 3, fill: ink })); });
      els.push(h('circle', { key: 'last', cx: X(vals.length - 1), cy: Y(vals[vals.length - 1]), r: 7, fill: 'var(--green-500)', stroke: '#fff', strokeWidth: 3 }));
    }
    (p.labels || []).forEach(function (lb, i) { if (lb) els.push(h('text', { key: 'x' + i, x: X(i), y: 152, textAnchor: 'middle', fontSize: 12, fill: onColor ? 'rgba(255,255,255,0.85)' : 'var(--gray-500)' }, lb)); });
    return h('svg', { width: '100%', viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': p.description || 'Évolution', style: { display: 'block', fontFamily: FONT } }, els);
  }

  var HEAT = ['var(--blue-100)', 'var(--blue-200)', 'var(--blue-300)', 'var(--blue-500)', 'var(--blue-700)'];
  function Heatmap(p) {
    var weeks = p.weeks || [];
    var days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8, fontFamily: FONT } },
      h('div', { style: { display: 'flex', gap: 8 } },
        h('div', { style: { width: 16, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, lineHeight: '18px', color: 'var(--text-secondary)' } }, days.map(function (d, i) { return h('span', { key: i }, d); })),
        h('div', { style: { display: 'flex', gap: 4 } }, weeks.map(function (w, i) {
          return h('div', { key: i, style: { display: 'flex', flexDirection: 'column', gap: 4 } }, w.map(function (lvl, j) { return h('span', { key: j, style: { display: 'block', width: 18, height: 18, borderRadius: 4, background: HEAT[Math.max(0, Math.min(4, lvl))] } }); }));
        }))),
      h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, fontSize: 12, color: 'var(--text-secondary)' } },
        h('span', { style: { marginRight: 4 } }, 'Moins'), HEAT.map(function (c, i) { return h('span', { key: i, style: { width: 12, height: 12, borderRadius: 3, background: c } }); }), h('span', { style: { marginLeft: 4 } }, 'Plus')));
  }

  function SubjectProgressRow(p) {
    var s = subj(p.subject);
    return h('div', { style: { display: 'flex', alignItems: 'center', gap: 12, fontFamily: FONT, color: 'var(--text)' } },
      h('span', { style: { width: 36, height: 36, flexShrink: 0, borderRadius: 12, background: s.soft, color: s.bar, display: 'flex', alignItems: 'center', justifyContent: 'center' } }, h(Icon, { name: p.subject, size: 20, strokeWidth: 2 })),
      h('span', { style: { width: 104, fontSize: 14, lineHeight: '20px', fontWeight: 500 } }, s.name),
      h('div', { style: { flexGrow: 1, height: 12, borderRadius: 999, background: s.soft, overflow: 'hidden' } }, h('div', { style: { width: p.value + '%', height: '100%', borderRadius: 999, background: s.gradient } })),
      h('span', { style: { width: 40, textAlign: 'right', fontSize: 14, fontWeight: 700 } }, p.value + ' %'));
  }

  function InsightList(p) {
    var strengths = p.tone !== 'review';
    return h(Card, { style: { padding: 16, background: strengths ? TONES.green : TONES.orange, color: '#fff', display: 'flex', flexDirection: 'column', gap: 16 } },
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: 4 } },
        h('span', { style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, lineHeight: '24px', fontWeight: 900 } }, h(Icon, { name: strengths ? 'star' : 'target', size: 20 }), p.title || (strengths ? 'Tes points forts' : 'À retravailler')),
        p.subtitle ? h('span', { style: { fontSize: 14, lineHeight: '20px', fontWeight: 500 } }, p.subtitle) : null),
      h('ul', { style: { margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 } },
        (p.items || []).map(function (it, i) {
          return h('li', { key: i, style: { display: 'flex', alignItems: 'center', gap: 12, minHeight: 48, padding: '8px 12px 8px 8px', background: '#fff', borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-sm)', color: 'var(--text)' } },
            h('span', { style: { width: 40, height: 40, flexShrink: 0, borderRadius: 'var(--radius-2xl)', background: strengths ? 'var(--success-soft)' : 'var(--warning-soft)', color: strengths ? 'var(--success)' : 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, h(Icon, { name: strengths ? 'check' : 'flip', size: 20, strokeWidth: 2 })),
            h('span', { style: { flexGrow: 1, display: 'flex', flexDirection: 'column' } }, h('span', { style: { fontSize: 14, lineHeight: '20px', fontWeight: 500 } }, it.title), h('span', { style: { fontSize: 12, lineHeight: '16px', color: 'var(--text-secondary)' } }, it.meta)),
            it.actionLabel ? h(Button, { size: 'sm', onClick: it.onAction, href: it.href }, it.actionLabel) : h('span', { style: { fontSize: 14, fontWeight: 700, color: strengths ? 'var(--success-strong)' : 'var(--warning-strong)' } }, it.value));
        })));
  }

  /* ---------- Espace Parents ---------- */
  function ChildSwitcher(p) {
    return h('button', { type: 'button', onClick: p.onClick, 'aria-label': "Changer d'enfant, enfant affiché : " + p.name, style: { display: 'inline-flex', alignItems: 'center', gap: 8, height: 48, padding: '0 12px 0 6px', border: 'none', borderRadius: 999, background: 'var(--surface)', boxShadow: 'var(--shadow-sm)', color: 'var(--text)', fontFamily: FONT, cursor: 'pointer' } },
      h('span', { style: { width: 36, height: 36, borderRadius: 999, background: 'linear-gradient(160deg, var(--blue-400) 0%, var(--blue-600) 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900 } }, (p.name || '?').charAt(0)),
      h('span', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' } }, h('span', { style: { fontSize: 14, lineHeight: '18px', fontWeight: 700 } }, p.name), h('span', { style: { fontSize: 12, lineHeight: '16px', color: 'var(--text-secondary)' } }, p.grade)),
      h(Icon, { name: 'chevronDown', size: 18, strokeWidth: 2, color: 'var(--gray-500)' }));
  }

  function HeroCard(p) {
    return h(Card, { as: 'section', attrs: { 'aria-label': p.label || p.title }, style: { background: TONES.hero, color: '#fff', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 } },
      h(Watermark, { name: p.icon || 'star', size: 140, opacity: 0.12, style: { right: -36, top: -30 } }),
      p.kicker || p.title ? h('div', { style: { position: 'relative', display: 'flex', alignItems: 'center', gap: 12 } },
        p.logo ? h('span', { style: { width: 44, height: 44, borderRadius: 999, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' } }, h(Logo, { size: 36, alt: '' })) : null,
        h('span', { style: { display: 'flex', flexDirection: 'column' } },
          p.kicker ? h(Overline, { color: 'rgba(255,255,255,0.85)' }, p.kicker) : null,
          p.title ? h('span', { style: { fontSize: p.big ? 28 : 18, lineHeight: p.big ? '36px' : '24px', fontWeight: 900 } }, p.title) : null,
          p.caption ? h('span', { style: { fontSize: 12, lineHeight: '16px', fontWeight: 500, opacity: 0.85 } }, p.caption) : null)) : null,
      h('div', { style: { position: 'relative', fontSize: 16, lineHeight: '26px' } }, p.children),
      p.badge ? h(Pill, { background: 'var(--green-500)', color: 'var(--green-900)', height: 28, style: { alignSelf: 'flex-start' } }, h(Icon, { name: 'trend', size: 14, strokeWidth: 2.5 }), p.badge) : null);
  }

  function AlertCard(p) {
    return h(Card, { as: 'section', attrs: { 'aria-label': p.title || 'À surveiller' }, style: { background: TONES.orange, color: '#fff', display: 'flex', flexDirection: 'column', gap: 12 } },
      h(Watermark, { name: 'warning', size: 120, opacity: 0.18, style: { right: -24, bottom: -28 } }),
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 12 } }, h(Veil, { icon: 'warning', background: '#fff', color: 'var(--orange-500)', iconSize: 20 }), h('span', { style: { fontSize: 18, lineHeight: '24px', fontWeight: 900 } }, p.title || 'À surveiller')),
      h('p', { style: { margin: 0, fontSize: 15, lineHeight: '22px', fontWeight: 500 } }, p.children),
      p.actionLabel ? h('a', { href: p.href || '#', onClick: p.onAction, style: { alignSelf: 'flex-start', height: 44, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 6, borderRadius: 14, background: '#fff', color: 'var(--orange-800)', fontSize: 14, fontWeight: 700, textDecoration: 'none' } }, p.actionLabel, h(Icon, { name: 'arrowRight', size: 16, strokeWidth: 2.25 })) : null);
  }

  function AdviceCard(p) {
    return h('section', { 'aria-label': p.title || "Comment l'encourager", style: { display: 'flex', flexDirection: 'column', gap: 12, padding: 20, background: 'var(--accent-soft)', borderRadius: 'var(--radius-3xl)', fontFamily: FONT } },
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 12 } }, h(Veil, { icon: 'bulb', background: SUBJECTS['physique-chimie'].gradient, iconSize: 20 }), h('span', { style: { fontSize: 18, lineHeight: '24px', fontWeight: 900, color: 'var(--violet-600)' } }, p.title || "Comment l'encourager")),
      h('p', { style: { margin: 0, fontSize: 15, lineHeight: '22px', color: 'var(--violet-800)' } }, p.children));
  }

  function SubjectProgressCard(p) {
    var s = subj(p.subject);
    var st = useState(!!p.defaultOpen);
    var open = p.open != null ? p.open : st[0];
    var chapters = p.chapters || [];
    function toggle() { if (p.onToggle) p.onToggle(!open); if (p.open == null) st[1](!open); }
    var counts = {};
    chapters.forEach(function (c) { counts[c.status] = (counts[c.status] || 0) + 1; });
    var meta = [counts.acquired ? counts.acquired + ' acquis' : null, counts.inProgress ? counts.inProgress + ' en cours' : null, counts.toConsolidate ? counts.toConsolidate + ' à consolider' : null].filter(Boolean).join(' · ');
    var up = (p.delta || 0) >= 0;
    return h('div', { style: { background: 'var(--surface)', borderRadius: 'var(--radius-3xl)', boxShadow: 'var(--shadow-md)', overflow: 'hidden', fontFamily: FONT, color: 'var(--text)' } },
      h('button', { type: 'button', onClick: toggle, 'aria-expanded': open, style: { width: '100%', display: 'flex', flexDirection: 'column', gap: 14, padding: '18px 20px', border: 'none', background: 'transparent', textAlign: 'left', color: 'var(--text)', fontFamily: FONT, cursor: 'pointer' } },
        h('span', { style: { width: '100%', display: 'flex', alignItems: 'center', gap: 14 } },
          h('span', { style: { width: 48, height: 48, flexShrink: 0, borderRadius: 16, background: s.gradient, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, h(Icon, { name: p.subject, size: 22 })),
          h('span', { style: { flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 } }, h('span', { style: { fontSize: 17, lineHeight: '22px', fontWeight: 900 } }, s.name), h('span', { style: { fontSize: 12, lineHeight: '16px', color: 'var(--text-secondary)' } }, meta)),
          h('span', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 } },
            h('span', { style: { fontSize: 18, lineHeight: '22px', fontWeight: 900 } }, p.value + ' %'),
            p.delta != null ? h(Pill, { background: up ? 'var(--success-soft)' : 'var(--warning-soft)', color: up ? 'var(--success-strong)' : 'var(--warning-strong)', height: 20, style: { fontSize: 11, padding: '0 8px' } }, (up ? '+' : '') + p.delta + ' pts') : null)),
        h('span', { 'aria-hidden': 'true', style: { width: '100%', display: 'flex', gap: 4, height: 10 } }, chapters.map(function (c, i) { return h('span', { key: i, style: { flex: '1 1 0', borderRadius: 999, background: (STATUSES[c.status] || STATUSES.notStarted).bg } }); })),
        h('span', { style: { alignSelf: 'center', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: s.ink } }, open ? 'Masquer les chapitres' : 'Voir les ' + chapters.length + ' chapitres', h(Icon, { name: 'chevronDown', size: 16, strokeWidth: 2.25, style: { transform: 'rotate(' + (open ? 180 : 0) + 'deg)', transition: 'transform 0.25s ease' } }))),
      open ? h('ul', { style: { margin: 0, padding: '0 20px 20px', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 } },
        chapters.map(function (c, i) {
          return h('li', { key: i, style: { display: 'flex', alignItems: 'center', gap: 12, minHeight: 52, padding: '10px 12px 10px 14px', borderRadius: 16, background: s.soft } },
            h('span', { style: { flexGrow: 1, display: 'flex', flexDirection: 'column' } }, h('span', { style: { fontSize: 14, lineHeight: '20px', fontWeight: 700 } }, c.title), c.meta ? h('span', { style: { fontSize: 12, lineHeight: '16px', color: 'var(--text-secondary)' } }, c.meta) : null),
            h(StatusChip, { status: c.status }));
        })) : null);
  }

  var MODE_LABELS = { ecrit: 'Écrit', vocal: 'Vocal', tableau: 'Tableau blanc', graphique: 'Graphique', flashcards: 'Flashcards' };
  function SessionSummaryCard(p) {
    var s = subj(p.subject);
    return h('article', { style: { background: 'var(--surface)', borderRadius: 'var(--radius-3xl)', boxShadow: 'var(--shadow-md)', overflow: 'hidden', fontFamily: FONT, color: 'var(--text)' } },
      h('div', { style: { position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', background: s.gradient, color: '#fff' } },
        h(Watermark, { name: p.subject, size: 90, style: { right: -16, top: -16 } }),
        h(Veil, { icon: p.subject, iconSize: 20 }),
        h('span', { style: { flexGrow: 1, display: 'flex', flexDirection: 'column' } }, h(Overline, { color: 'rgba(255,255,255,0.9)', style: { letterSpacing: '0.06em' } }, s.name + ' · ' + p.meta), h('span', { style: { fontSize: 17, lineHeight: '22px', fontWeight: 900 } }, p.title))),
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: 14, padding: '16px 20px 20px' } },
        h('p', { style: { margin: 0, fontSize: 15, lineHeight: '22px', color: 'var(--gray-700)' } }, p.summary),
        h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8 } },
          h(StatusChip, { status: p.outcome || 'understood', icon: true }),
          (p.modes || []).map(function (m) { return h(Pill, { key: m, background: s.soft, color: s.ink, height: 28 }, MODE_LABELS[m] || m); }))));
  }

  var SETTING_TONES = { orange: 'var(--orange-500)', violet: SUBJECTS['physique-chimie'].gradient, blue: SUBJECTS.francais.gradient, cyan: SUBJECTS.anglais.gradient, red: SUBJECTS.maths.gradient, green: SUBJECTS['histoire-geo'].gradient };
  function SettingRow(p) {
    var trailing = p.href || p.onClick ? h(Icon, { name: 'chevronRight', size: 18, strokeWidth: 2, color: 'var(--gray-500)' }) : h(Switch, { checked: p.checked, onChange: p.onChange, label: p.label });
    var body = [
      h('span', { key: 'i', style: { width: 44, height: 44, flexShrink: 0, borderRadius: 14, background: SETTING_TONES[p.tone] || SETTING_TONES.blue, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, h(Icon, { name: p.icon || 'sliders', size: 20, strokeWidth: 2 })),
      h('span', { key: 't', style: { flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 } }, h('span', { style: { fontSize: 16, lineHeight: '22px', fontWeight: 700 } }, p.label), p.hint ? h('span', { style: { fontSize: 13, lineHeight: '18px', color: 'var(--text-secondary)' } }, p.hint) : null),
      h('span', { key: 's' }, trailing)
    ];
    var style = { display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', minHeight: 72, boxSizing: 'border-box', borderTop: p.divider ? '1px solid var(--blue-100)' : 'none', textDecoration: 'none', color: 'var(--text)', fontFamily: FONT };
    if (p.href) return h('a', { href: p.href, style: style }, body);
    return h('div', { style: style }, body);
  }

  /* ---------- Connexion, inscription et onboarding ---------- */
  var SPACE = {
    eleve: { grad: SUBJECTS.francais.gradient, main: 'var(--primary)', ink: 'var(--blue-600)', soft: 'var(--blue-100)', shadow: 'var(--shadow-brand)', icon: 'cap', kicker: 'Espace élève' },
    parents: { grad: SUBJECTS['physique-chimie'].gradient, main: 'var(--accent)', ink: 'var(--violet-600)', soft: 'var(--violet-100)', shadow: '0 8px 20px rgba(102,46,230,0.30)', icon: 'family', kicker: 'Espace Parents' }
  };
  function space(id) { return SPACE[id === 'parent' || id === 'parents' || id === 'violet' ? 'parents' : 'eleve']; }
  function grad(t) { return t === 'brown' ? SUBJECTS.svt.gradient : (TONES[t] && t !== 'blue' ? TONES[t] : (SUBJECTS[t] ? SUBJECTS[t].gradient : SUBJECTS.francais.gradient)); }
  var FIELD = { width: '100%', height: 52, boxSizing: 'border-box', border: '1px solid var(--border)', borderRadius: 'var(--radius-2xl)', background: 'var(--surface)', boxShadow: 'var(--shadow-sm)', fontFamily: FONT, fontSize: 16, color: 'var(--text)' };
  var LABEL = { fontSize: 14, lineHeight: '20px', fontWeight: 700, color: 'var(--text)' };

  function TextField(p) {
    var st = useState(p.defaultValue || '');
    var shown = useState(false);
    var val = p.value != null ? p.value : st[0];
    var pw = p.type === 'password';
    var type = pw && shown[0] ? 'text' : (p.type || 'text');
    function change(e) { st[1](e.target.value); if (p.onChange) p.onChange(e.target.value); }
    return h('label', { style: { display: 'flex', flexDirection: 'column', gap: 8, fontFamily: FONT } },
      h('span', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 } },
        h('span', { style: LABEL }, p.label),
        p.badge ? h(Pill, { background: 'var(--primary-soft)', color: 'var(--primary)', height: 24, style: { fontSize: 12 } }, p.badge) : null),
      h('span', { style: { position: 'relative', display: 'block' } },
        p.icon ? h('span', { style: { position: 'absolute', left: 16, top: 16, color: 'var(--gray-400)', display: 'flex' } }, h(Icon, { name: p.icon, size: 20 })) : null,
        h('input', { type: type, value: val, onChange: change, placeholder: p.placeholder, autoComplete: p.autoComplete, inputMode: p.inputMode, maxLength: p.maxLength,
          style: assign({}, FIELD, { padding: '0 ' + (pw ? 52 : 16) + 'px 0 ' + (p.icon ? 48 : 16) + 'px', letterSpacing: p.inputMode === 'numeric' ? '0.08em' : undefined }) }),
        pw ? h('button', { type: 'button', onClick: function () { shown[1](!shown[0]); }, 'aria-label': shown[0] ? 'Masquer le mot de passe' : 'Afficher le mot de passe',
          style: { position: 'absolute', right: 6, top: 6, width: 40, height: 40, border: 'none', borderRadius: 12, background: 'transparent', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' } },
          h(Icon, { name: shown[0] ? 'eyeOff' : 'eye', size: 20 })) : null),
      p.hint ? h('span', { style: { fontSize: 13, lineHeight: '18px', color: 'var(--text-secondary)' } }, p.hint) : null);
  }

  function PasswordRules(p) {
    return h('ul', { 'aria-label': 'Règles du mot de passe', style: { margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: p.inline ? 'row' : 'column', flexWrap: 'wrap', gap: p.inline ? '6px 14px' : 6, fontFamily: FONT } },
      (p.rules || []).map(function (r, i) {
        return h('li', { key: i, style: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, lineHeight: '18px', fontWeight: 500, color: r.ok ? 'var(--success-strong)' : 'var(--text-secondary)' } },
          h('span', { style: { width: 18, height: 18, borderRadius: 999, background: r.ok ? 'var(--success)' : 'var(--gray-200)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, h(Icon, { name: 'check', size: 12, strokeWidth: 3 })),
          r.label, h('span', { style: { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' } }, r.ok ? ' (validé)' : ' (à faire)'));
      }));
  }

  function Checkbox(p) {
    var s = space(p.tone);
    var on = !!p.checked;
    return h('button', { type: 'button', role: 'checkbox', 'aria-checked': on, onClick: function () { if (p.onChange) p.onChange(!on); },
      style: { display: 'flex', alignItems: 'flex-start', gap: 12, padding: 0, border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', color: 'var(--text)', fontFamily: FONT } },
      h('span', { style: { flexShrink: 0, width: 24, height: 24, marginTop: 1, boxSizing: 'border-box', borderRadius: 8, border: on ? 'none' : '2px solid var(--gray-200)', background: on ? s.main : '#fff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
        on ? h(Icon, { name: 'check', size: 16, strokeWidth: 3 }) : null),
      h('span', { style: { fontSize: 14, lineHeight: '22px' } }, p.children));
  }

  function OrDivider(p) {
    var line = { flexGrow: 1, height: 1, background: 'var(--border)' };
    return h('div', { 'aria-hidden': 'true', style: { display: 'flex', alignItems: 'center', gap: 12, fontFamily: FONT, fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' } },
      h('span', { style: line }), p.label || 'ou', h('span', { style: line }));
  }

  function AuthProviderButtons(p) {
    var row = p.layout === 'row';
    var base = { flex: row ? '1 1 0' : undefined, height: 52, boxSizing: 'border-box', borderRadius: 'var(--radius-2xl)', fontFamily: FONT, fontSize: row ? 15 : 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
    return h('div', { style: { display: 'flex', flexDirection: row ? 'row' : 'column', gap: 12 } },
      h('button', { type: 'button', onClick: p.onApple, style: assign({}, base, { border: 'none', background: 'var(--gray-900)', color: '#fff' }) }, row ? 'Avec Apple' : 'Continuer avec Apple'),
      h('button', { type: 'button', onClick: p.onGoogle, style: assign({}, base, { border: '1px solid var(--border)', background: 'var(--surface)', boxShadow: 'var(--shadow-sm)', color: 'var(--text)' }) }, row ? 'Avec Google' : 'Continuer avec Google'));
  }

  function AuthHero(p) {
    var s = space(p.space);
    return h('header', { style: { position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 6, padding: 24, borderRadius: 'var(--radius-3xl)', background: s.grad, color: '#fff', boxShadow: 'var(--shadow-md)', fontFamily: FONT } },
      h(Watermark, { name: s.icon, size: 130, opacity: 0.14, style: { right: -24, top: -26 } }),
      h(Overline, { color: 'rgba(255,255,255,0.9)', style: { position: 'relative' } }, p.kicker || s.kicker),
      h('h1', { style: { position: 'relative', margin: 0, fontSize: 28, lineHeight: '34px', fontWeight: 900 } }, p.title),
      p.subtitle ? h('p', { style: { position: 'relative', margin: 0, fontSize: 15, lineHeight: '22px', fontWeight: 500, opacity: 0.92 } }, p.subtitle) : null);
  }

  function ProfileChoiceCard(p) {
    var s = space(p.role);
    var sel = !!p.selected;
    var ringColor = p.role === 'parent' || p.role === 'parents' ? 'var(--violet-600)' : 'var(--blue-600)';
    return h('button', { type: 'button', onClick: p.onClick, 'aria-pressed': sel,
      style: { position: 'relative', overflow: 'hidden', width: '100%', minHeight: 96, padding: 20, boxSizing: 'border-box', border: 'none', borderRadius: 'var(--radius-3xl)', background: s.grad, color: '#fff', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', fontFamily: FONT,
        boxShadow: sel ? '0 0 0 3px var(--bg), 0 0 0 6px ' + ringColor + ', var(--shadow-lg)' : 'var(--shadow-md)', transition: 'box-shadow 0.2s ease' } },
      h(Watermark, { name: s.icon, size: 140, opacity: 0.14, style: { right: -30, bottom: -40 } }),
      h('span', { style: { position: 'relative', flexShrink: 0, width: 56, height: 56, borderRadius: 18, background: VEIL, display: 'flex', alignItems: 'center', justifyContent: 'center' } }, h(Icon, { name: s.icon, size: 28 })),
      h('span', { style: { position: 'relative', flexGrow: 1, fontSize: 24, lineHeight: '30px', fontWeight: 900 } }, p.title || (s === SPACE.parents ? 'Je suis parent' : 'Je suis élève')),
      h('span', { style: { position: 'relative', flexShrink: 0, width: 28, height: 28, borderRadius: 999, background: sel ? '#fff' : 'transparent', border: '2px solid #fff', boxSizing: 'border-box', color: 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
        sel ? h(Icon, { name: 'check', size: 16, strokeWidth: 3 }) : null));
  }

  function SubjectCluster(p) {
    var tiles = [['maths', 'left: 28px; top: 36px', -8], ['francais', 'left: 118px; top: 8px', 6], ['histoire-geo', 'right: 112px; top: 30px', -4],
      ['physique-chimie', 'right: 26px; top: 4px', 9], ['svt', 'left: 64px; top: 124px', 7], ['anglais', 'right: 58px; top: 118px', -7]];
    function pos(str) { var o = {}; str.split(';').forEach(function (kv) { var a = kv.split(':'); o[a[0].trim()] = a[1].trim(); }); return o; }
    return h('div', { 'aria-hidden': 'true', style: { position: 'relative', height: p.height || 176, width: '100%' } },
      tiles.map(function (t) {
        return h('span', { key: t[0], style: assign({ position: 'absolute', transform: 'rotate(' + t[2] + 'deg)', width: 56, height: 56, borderRadius: 18, background: subj(t[0]).gradient, boxShadow: 'var(--shadow-md)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }, pos(t[1])) },
          h(Icon, { name: t[0], size: 26 }));
      }),
      p.logo === false ? null : h('span', { style: { position: 'absolute', left: '50%', top: 64, transform: 'translateX(-50%)', width: 96, height: 96, borderRadius: 28, background: '#fff', boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' } },
        h(Logo, { size: 92, alt: '' })));
  }

  function StepHeader(p) {
    var s = space(p.tone);
    var bars = [];
    for (var i = 0; i < (p.total || 4); i++) bars.push(h('span', { key: i, style: { flex: '1 1 0', height: 8, borderRadius: 999, background: i < p.step ? s.main : (s === SPACE.parents ? 'var(--violet-200)' : 'var(--blue-200)') } }));
    var back = { width: 48, height: 48, flexShrink: 0, borderRadius: 'var(--radius-2xl)', border: 'none', background: 'var(--surface)', boxShadow: 'var(--shadow-sm)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', textDecoration: 'none' };
    return h('div', { style: { display: 'flex', alignItems: 'center', gap: 12, fontFamily: FONT } },
      p.backHref ? h('a', { href: p.backHref, 'aria-label': 'Retour', style: back }, h(Icon, { name: 'chevronLeft', size: 22, strokeWidth: 2 }))
        : h('button', { type: 'button', onClick: p.onBack, 'aria-label': 'Retour', style: back }, h(Icon, { name: 'chevronLeft', size: 22, strokeWidth: 2 })),
      h('div', { style: { flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 6 } },
        h(Overline, { color: s.ink }, 'Étape ' + p.step + ' sur ' + (p.total || 4)),
        h('span', { 'aria-hidden': 'true', style: { display: 'flex', gap: 6 } }, bars)),
      p.onSkip || p.skipLabel ? h('button', { type: 'button', onClick: p.onSkip, style: { flexShrink: 0, height: 48, padding: '0 4px', border: 'none', background: 'transparent', fontFamily: FONT, fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', cursor: 'pointer' } }, p.skipLabel || 'Passer') : null);
  }

  var GRADES = [['Primaire', ['CP', 'CE1', 'CE2', 'CM1', 'CM2']], ['Collège', ['6e', '5e', '4e', '3e']], ['Lycée', ['2de', '1re', 'Tle']]];
  function GradePicker(p) {
    var s = space(p.tone);
    var st = useState(p.defaultValue || null);
    var val = p.value != null ? p.value : st[0];
    function pick(g) { st[1](g); if (p.onChange) p.onChange(g); }
    function chip(g) {
      var on = g === val;
      return h('button', { key: g, type: 'button', role: 'radio', 'aria-checked': on, onClick: function () { pick(g); },
        style: { minWidth: p.grouped === false ? 0 : 68, height: p.grouped === false ? 48 : 52, padding: '0 16px', boxSizing: 'border-box', border: on ? 'none' : '1px solid var(--border)', borderRadius: 'var(--radius-2xl)', background: on ? s.grad : 'var(--surface)', boxShadow: on ? s.shadow : 'var(--shadow-sm)', color: on ? '#fff' : 'var(--text)', fontFamily: FONT, fontSize: p.grouped === false ? 15 : 16, fontWeight: 700, cursor: 'pointer' } }, g);
    }
    if (p.grouped === false) {
      var all = [].concat(GRADES[0][1], GRADES[1][1], GRADES[2][1]);
      return h('div', { role: 'radiogroup', 'aria-label': p.label || 'Classe', style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 } }, all.map(chip));
    }
    return h('div', { role: 'radiogroup', 'aria-label': p.label || 'Classe', style: { display: 'flex', flexDirection: 'column', gap: 16, fontFamily: FONT } },
      GRADES.map(function (g) {
        return h('div', { key: g[0], style: { display: 'flex', flexDirection: 'column', gap: 8 } },
          h(Overline, { color: 'var(--text-secondary)' }, g[0]),
          h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8 } }, g[1].map(chip)));
      }));
  }

  var LEVELS = ['Galère', 'Bof', 'Ça va', 'À l’aise'];
  function SelfAssessmentRow(p) {
    var s = subj(p.subject);
    var st = useState(p.defaultValue != null ? p.defaultValue : null);
    var v = p.value != null ? p.value : st[0];
    var levels = p.levels || LEVELS;
    return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 12, padding: 14, borderRadius: 'var(--radius-3xl)', background: 'var(--surface)', boxShadow: 'var(--shadow-md)', fontFamily: FONT, color: 'var(--text)' } },
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 12 } },
        h('span', { style: { flexShrink: 0, width: 40, height: 40, borderRadius: 14, background: s.gradient, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, h(Icon, { name: p.subject, size: 20 })),
        h('span', { style: { flexGrow: 1, fontSize: 17, lineHeight: '22px', fontWeight: 900 } }, s.name),
        v != null ? h('span', { style: { fontSize: 13, fontWeight: 700, color: s.ink } }, levels[v]) : null),
      h('div', { role: 'radiogroup', 'aria-label': s.name, style: { display: 'flex', gap: 6 } },
        levels.map(function (lb, i) {
          var on = v === i, before = v != null && i < v;
          return h('button', { key: i, type: 'button', role: 'radio', 'aria-checked': on, 'aria-label': s.name + ' : ' + lb, onClick: function () { st[1](i); if (p.onChange) p.onChange(i); },
            style: { flex: '1 1 0', height: 40, border: 'none', borderRadius: 12, background: on ? s.gradient : (before ? s.soft : 'var(--bg)'), color: on ? '#fff' : (before ? s.ink : 'var(--text-secondary)'), fontFamily: FONT, fontSize: 13, fontWeight: 700, cursor: 'pointer' } }, lb);
        })));
  }

  function GoalTile(p) {
    var on = !!p.selected, g = grad(p.tone);
    return h('button', { type: 'button', role: 'checkbox', 'aria-checked': on, onClick: p.onClick,
      style: { position: 'relative', overflow: 'hidden', minHeight: 112, padding: 14, boxSizing: 'border-box', border: on ? 'none' : '1px solid var(--border)', borderRadius: 'var(--radius-3xl)', background: on ? g : 'var(--surface)', boxShadow: on ? 'var(--shadow-lg)' : 'var(--shadow-sm)', color: on ? '#fff' : 'var(--text)', textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 10, cursor: 'pointer', fontFamily: FONT } },
      h('span', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
        h('span', { style: { width: 40, height: 40, borderRadius: 14, background: on ? VEIL : g, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, h(Icon, { name: p.icon, size: 20 })),
        h('span', { style: { width: 24, height: 24, boxSizing: 'border-box', borderRadius: 999, border: '2px solid ' + (on ? '#fff' : 'var(--gray-200)'), background: on ? '#fff' : 'transparent', color: 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, on ? h(Icon, { name: 'check', size: 14, strokeWidth: 3 }) : null)),
      h('span', { style: { fontSize: 15, lineHeight: '20px', fontWeight: 900 } }, p.label));
  }

  function DurationPicker(p) {
    var s = space(p.tone);
    var st = useState(p.defaultValue || null);
    var v = p.value != null ? p.value : st[0];
    return h('div', { role: 'radiogroup', 'aria-label': p.label || 'Temps par jour', style: { display: 'flex', gap: 8 } },
      (p.options || [10, 15, 20, 30]).map(function (n) {
        var on = v === n;
        return h('button', { key: n, type: 'button', role: 'radio', 'aria-checked': on, onClick: function () { st[1](n); if (p.onChange) p.onChange(n); },
          style: { flex: '1 1 0', height: 64, boxSizing: 'border-box', border: on ? 'none' : '1px solid var(--border)', borderRadius: 'var(--radius-2xl)', background: on ? s.grad : 'var(--surface)', boxShadow: on ? s.shadow : 'var(--shadow-sm)', color: on ? '#fff' : 'var(--text)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontFamily: FONT } },
          h('span', { style: { fontSize: 20, lineHeight: '24px', fontWeight: 900 } }, n), h('span', { style: { fontSize: 12, lineHeight: '16px', fontWeight: 700 } }, p.unit || 'min'));
      }));
  }

  function ChoiceRow(p) {
    var on = !!p.selected, g = grad(p.tone);
    return h('button', { type: 'button', role: p.single ? 'radio' : 'checkbox', 'aria-checked': on, onClick: p.onClick,
      style: { display: 'flex', alignItems: 'center', gap: 14, width: '100%', minHeight: 72, padding: '12px 16px 12px 12px', boxSizing: 'border-box', border: on ? 'none' : '1px solid var(--border)', borderRadius: 'var(--radius-3xl)', background: on ? g : 'var(--surface)', boxShadow: on ? 'var(--shadow-lg)' : 'var(--shadow-sm)', color: on ? '#fff' : 'var(--text)', textAlign: 'left', cursor: 'pointer', fontFamily: FONT } },
      h('span', { style: { flexShrink: 0, width: 48, height: 48, borderRadius: 16, background: on ? VEIL : g, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, h(Icon, { name: p.icon, size: 22 })),
      h('span', { style: { flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 } },
        h('span', { style: { fontSize: 16, lineHeight: '22px', fontWeight: 900 } }, p.label),
        p.hint ? h('span', { style: { fontSize: 13, lineHeight: '18px', fontWeight: 500, opacity: 0.85 } }, p.hint) : null),
      h('span', { style: { flexShrink: 0, width: 24, height: 24, boxSizing: 'border-box', borderRadius: p.single ? 999 : 8, border: '2px solid ' + (on ? '#fff' : 'var(--gray-200)'), background: on ? '#fff' : 'transparent', color: 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
        on ? h(Icon, { name: 'check', size: 14, strokeWidth: 3 }) : null));
  }

  function ToggleChip(p) {
    var on = !!p.selected;
    return h('button', { type: 'button', role: 'checkbox', 'aria-checked': on, onClick: p.onClick,
      style: { height: 52, padding: '0 14px', boxSizing: 'border-box', border: on ? '2px solid var(--primary)' : '1px solid var(--border)', borderRadius: 'var(--radius-2xl)', background: on ? 'var(--primary-soft)' : 'var(--surface)', boxShadow: on ? 'none' : 'var(--shadow-sm)', color: on ? 'var(--blue-600)' : 'var(--text)', display: 'flex', alignItems: 'center', gap: 8, fontFamily: FONT, fontSize: 15, fontWeight: 700, cursor: 'pointer' } },
      p.icon ? h(Icon, { name: p.icon, size: 18, strokeWidth: 2 }) : null, p.label);
  }

  function ParentCodeCard(p) {
    return h('section', { 'aria-label': 'Code de connexion', style: { position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 14, padding: 24, borderRadius: 'var(--radius-3xl)', background: SPACE.parents.grad, color: '#fff', boxShadow: 'var(--shadow-md)', fontFamily: FONT } },
      h(Watermark, { name: 'key', size: 150, opacity: 0.14, style: { right: -30, top: -34 } }),
      h(Overline, { color: 'rgba(255,255,255,0.9)', style: { position: 'relative' } }, 'Code de connexion' + (p.name ? ' de ' + p.name : '')),
      h('span', { style: { position: 'relative', fontSize: 48, lineHeight: '52px', fontWeight: 900, letterSpacing: '0.12em' } }, p.code),
      h('span', { style: { position: 'relative', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, lineHeight: '20px', fontWeight: 500, opacity: 0.92 } }, h(Icon, { name: 'clock', size: 16, strokeWidth: 2 }), p.validity || 'Valable 24 h'),
      h('button', { type: 'button', onClick: p.onShare, style: { position: 'relative', alignSelf: 'flex-start', height: 44, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 8, border: 'none', borderRadius: 14, background: '#fff', color: 'var(--violet-600)', fontFamily: FONT, fontSize: 14, fontWeight: 700, cursor: 'pointer' } },
        h(Icon, { name: 'share', size: 18, strokeWidth: 2 }), p.shareLabel || 'Partager le code'));
  }

  function StepList(p) {
    var s = space(p.tone);
    return h('section', { 'aria-label': p.title, style: { display: 'flex', flexDirection: 'column', gap: 14, padding: 20, borderRadius: 'var(--radius-3xl)', background: 'var(--surface)', boxShadow: 'var(--shadow-md)', fontFamily: FONT, color: 'var(--text)' } },
      p.title ? h('h2', { style: { margin: 0, display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, lineHeight: '22px', fontWeight: 900 } }, p.icon ? h(Icon, { name: p.icon, size: 20, strokeWidth: 2, color: s.ink }) : null, p.title) : null,
      h('ol', { style: { margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 } },
        (p.steps || []).map(function (t, i) {
          return h('li', { key: i, style: { display: 'flex', alignItems: 'center', gap: 12 } },
            h('span', { style: { flexShrink: 0, width: 32, height: 32, borderRadius: 999, background: s.soft, color: s.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900 } }, i + 1),
            h('span', { style: { fontSize: 14, lineHeight: '20px', color: 'var(--gray-700)' } }, t));
        })));
  }

  function PlanRow(p) {
    var g = p.subject ? subj(p.subject).gradient : grad(p.tone);
    return h('div', { style: { display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 'var(--radius-3xl)', background: 'var(--surface)', boxShadow: 'var(--shadow-md)', fontFamily: FONT, color: 'var(--text)' } },
      h('span', { style: { flexShrink: 0, width: 48, height: 48, borderRadius: 16, background: g, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, h(Icon, { name: p.icon || p.subject, size: 22 })),
      h('span', { style: { flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 } },
        p.kicker ? h(Overline, { color: 'var(--text-secondary)' }, p.kicker) : null,
        h('span', { style: { fontSize: 16, lineHeight: '22px', fontWeight: 900 } }, p.title),
        p.meta ? h('span', { style: { fontSize: 13, lineHeight: '18px', color: 'var(--text-secondary)' } }, p.meta) : null));
  }


  /* ---------- Explorer : la carte d'aventure ---------- */
  var LEVEL_TYPES = {
    lecon: { label: 'Leçon', icon: 'book', grad: 'linear-gradient(160deg, var(--green-400) 0%, var(--green-600) 45%, var(--green-700) 100%)', solid: 'var(--green-700)', soft: 'var(--green-100)', ink: 'var(--green-800)', ring: 'var(--green-200)' },
    exercices: { label: 'Exercices', icon: 'pencil', grad: 'linear-gradient(160deg, var(--blue-400) 0%, var(--blue-500) 45%, var(--blue-600) 100%)', solid: 'var(--blue-500)', soft: 'var(--blue-100)', ink: 'var(--blue-600)', ring: 'var(--blue-200)' },
    evaluation: { label: 'Évaluation', icon: 'crown', grad: 'linear-gradient(160deg, var(--red-300) 0%, var(--red-500) 45%, var(--red-600) 100%)', solid: 'var(--red-500)', soft: 'var(--red-100)', ink: 'var(--red-600)', ring: 'var(--red-200)' }
  };
  function ltype(t) { return LEVEL_TYPES[t] || LEVEL_TYPES.lecon; }
  var SUBJECT_MOTIFS = { francais: 'book', 'histoire-geo': 'histoire-geo', 'physique-chimie': 'physique-chimie', svt: 'svt', anglais: 'anglais' };

  function Stars(p) {
    var n = p.value || 0, size = p.size || 16, out = [];
    for (var i = 0; i < 3; i++) out.push(h('svg', { key: i, width: size, height: size, viewBox: '0 0 24 24', 'aria-hidden': 'true' },
      h('path', { d: ICONS.star, fill: i < n ? (p.onColor ? '#fff' : 'var(--orange-500)') : (p.onColor ? 'rgba(255,255,255,0.3)' : 'var(--gray-200)'), stroke: p.outline ? '#fff' : 'none', strokeWidth: 2, strokeLinejoin: 'round' })));
    return h('span', { role: 'img', 'aria-label': n + ' étoile' + (n > 1 ? 's' : '') + ' sur 3', style: { display: 'inline-flex', alignItems: 'center', gap: p.gap != null ? p.gap : 2 } }, out);
  }

  function IslandIllustration(p) {
    var w = p.size || 300, id = 'isl-' + (p.subject || 'maths') + (p.idSuffix || '');
    var e = [];
    e.push(h('defs', { key: 'd' },
      h('linearGradient', { id: id + '-fall', x1: 0, y1: 0, x2: 0, y2: 1 }, h('stop', { offset: 0, stopColor: 'var(--azure-300)' }), h('stop', { offset: 1, stopColor: 'var(--azure-300)', stopOpacity: 0 })),
      h('linearGradient', { id: id + '-grass', x1: 0, y1: 0, x2: 0, y2: 1 }, h('stop', { offset: 0, stopColor: 'var(--green-200)' }), h('stop', { offset: 1, stopColor: 'var(--green-400)' }))));
    e.push(h('path', { key: 'rock', d: 'M26 128 C 40 190, 112 252, 160 284 C 208 252, 280 190, 294 128 Z', fill: 'var(--gray-300)' }));
    [['26,128 92,138 118,214', 'var(--gray-200)', 1], ['170,146 250,138 212,232', 'var(--gray-400)', 0.55], ['250,138 294,128 262,176', 'var(--gray-200)', 1], ['118,214 160,284 146,214', 'var(--gray-400)', 0.35],
      ['76,176 86,160 96,178 86,192', 'var(--blue-200)', 1], ['226,196 236,178 246,198 236,210', 'var(--violet-200)', 1], ['190,240 197,228 204,242 197,250', 'var(--blue-200)', 1]].forEach(function (f, i) {
      e.push(h('polygon', { key: 'f' + i, points: f[0], fill: f[1], opacity: f[2] }));
    });
    e.push(h('ellipse', { key: 'earth', cx: 160, cy: 134, rx: 136, ry: 40, fill: 'var(--orange-600)' }));
    e.push(h('ellipse', { key: 'grass', cx: 160, cy: 120, rx: 136, ry: 42, fill: 'url(#' + id + '-grass)' }));
    e.push(h('ellipse', { key: 'shine', cx: 140, cy: 108, rx: 92, ry: 22, fill: '#fff', opacity: 0.18 }));
    e.push(h('path', { key: 'river', d: 'M162 92 C 178 106, 152 120, 168 152 L 182 152 C 166 120, 192 106, 174 92 Z', fill: 'var(--azure-200)' }));
    e.push(h('rect', { key: 'fall', x: 165, y: 150, width: 18, height: 104, rx: 9, fill: 'url(#' + id + '-fall)' }));
    if (p.motifs !== false) {
      function tree(k, x, y, r) { return h('g', { key: k }, h('rect', { x: x - 2, y: y, width: 4, height: 12, rx: 2, fill: 'var(--orange-700)' }), h('circle', { cx: x, cy: y - 2, r: r, fill: 'var(--green-700)' }), h('circle', { cx: x - 3, cy: y - 5, r: r - 5, fill: 'var(--green-600)' })); }
      function tile(k, x, y, s, fill, text) { return h('g', { key: k, transform: 'translate(' + x + ' ' + y + ')' }, h('rect', { width: s, height: s, rx: 8, fill: fill }), h('text', { x: s / 2, y: s * 0.72, textAnchor: 'middle', fontSize: s * 0.68, fontWeight: 900, fill: '#fff', fontFamily: FONT }, text)); }
      if ((p.subject || 'maths') === 'maths') {
        var ticks = []; for (var i = 0; i < 8; i++) ticks.push(h('line', { key: i, x1: 56 + i * 12, y1: 62, x2: 56 + i * 12, y2: i % 2 ? 70 : 74, stroke: 'var(--orange-700)', strokeWidth: 2, strokeLinecap: 'round' }));
        e.push(h('g', { key: 'ruler', transform: 'rotate(-18 96 70)' }, h('rect', { x: 46, y: 62, width: 104, height: 18, rx: 5, fill: 'var(--orange-300)' }), ticks));
        e.push(h('polygon', { key: 'sq', points: '232,56 282,108 232,108', fill: 'var(--blue-300)', stroke: '#fff', strokeWidth: 4, strokeLinejoin: 'round' }));
        e.push(h('polygon', { key: 'sq2', points: '243,84 259,100 243,100', fill: 'var(--blue-100)' }));
        e.push(h('g', { key: 'cube', transform: 'translate(70 96)' }, h('polygon', { points: '0,10 18,0 36,10 18,20', fill: 'var(--violet-200)' }), h('polygon', { points: '0,10 18,20 18,42 0,32', fill: 'var(--violet-400)' }), h('polygon', { points: '36,10 18,20 18,42 36,32', fill: 'var(--violet-300)' })));
        e.push(h('text', { key: 'pi', x: 116, y: 140, fontSize: 34, fontWeight: 900, fill: 'var(--blue-500)', fontFamily: FONT }, 'π'));
        e.push(tile('plus', 222, 120, 26, 'var(--cyan-700)', '+'));
        e.push(tile('times', 38, 118, 24, 'var(--violet-500)', '×'));
        [[188, 74], [206, 82]].forEach(function (c, i) { e.push(h('g', { key: 'h' + i }, h('rect', { x: c[0], y: c[1], width: 16, height: 14, rx: 2, fill: '#fff' }), h('polygon', { points: (c[0] - 3) + ',' + (c[1] + 1) + ' ' + (c[0] + 8) + ',' + (c[1] - 9) + ' ' + (c[0] + 19) + ',' + (c[1] + 1), fill: 'var(--blue-500)' }))); });
        e.push(tree('t1', 292, 114, 12)); e.push(tree('t2', 206, 146, 9)); e.push(tree('t3', 140, 98, 9));
      } else {
        var s = subj(p.subject);
        e.push(h('g', { key: 'm1', transform: 'translate(206 72)', color: '#fff' }, h('rect', { width: 52, height: 52, rx: 16, fill: s.bar }), h('g', { transform: 'translate(12 12) scale(1.17)' }, h('path', { d: ICONS[SUBJECT_MOTIFS[p.subject]] || ICONS[p.subject], fill: 'none', stroke: '#fff', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }))));
        e.push(h('g', { key: 'm2', transform: 'translate(70 92)' }, h('rect', { width: 34, height: 34, rx: 11, fill: s.ink }), h('g', { transform: 'translate(7 7) scale(0.83)' }, h('path', { d: ICONS[p.subject], fill: 'none', stroke: '#fff', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }))));
        e.push(tree('t1', 292, 114, 12)); e.push(tree('t2', 140, 98, 10)); e.push(tree('t3', 40, 118, 11));
      }
    }
    return h('svg', { width: w, height: Math.round(w * 290 / 320), viewBox: '0 0 320 290', role: p.label ? 'img' : undefined, 'aria-label': p.label, 'aria-hidden': p.label ? undefined : 'true', style: { display: 'block', overflow: 'visible' } }, e);
  }

  function IslandCarousel(p) {
    var list = p.subjects || ['maths', 'francais', 'histoire-geo', 'physique-chimie', 'svt', 'anglais'];
    var st = useState(p.defaultIndex || 0);
    var i = p.index != null ? p.index : st[0];
    function go(j) { var k = (j + list.length) % list.length; st[1](k); if (p.onChange) p.onChange(k, list[k]); }
    var s = subj(list[i]);
    var arrow = { position: 'absolute', top: 196, width: 48, height: 48, border: 'none', borderRadius: 999, background: 'var(--surface)', boxShadow: 'var(--shadow-md)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
    var sideName = function (k) { return list[(i + k + list.length) % list.length]; };
    return h('section', { 'aria-roledescription': 'carrousel', 'aria-label': 'Îles des matières', style: { position: 'relative', width: '100%', maxWidth: 350, height: 440, fontFamily: FONT } },
      h('div', { style: { display: 'flex', justifyContent: 'center' } }, h('span', { 'aria-live': 'polite', style: { height: 48, padding: '0 28px', display: 'flex', alignItems: 'center', borderRadius: 999, background: s.gradient, color: '#fff', fontSize: 22, fontWeight: 900, boxShadow: 'var(--shadow-md)' } }, SUBJECT_FULL[list[i]] || s.name)),
      h('div', { 'aria-hidden': 'true', style: { position: 'absolute', left: -96, top: 150, opacity: 0.35, transform: 'scale(0.5)', transformOrigin: 'left center' } }, h(IslandIllustration, { subject: sideName(-1), motifs: false, idSuffix: '-l' })),
      h('div', { 'aria-hidden': 'true', style: { position: 'absolute', right: -96, top: 150, opacity: 0.35, transform: 'scale(0.5)', transformOrigin: 'right center' } }, h(IslandIllustration, { subject: sideName(1), motifs: false, idSuffix: '-r' })),
      h('div', { className: 'tia-float', style: { position: 'absolute', left: '50%', marginLeft: -150, top: 84 } }, h(IslandIllustration, { subject: list[i], label: 'Île ' + (s.name === 'Maths' ? 'des Maths' : 'de ' + s.name) })),
      h('span', { 'aria-hidden': 'true', style: { position: 'absolute', left: '50%', marginLeft: -80, top: 368, width: 160, height: 22, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(9,17,34,0.18), rgba(9,17,34,0))' } }),
      h('button', { type: 'button', onClick: function () { go(i - 1); }, 'aria-label': 'Île précédente', style: assign({}, arrow, { left: -8 }) }, h(Icon, { name: 'chevronLeft', size: 22, strokeWidth: 2.25 })),
      h('button', { type: 'button', onClick: function () { go(i + 1); }, 'aria-label': 'Île suivante', style: assign({}, arrow, { right: -8 }) }, h(Icon, { name: 'chevronRight', size: 22, strokeWidth: 2.25 })),
      h('div', { role: 'tablist', 'aria-label': 'Matières', style: { position: 'absolute', left: 0, right: 0, top: 410, display: 'flex', justifyContent: 'center', gap: 6 } },
        list.map(function (id, j) {
          return h('button', { key: id, type: 'button', role: 'tab', 'aria-selected': j === i, 'aria-label': subj(id).name, onClick: function () { go(j); },
            style: { width: j === i ? 24 : 8, height: 8, padding: 0, border: 'none', borderRadius: 999, background: j === i ? subj(id).ink : 'var(--gray-200)', cursor: 'pointer', transition: 'width 0.2s ease' } });
        })));
  }
  var SUBJECT_FULL = { maths: 'Mathématiques' };

  function IslandProgressCard(p) {
    var s = subj(p.subject);
    var pct = p.total ? Math.round(100 * (p.done || 0) / p.total) : 0;
    return h(Card, { style: { display: 'flex', flexDirection: 'column', gap: 14, padding: '18px 20px 20px' } },
      h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 } },
        h('span', { style: { display: 'flex', flexDirection: 'column', gap: 2 } },
          h('span', { style: { fontSize: 17, lineHeight: '22px', fontWeight: 900 } }, (p.done || 0) + ' villes sur ' + p.total + ' validées'),
          p.next ? h('span', { style: { fontSize: 13, lineHeight: '18px', color: 'var(--text-secondary)' } }, p.next) : null),
        h(Pill, { background: 'var(--orange-100)', color: 'var(--orange-800)', height: 32 }, h(Icon, { name: 'star', size: 16, color: 'var(--orange-500)', filled: true }), p.stars || 0)),
      h('span', { 'aria-hidden': 'true', style: { display: 'block', height: 10, borderRadius: 999, background: s.soft, overflow: 'hidden' } }, h('span', { style: { display: 'block', width: pct + '%', height: '100%', borderRadius: 999, background: s.gradient } })),
      h(Button, { brand: true, fullWidth: true, iconRight: 'arrowRight', onClick: p.onExplore, href: p.href }, p.actionLabel || "Explorer l'île"));
  }

  function ExplorerHud(p) {
    return h('header', { style: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px 8px 8px', background: 'rgba(255,255,255,0.94)', borderRadius: 20, boxShadow: 'var(--shadow-md)', fontFamily: FONT, color: 'var(--text)' } },
      h('button', { type: 'button', onClick: p.onBack, 'aria-label': p.backLabel || 'Retour aux îles', style: { width: 44, height: 44, flexShrink: 0, border: 'none', borderRadius: 14, background: 'var(--bg)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' } }, h(Icon, { name: 'chevronLeft', size: 22, strokeWidth: 2.25 })),
      h('span', { style: { flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' } },
        h('span', { style: { fontSize: 11, lineHeight: '14px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: p.subject ? subj(p.subject).ink : 'var(--primary)', whiteSpace: 'nowrap' } }, p.island),
        h('span', { 'aria-live': 'polite', style: { fontSize: 16, lineHeight: '20px', fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, p.city),
        p.region ? h('span', { style: { fontSize: 12, lineHeight: '16px', fontWeight: 500, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, p.region) : null),
      h('span', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
        h(Pill, { background: 'var(--orange-500)', color: '#fff', height: 32, style: { fontWeight: 900 } }, h(Icon, { name: 'flame', size: 16, color: '#fff' }), p.streak),
        h(Pill, { background: 'var(--gray-600)', color: '#fff', height: 32, style: { whiteSpace: 'nowrap' } }, 'Niv. ' + p.level)));
  }

  function LevelNode(p) {
    var t = ltype(p.type), boss = p.type === 'evaluation', size = boss ? 68 : 52;
    var state = p.state || 'locked', locked = state === 'locked';
    var stLabel = { completed: 'terminé' + (p.stars ? ', ' + p.stars + ' étoile' + (p.stars > 1 ? 's' : '') + ' sur 3' : ''), active: 'en cours', locked: 'verrouillé' }[state];
    var ring = boss ? '0 0 0 4px #fff, 0 0 0 8px ' + (locked ? 'var(--gray-200)' : t.ring) + ', 0 6px 0 4px rgba(9,17,34,0.14)' : '0 0 0 4px #fff, 0 5px 0 3px rgba(9,17,34,0.14)';
    return h('span', { style: { position: 'relative', width: size, height: size, display: 'inline-block' } },
      state === 'active' ? h('span', { className: 'tia-pulse', 'aria-hidden': 'true', style: { position: 'absolute', inset: 0, borderRadius: 999, background: t.solid } }) : null,
      h('button', { type: 'button', onClick: p.onClick, 'aria-label': t.label + ', ' + p.title + ', ' + stLabel,
        style: { position: 'absolute', inset: 0, border: 'none', padding: 0, borderRadius: 999, background: locked ? 'var(--gray-100)' : t.grad, boxShadow: ring, color: locked ? 'var(--gray-400)' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' } },
        h(Icon, { name: locked && !boss ? 'lock' : t.icon, size: boss ? 30 : 24, strokeWidth: 2 }),
        locked && boss ? h('span', { 'aria-hidden': 'true', style: { position: 'absolute', right: -4, bottom: -4, width: 24, height: 24, borderRadius: 999, background: '#fff', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' } }, h(Icon, { name: 'lock', size: 14, strokeWidth: 2.25 })) : null,
        state === 'completed' ? h('span', { 'aria-hidden': 'true', style: { position: 'absolute', right: -6, top: -6, width: 22, height: 22, borderRadius: 999, background: '#fff', color: t.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' } }, h(Icon, { name: 'check', size: 14, strokeWidth: 3 })) : null),
      state === 'completed' && p.stars ? h('span', { 'aria-hidden': 'true', style: { position: 'absolute', left: '50%', top: size + 8, transform: 'translateX(-50%)' } }, h(Stars, { value: p.stars, outline: true, gap: 1 })) : null);
  }

  function MapAvatar(p) {
    return h('span', { className: 'tia-bob', 'aria-hidden': 'true', style: { width: 44, display: 'inline-flex', flexDirection: 'column', alignItems: 'center', fontFamily: FONT } },
      h('span', { style: { width: 40, height: 40, boxSizing: 'border-box', borderRadius: 999, background: 'var(--primary)', border: '3px solid #fff', boxShadow: 'var(--shadow-lg)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900 } }, (p.initial || 'L').slice(0, 1)),
      h('span', { style: { width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: '9px solid #fff', marginTop: -1 } }));
  }

  function CityBanner(p) {
    var st = p.status || 'current';
    var color = st === 'done' ? 'var(--green-800)' : st === 'locked' ? 'var(--text-secondary)' : st === 'consolidate' ? 'var(--orange-800)' : 'var(--red-600)';
    return h('span', { style: { height: 32, padding: '0 12px', display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 999, background: st === 'consolidate' ? 'var(--orange-100)' : '#fff', boxShadow: 'var(--shadow-md)', color: color, fontFamily: FONT, fontSize: 13, fontWeight: 900, whiteSpace: 'nowrap' } },
      h(Icon, { name: st === 'done' ? 'checkCircle' : st === 'consolidate' ? 'retry' : 'flag', size: 16, strokeWidth: 2.25 }), p.name);
  }

  function RegionSign(p) {
    return h('span', { style: { display: 'inline-flex', flexDirection: 'column', padding: '8px 12px', borderRadius: 16, background: 'rgba(255,255,255,0.85)', boxShadow: 'var(--shadow-sm)', fontFamily: FONT } },
      h(Overline, { color: p.color || 'var(--blue-600)' }, 'Région ' + p.index),
      h('span', { style: { fontSize: 14, lineHeight: '18px', fontWeight: 900, color: 'var(--text)' } }, p.name));
  }

  function WorldMap(p) {
    var levels = p.levels || [], dx = p.step || 82, left = 36, height = p.height || 844, cy = p.centerY || 452, amp = p.amplitude || 66;
    var pos = levels.map(function (l, i) { return { x: left + i * dx + (l.gapBefore || 0), y: cy + amp * Math.sin(i * 1.05 + 0.2) }; });
    var extra = 0; levels.forEach(function (l, i) { if (l.gapBefore) { extra += l.gapBefore; } pos[i].x = left + i * dx + extra; });
    var width = (pos.length ? pos[pos.length - 1].x : 0) + 120;
    var activeIdx = levels.findIndex(function (l) { return l.state === 'active'; });
    function curve(pts) { if (!pts.length) return ''; var d = 'M ' + pts[0].x + ' ' + pts[0].y; for (var i = 1; i < pts.length; i++) { var mx = (pts[i - 1].x + pts[i].x) / 2; d += ' C ' + mx + ' ' + pts[i - 1].y + ', ' + mx + ' ' + pts[i].y + ', ' + pts[i].x + ' ' + pts[i].y; } return d; }
    var ext = [{ x: -40, y: cy + amp * Math.sin(-1.05 + 0.2) }].concat(pos, [{ x: width + 40, y: cy }]);
    var cut = activeIdx >= 0 ? activeIdx + 2 : ext.length;
    var done = ext.slice(0, cut), todo = ext.slice(cut - 1);
    var waves = [];
    [220, 262, 690, 730, 770].forEach(function (y, r) { for (var x = (r % 2) * 45; x < width; x += 90) waves.push(h('path', { key: r + '-' + x, d: 'M' + x + ' ' + y + ' q 10 -8 20 0 t 20 0', fill: 'none', stroke: '#fff', strokeWidth: 3, strokeLinecap: 'round', opacity: 0.8 })); });
    return h('div', { role: 'region', 'aria-label': p.label || 'Carte de l’île', style: { position: 'relative', width: '100%', height: height, overflowX: 'auto', overflowY: 'hidden', fontFamily: FONT } },
      h('div', { style: { position: 'relative', width: width, height: height } },
        h('svg', { width: width, height: height, 'aria-hidden': 'true', style: { position: 'absolute', left: 0, top: 0, display: 'block' } },
          h('defs', null, h('linearGradient', { id: 'tia-sea', x1: 0, y1: 0, x2: 0, y2: 1 }, h('stop', { offset: 0, stopColor: 'var(--azure-100)' }), h('stop', { offset: 1, stopColor: 'var(--azure-200)' }))),
          h('rect', { width: width, height: height, fill: 'url(#tia-sea)' }), waves,
          h('rect', { x: -40, y: cy - 150, width: width + 80, height: 300, rx: 140, fill: 'var(--green-200)' }),
          h('rect', { x: -40, y: cy - 160, width: width + 80, height: 296, rx: 140, fill: 'var(--green-100)' }),
          h('path', { d: curve(todo), fill: 'none', stroke: 'var(--gray-200)', strokeWidth: 18, strokeLinecap: 'round' }),
          h('path', { d: curve(todo), fill: 'none', stroke: '#fff', strokeWidth: 3, strokeLinecap: 'round', strokeDasharray: '1 12' }),
          h('path', { d: curve(done), fill: 'none', stroke: 'var(--orange-300)', strokeWidth: 18, strokeLinecap: 'round' }),
          h('path', { d: curve(done), fill: 'none', stroke: '#fff', strokeWidth: 3, strokeLinecap: 'round', strokeDasharray: '1 12' })),
        (p.cities || []).map(function (c) { var at = pos[c.startIndex] || { x: 0 }; return h('span', { key: 'c' + c.name, style: { position: 'absolute', left: at.x - 20, top: cy - 190 } }, h(CityBanner, { name: c.name, status: c.status })); }),
        levels.map(function (l, i) {
          var size = l.type === 'evaluation' ? 68 : 52;
          return h('span', { key: l.id, style: { position: 'absolute', left: pos[i].x - size / 2, top: pos[i].y - size / 2 } },
            h(LevelNode, { type: l.type, state: l.state, stars: l.stars, title: l.title, onClick: function () { if (p.onSelect) p.onSelect(l); } }));
        }),
        activeIdx >= 0 ? h('span', { style: { position: 'absolute', left: pos[activeIdx].x - 22, top: pos[activeIdx].y - 82 } }, h(MapAvatar, { initial: p.initial })) : null));
  }

  function LevelTypePill(p) {
    var t = ltype(p.type);
    return h('span', { style: { alignSelf: 'flex-start', height: 30, padding: '0 12px 0 8px', display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 999, background: t.soft, color: t.ink, fontFamily: FONT, fontSize: 13, fontWeight: 900 } },
      h('span', { style: { width: 20, height: 20, borderRadius: 999, background: t.grad, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, h(Icon, { name: t.icon, size: 12, strokeWidth: 2.5 })), t.label);
  }

  function LevelSheet(p) {
    var t = ltype(p.type), locked = !!p.lockedMessage;
    var big = { flex: '1 1 0', height: 52, borderRadius: 16, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: FONT, fontSize: 16, fontWeight: 700, cursor: locked ? 'default' : 'pointer' };
    var ecritFirst = (p.lastMode || 'ecrit') === 'ecrit';
    function launch(mode, primaryBtn) {
      var style = locked ? { background: 'var(--gray-100)', color: 'var(--gray-400)' } : primaryBtn ? { background: 'var(--primary)', color: '#fff', boxShadow: 'var(--shadow-brand)', flexGrow: 1.3 } : { background: 'var(--primary-soft)', color: 'var(--blue-600)' };
      return h('button', { key: mode, type: 'button', disabled: locked, 'aria-disabled': locked, onClick: mode === 'ecrit' ? p.onWritten : p.onVoice, style: assign({}, big, style) },
        h(Icon, { name: mode === 'ecrit' ? 'keyboard' : 'mic', size: 20 }), mode === 'ecrit' ? 'À l’écrit' : 'À la voix');
    }
    return h('section', { role: 'dialog', 'aria-modal': 'true', 'aria-label': p.title, style: { display: 'flex', flexDirection: 'column', gap: 16, padding: '12px 20px 32px', background: '#fff', borderRadius: '28px 28px 0 0', boxShadow: '0 -12px 32px rgba(9,17,34,0.12)', fontFamily: FONT, color: 'var(--text)' } },
      h('span', { 'aria-hidden': 'true', style: { alignSelf: 'center', width: 44, height: 5, borderRadius: 999, background: 'var(--gray-200)' } }),
      h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } }, h(LevelTypePill, { type: p.type }),
        h('button', { type: 'button', onClick: p.onClose, 'aria-label': 'Fermer', style: { width: 40, height: 40, border: 'none', borderRadius: 999, background: 'var(--bg)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' } }, h(Icon, { name: 'close', size: 20, strokeWidth: 2.25 }))),
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: 4 } },
        h('h2', { style: { margin: 0, fontSize: 26, lineHeight: '32px', fontWeight: 900 } }, p.title),
        p.where ? h('span', { style: { fontSize: 14, lineHeight: '20px', color: 'var(--text-secondary)' } }, p.where) : null),
      h('div', { style: { display: 'flex', gap: 8 } },
        h(Pill, { background: 'var(--bg)', color: 'var(--gray-600)', height: 32 }, h(Icon, { name: 'clock', size: 16, strokeWidth: 2 }), '~' + p.minutes + ' min'),
        h(Pill, { background: 'var(--orange-100)', color: 'var(--orange-800)', height: 32 }, h(Stars, { value: p.stars || 0 }))),
      (p.objectives || []).length ? h('section', { 'aria-label': 'Objectifs', style: { display: 'flex', flexDirection: 'column', gap: 10 } },
        h(Overline, { color: 'var(--text-secondary)' }, 'Objectifs'),
        h('ul', { style: { margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 } },
          p.objectives.map(function (o, i) { return h('li', { key: i, style: { display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 15, lineHeight: '22px', color: 'var(--gray-700)' } }, h('span', { style: { flexShrink: 0, marginTop: 1, color: t.solid, display: 'flex' } }, h(Icon, { name: 'checkCircle', size: 20, strokeWidth: 2 })), o); }))) : null,
      p.rule ? h('p', { style: { margin: 0, display: 'flex', gap: 10, padding: '12px 14px', borderRadius: 16, background: 'var(--red-100)', color: 'var(--red-700)', fontSize: 14, lineHeight: '20px', fontWeight: 500 } }, h('span', { style: { flexShrink: 0, display: 'flex', color: 'var(--red-600)' } }, h(Icon, { name: 'crown', size: 18, strokeWidth: 2 })), p.rule) : null,
      locked ? h('p', { style: { margin: 0, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 16, background: 'var(--bg)', color: 'var(--gray-600)', fontSize: 14, lineHeight: '20px', fontWeight: 700 } }, h('span', { style: { flexShrink: 0, display: 'flex', color: 'var(--gray-400)' } }, h(Icon, { name: 'lock', size: 18, strokeWidth: 2 })), p.lockedMessage) : null,
      h('div', { style: { display: 'flex', gap: 10 } }, ecritFirst ? [launch('ecrit', true), launch('vocal', false)] : [launch('vocal', true), launch('ecrit', false)]),
      locked ? null : h('p', { style: { margin: '-4px 0 0', textAlign: 'center', fontSize: 12, lineHeight: '16px', color: 'var(--text-secondary)' } }, 'Dernier mode utilisé : ' + (ecritFirst ? 'à l’écrit' : 'à la voix')));
  }

  function IslandBackdrop(p) {
    var s = subj(p.subject);
    return h('div', { style: { position: 'relative', width: '100%', height: p.height || '100%', overflow: 'hidden', background: 'linear-gradient(180deg, ' + s.soft + ' 0%, ' + s.soft + ' 12%, var(--bg) 62%)' } },
      h('svg', { 'aria-hidden': 'true', width: 390, height: 220, viewBox: '0 0 390 220', style: { position: 'absolute', left: 0, top: 0, display: 'block', opacity: 0.55 } },
        h('g', { fill: 'none', stroke: 'currentColor', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round', style: { color: SUBJECT_TINT[p.subject] || 'var(--red-200)' } },
          h('polygon', { points: '24,40 52,40 24,68' }), h('path', { d: 'M310 26v18M301 35h18' }), h('path', { d: 'M44 170l12 12M56 170l-12 12' }), h('circle', { cx: 360, cy: 176, r: 10 }))),
      h('div', { 'aria-hidden': 'true', style: { position: 'absolute', right: -26, top: 108, transform: 'scale(0.34)', transformOrigin: 'right top', opacity: 0.9 } }, h(IslandIllustration, { subject: p.subject, idSuffix: '-bd' })),
      h('div', { style: { position: 'relative', height: '100%' } }, p.children));
  }
  var SUBJECT_TINT = { maths: 'var(--red-200)', francais: 'var(--blue-200)', 'histoire-geo': 'var(--green-200)', 'physique-chimie': 'var(--violet-200)', svt: 'var(--orange-200)', anglais: 'var(--cyan-200)' };

  function LevelProgressHeader(p) {
    var t = ltype(p.type), total = p.total || 4, segs = [];
    for (var i = 0; i < total; i++) segs.push(h('span', { key: i, style: { flex: '1 1 0', height: 6, borderRadius: 999, background: i < (p.step || 0) ? t.solid : '#fff' } }));
    var unit = { lecon: 'Étape', exercices: 'Exercice', evaluation: 'Question' }[p.type] || 'Étape';
    var mode = p.mode || 'ecrit';
    function tog(m, icon, label) { var on = mode === m; return h('button', { key: m, type: 'button', 'aria-pressed': on, 'aria-label': label, onClick: function () { if (p.onModeChange) p.onModeChange(m); }, style: { width: 40, height: 40, border: 'none', borderRadius: 999, background: on ? 'var(--primary)' : 'transparent', color: on ? '#fff' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' } }, h(Icon, { name: icon, size: 20 })); }
    return h('header', { style: { display: 'flex', flexDirection: 'column', gap: 12, fontFamily: FONT, color: 'var(--text)' } },
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
        h('button', { type: 'button', onClick: p.onBack, 'aria-label': 'Revenir à la carte', style: { width: 44, height: 44, flexShrink: 0, border: 'none', borderRadius: 14, background: '#fff', boxShadow: 'var(--shadow-sm)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' } }, h(Icon, { name: 'chevronLeft', size: 22, strokeWidth: 2.25 })),
        h('span', { style: { flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 } }, h(LevelTypePill, { type: p.type }), h('span', { style: { fontSize: 20, lineHeight: '24px', fontWeight: 900 } }, p.title)),
        h('div', { role: 'group', 'aria-label': 'Mode de discussion', style: { flexShrink: 0, display: 'flex', gap: 2, padding: 3, borderRadius: 999, background: '#fff', boxShadow: 'var(--shadow-sm)' } }, tog('ecrit', 'keyboard', 'À l’écrit'), tog('vocal', 'mic', 'À la voix'))),
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 232 } },
        h('span', { style: { fontSize: 12, lineHeight: '16px', fontWeight: 700, color: t.ink } }, unit + ' ' + p.step + ' sur ' + total + (p.city ? ' · ' + p.city : '')),
        h('span', { 'aria-hidden': 'true', style: { display: 'flex', gap: 4 } }, segs)));
  }

  function VoiceBoardCard(p) {
    return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 10, padding: 16, background: '#fff', borderRadius: 24, boxShadow: 'var(--shadow-md)', fontFamily: FONT, color: 'var(--text)' } },
      h(Overline, { color: 'var(--text-secondary)' }, p.title || 'Au tableau du tuteur'),
      (p.lines || []).map(function (l, i) {
        var done = l.state === 'done', todo = l.state === 'todo';
        return h('span', { key: i, style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: i === 0 ? 26 : 20, lineHeight: i === 0 ? '32px' : '26px', fontWeight: 900, color: done ? 'var(--green-700)' : todo ? 'var(--gray-400)' : 'var(--text)' } }, done ? h(Icon, { name: 'check', size: 20, strokeWidth: 3 }) : null, l.expr);
      }));
  }

  function LevelResultCard(p) {
    var t = ltype(p.type), ok = p.validated !== false;
    var kicker = ok ? (t.label + ' · ' + (p.type === 'evaluation' ? 'ville validée' : 'réussie')) : (t.label + ' · à consolider');
    return h('section', { 'aria-label': 'Résultat', style: { position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '28px 24px 24px', borderRadius: 28, background: ok ? TONES.green : 'linear-gradient(160deg, var(--orange-300) 0%, var(--orange-500) 50%, var(--orange-600) 100%)', color: '#fff', textAlign: 'center', boxShadow: 'var(--shadow-lg)', fontFamily: FONT } },
      h('span', { 'aria-hidden': 'true', style: { position: 'absolute', left: -40, top: -40, width: 140, height: 140, borderRadius: 999, background: 'rgba(255,255,255,0.12)' } }),
      h('span', { 'aria-hidden': 'true', style: { position: 'absolute', right: -50, bottom: -60, width: 180, height: 180, borderRadius: 999, background: 'rgba(255,255,255,0.10)' } }),
      h(Overline, { color: 'rgba(255,255,255,0.92)', style: { position: 'relative' } }, kicker),
      h('span', { style: { position: 'relative' } }, h(Stars, { value: p.stars || 0, size: 40, onColor: true, gap: 4 })),
      h('h1', { style: { position: 'relative', margin: 0, fontSize: 30, lineHeight: '36px', fontWeight: 900 } }, p.headline || (ok ? 'Bien joué !' : 'Presque !')),
      p.message ? h('p', { style: { position: 'relative', margin: 0, fontSize: 15, lineHeight: '22px', fontWeight: 500, opacity: 0.95 } }, p.message) : null,
      h('div', { style: { position: 'relative', display: 'flex', gap: 8 } },
        p.score ? h(Pill, { background: VEIL, color: '#fff', height: 34, style: { fontSize: 15, fontWeight: 900 } }, p.score) : null,
        h(Pill, { background: '#fff', color: 'var(--green-800)', height: 34, style: { fontSize: 15, fontWeight: 900 } }, '+' + (p.xp || 0) + ' XP')));
  }

  function TutorFeedback(p) {
    var ok = p.kind !== 'review';
    return h('div', { style: { display: 'flex', gap: 12, padding: '14px 16px', borderRadius: 20, background: ok ? 'var(--green-100)' : 'var(--orange-100)', fontFamily: FONT } },
      h('span', { style: { flexShrink: 0, width: 32, height: 32, borderRadius: 999, background: ok ? 'var(--green-700)' : 'var(--orange-500)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, h(Icon, { name: ok ? 'check' : 'retry', size: 18, strokeWidth: ok ? 3 : 2.25 })),
      h('span', { style: { display: 'flex', flexDirection: 'column', gap: 2 } },
        h(Overline, { color: ok ? 'var(--green-700)' : 'var(--orange-800)' }, p.title || (ok ? 'Réussi' : 'À revoir')),
        h('span', { style: { fontSize: 15, lineHeight: '22px', color: 'var(--gray-700)' } }, p.children)));
  }



  window.TutorIA = {
    Icon: Icon, Logo: Logo, Button: Button, IconButton: IconButton, SegmentedControl: SegmentedControl, ModeToggle: ModeToggle,
    BottomNav: BottomNav, Switch: Switch, GoalStepper: GoalStepper, StatusChip: StatusChip, ProgressRing: ProgressRing, Quote: Quote,
    SubjectCard: SubjectCard, StreakCard: StreakCard, LevelCard: LevelCard, ResumeCard: ResumeCard, GoalCard: GoalCard, TopicCard: TopicCard,
    ChatBubble: ChatBubble, TipCard: TipCard, ChatInput: ChatInput, VoiceVisualizer: VoiceVisualizer, CallControls: CallControls,
    PanelHeader: PanelHeader, VisualPanel: VisualPanel, MathGraph: MathGraph, Whiteboard: Whiteboard,
    CallTopBar: CallTopBar, VoiceAvatar: VoiceAvatar, VoiceStatus: VoiceStatus, LiveCaptions: LiveCaptions, CallDock: CallDock,
    DailyReviewCard: DailyReviewCard, ChapterRow: ChapterRow, SessionProgress: SessionProgress, AnswerOption: AnswerOption, QuizCard: QuizCard, TallyChips: TallyChips,
    KpiCard: KpiCard, BarChart: BarChart, LineChart: LineChart, Heatmap: Heatmap, SubjectProgressRow: SubjectProgressRow, InsightList: InsightList,
    ChildSwitcher: ChildSwitcher, HeroCard: HeroCard, AlertCard: AlertCard, AdviceCard: AdviceCard, SubjectProgressCard: SubjectProgressCard,
    SessionSummaryCard: SessionSummaryCard, SettingRow: SettingRow,
    TextField: TextField, PasswordRules: PasswordRules, Checkbox: Checkbox, OrDivider: OrDivider, AuthProviderButtons: AuthProviderButtons, AuthHero: AuthHero, ProfileChoiceCard: ProfileChoiceCard, SubjectCluster: SubjectCluster, StepHeader: StepHeader, GradePicker: GradePicker, SelfAssessmentRow: SelfAssessmentRow, GoalTile: GoalTile, DurationPicker: DurationPicker, ChoiceRow: ChoiceRow, ToggleChip: ToggleChip, ParentCodeCard: ParentCodeCard, StepList: StepList, PlanRow: PlanRow,
    Stars: Stars, IslandIllustration: IslandIllustration, IslandCarousel: IslandCarousel, IslandProgressCard: IslandProgressCard, ExplorerHud: ExplorerHud, LevelNode: LevelNode, MapAvatar: MapAvatar, CityBanner: CityBanner, RegionSign: RegionSign, WorldMap: WorldMap, LevelTypePill: LevelTypePill, LevelSheet: LevelSheet, IslandBackdrop: IslandBackdrop, LevelProgressHeader: LevelProgressHeader, VoiceBoardCard: VoiceBoardCard, LevelResultCard: LevelResultCard, TutorFeedback: TutorFeedback,
    LEVEL_TYPES: LEVEL_TYPES, SUBJECTS: SUBJECTS, ICONS: ICONS, VISUAL_KINDS: VISUAL_KINDS
  };
})();
