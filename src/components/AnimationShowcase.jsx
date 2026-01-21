import { useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform
} from 'framer-motion';

const demos = [
  { id: 'stagger', name: '逐词显现' },
  { id: 'sequence', name: '瀑布入场' },
  { id: 'hover', name: '悬停交互' },
  { id: 'shared', name: '共享元素' },
  { id: 'layout', name: '布局切换' },
  { id: 'accordion', name: '手风琴' },
  { id: 'reveal', name: '遮罩揭示' },
  { id: 'parallax', name: '视差滚动' },
  { id: 'mouse', name: '鼠标视差' },
  { id: 'glass', name: '玻璃堆叠' },
  { id: 'feedback', name: '状态反馈' },
  { id: 'drawer', name: '抽屉模态' },
  { id: 'sticky', name: '吸附导航' },
  { id: 'scroll', name: '滚动触发' },
  { id: 'progress', name: '滚动叙事' }
];

function AnimationShowcase() {
  const [activeDemo, setActiveDemo] = useState('stagger');

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.4em] text-slate-400">Motion Lab</div>
          <h2 className="text-2xl font-semibold text-slate-900 mt-2">动效演示实验室</h2>
          <p className="text-sm text-slate-500 mt-1">
            点击下方标签切换不同的 Framer Motion 与 CSS 交互展示。
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
          <span className="px-3 py-1 rounded-full border border-slate-200 bg-white">白色卡片</span>
          <span className="px-3 py-1 rounded-full border border-slate-200 bg-white">灰色背景</span>
          <span className="px-3 py-1 rounded-full border border-slate-200 bg-white">现代动效</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="px-6 pt-6 pb-4 flex flex-wrap gap-2">
          {demos.map(demo => (
            <button
              key={demo.id}
              onClick={() => setActiveDemo(demo.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                activeDemo === demo.id
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900'
              }`}
            >
              {demo.name}
            </button>
          ))}
        </div>

        <div className="flex-1 p-6 pt-2">
          <div className="relative h-full w-full rounded-2xl bg-[#F8F8F8] overflow-hidden">
            {activeDemo === 'stagger' && <StaggeredTextDemo key="stagger" />}
            {activeDemo === 'sequence' && <SequentialEntranceDemo key="sequence" />}
            {activeDemo === 'hover' && <HoverEffectsDemo key="hover" />}
            {activeDemo === 'shared' && <SharedElementDemo key="shared" />}
            {activeDemo === 'layout' && <LayoutSwitchDemo key="layout" />}
            {activeDemo === 'accordion' && <AccordionDemo key="accordion" />}
            {activeDemo === 'reveal' && <MaskRevealDemo key="reveal" />}
            {activeDemo === 'parallax' && <ParallaxDemo key="parallax" />}
            {activeDemo === 'mouse' && <MouseParallaxDemo key="mouse" />}
            {activeDemo === 'glass' && <GlassStackDemo key="glass" />}
            {activeDemo === 'feedback' && <FeedbackDemo key="feedback" />}
            {activeDemo === 'drawer' && <DrawerModalDemo key="drawer" />}
            {activeDemo === 'sticky' && <StickyDemo key="sticky" />}
            {activeDemo === 'scroll' && <ScrollTriggerDemo key="scroll" />}
            {activeDemo === 'progress' && <ProgressDrivenDemo key="progress" />}
          </div>
        </div>
      </div>
    </div>
  );
}

function StaggeredTextDemo() {
  const title = 'Stitch stories into modern brands';
  const words = title.split(' ');

  return (
    <div className="relative h-full w-full flex flex-col items-start justify-center px-8 py-6">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-10 top-0 h-full w-px bg-gradient-to-b from-transparent via-sky-500/40 to-transparent" />
        <div className="absolute right-20 top-0 h-full w-px bg-gradient-to-b from-transparent via-cyan-500/40 to-transparent" />
        <div className="absolute inset-x-0 top-16 h-px bg-gradient-to-r from-transparent via-sky-400/30 to-transparent" />
      </div>

      <div className="relative z-10 max-w-2xl">
        <div className="text-xs uppercase tracking-[0.35em] text-slate-400 mb-4">Staggered</div>
        <h3 className="text-4xl md:text-5xl font-semibold text-slate-900 leading-tight">
          {words.map((word, index) => (
            <motion.span
              key={`${word}-${index}`}
              initial={{ opacity: 0, filter: 'blur(6px)', y: 12 }}
              animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block mr-2"
            >
              {word}
            </motion.span>
          ))}
        </h3>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="text-sm text-slate-500 mt-4 max-w-xl"
        >
          标题逐词淡入并带有轻微模糊上浮，强调阅读节奏感与视觉聚焦。
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="mt-6 flex flex-wrap gap-3"
        >
          <button className="px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-medium transition-all hover:-translate-y-0.5 hover:bg-slate-800">
            主要动作
          </button>
          <button className="px-4 py-2 rounded-full border border-slate-200 text-slate-600 text-sm font-medium transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900">
            次要动作
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.3 }}
          className="mt-8 h-36 w-full rounded-2xl bg-gradient-to-br from-white via-slate-50 to-slate-100 border border-slate-200 shadow-sm"
        />
      </div>
    </div>
  );
}

function SequentialEntranceDemo() {
  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.18
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="h-full w-full flex flex-col gap-4 p-8"
    >
      <motion.div variants={item} className="text-xs uppercase tracking-[0.35em] text-slate-400">
        Sequence
      </motion.div>
      <motion.h3 variants={item} className="text-3xl font-semibold text-slate-900">
        模块化内容依次进入视野
      </motion.h3>
      <motion.p variants={item} className="text-sm text-slate-500 max-w-xl">
        使用统一的延迟节奏让内容在视觉上更有层次感，避免信息拥挤。
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        {['文案卡片', '按钮组', '数据图', '封面图'].map(label => (
          <motion.div
            key={label}
            variants={item}
            className="rounded-2xl bg-white border border-slate-200/70 p-4 shadow-sm"
          >
            <div className="h-24 rounded-xl bg-gradient-to-br from-slate-100 via-white to-slate-50 border border-slate-200/70" />
            <div className="mt-3 text-sm font-medium text-slate-700">{label}</div>
            <div className="text-xs text-slate-400 mt-1">延迟淡入 + 轻微上浮</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function HoverEffectsDemo() {
  const [ripples, setRipples] = useState([]);

  const handleRipple = event => {
    const rect = event.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    const id = Date.now();

    setRipples(prev => [...prev, { id, x, y, size }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== id));
    }, 500);
  };

  return (
    <div className="h-full w-full flex flex-col items-start justify-center gap-6 px-8">
      <div className="text-xs uppercase tracking-[0.35em] text-slate-400">Hover</div>
      <h3 className="text-3xl font-semibold text-slate-900">悬停反馈强化可点击感</h3>
      <p className="text-sm text-slate-500 max-w-xl">
        悬停上浮、缩放、按压与涟漪点击，让交互更有力度与确认感。
      </p>
      <div className="flex flex-wrap gap-3">
        <button className="px-5 py-3 rounded-full bg-slate-900 text-white text-sm font-medium transition-all duration-300 hover:-translate-y-1 hover:bg-slate-800">
          主按钮
        </button>
        <button className="px-5 py-3 rounded-full bg-white text-slate-600 text-sm font-medium border border-slate-200 transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:text-slate-900">
          次按钮
        </button>
        <button className="px-5 py-3 rounded-full bg-slate-100 text-slate-600 text-sm font-medium transition-all duration-300 hover:-translate-y-1 hover:bg-slate-200">
          轻量按钮
        </button>
        <motion.button
          whileTap={{ scale: 0.94 }}
          className="px-5 py-3 rounded-full bg-white text-slate-600 text-sm font-medium border border-slate-200 transition-colors hover:border-slate-300"
        >
          按压反馈
        </motion.button>
        <button
          onClick={handleRipple}
          className="relative overflow-hidden px-5 py-3 rounded-full bg-slate-900 text-white text-sm font-medium transition-colors hover:bg-slate-800"
        >
          点击涟漪
          {ripples.map(ripple => (
            <span
              key={ripple.id}
              className="absolute rounded-full bg-white/40 animate-[ripple_0.5s_ease-out]"
              style={{ width: ripple.size, height: ripple.size, left: ripple.x, top: ripple.y }}
            />
          ))}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        {['快速反馈', '层级清晰', '视觉轻量'].map(text => (
          <div
            key={text}
            className="rounded-2xl bg-white border border-slate-200/70 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
          >
            <div className="h-16 rounded-xl bg-gradient-to-br from-slate-100 via-white to-slate-50 border border-slate-200/70" />
            <div className="mt-3 text-sm font-medium text-slate-700">{text}</div>
            <div className="text-xs text-slate-400 mt-1">Hover 轻微上浮</div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <div className="rounded-2xl bg-white border border-slate-200/70 p-3 shadow-sm w-40 overflow-hidden">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Zoom</div>
          <div className="mt-3 h-20 rounded-xl overflow-hidden">
            <div className="h-full w-full bg-[linear-gradient(120deg,_#f8fafc_0%,_#e2e8f0_45%,_#fff_90%)] transition-transform duration-300 hover:scale-110" />
          </div>
          <div className="text-xs text-slate-400 mt-2">缩放聚焦</div>
        </div>
        <style>{`
          @keyframes ripple {
            0% { transform: scale(0); opacity: 0.5; }
            100% { transform: scale(2.5); opacity: 0; }
          }
        `}</style>
      </div>
    </div>
  );
}

function SharedElementDemo() {
  const cards = [
    { id: 'a', title: '丝线肌理', tone: 'Sky' },
    { id: 'b', title: '细节纹理', tone: 'Mint' },
    { id: 'c', title: '工艺故事', tone: 'Sand' }
  ];
  const [activeCard, setActiveCard] = useState(null);

  return (
    <div className="relative h-full w-full p-8">
      <div className="text-xs uppercase tracking-[0.35em] text-slate-400">Shared Element</div>
      <h3 className="text-3xl font-semibold text-slate-900 mt-3">卡片共享元素放大</h3>
      <p className="text-sm text-slate-500 mt-2 max-w-xl">
        点击卡片触发共享元素动画，形成从缩略到详情的连续过渡。
      </p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map(card => (
          <motion.button
            key={card.id}
            layoutId={`card-${card.id}`}
            onClick={() => setActiveCard(card)}
            className="rounded-2xl bg-white border border-slate-200/70 p-4 shadow-sm text-left"
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          >
            <div className="text-xs uppercase tracking-[0.35em] text-slate-400">{card.tone}</div>
            <div className="mt-3 h-20 rounded-xl bg-gradient-to-br from-slate-100 via-white to-slate-50 border border-slate-200/70" />
            <div className="mt-3 text-sm font-medium text-slate-700">{card.title}</div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {activeCard ? (
          <motion.div
            className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              layoutId={`card-${activeCard.id}`}
              className="w-full max-w-xl rounded-3xl bg-white border border-slate-200 shadow-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.35em] text-slate-400">
                    {activeCard.tone}
                  </div>
                  <div className="text-2xl font-semibold text-slate-900 mt-2">{activeCard.title}</div>
                </div>
                <button
                  onClick={() => setActiveCard(null)}
                  className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  ×
                </button>
              </div>
              <div className="mt-4 h-48 rounded-2xl bg-gradient-to-br from-slate-100 via-white to-slate-50 border border-slate-200/70" />
              <div className="text-sm text-slate-500 mt-4">
                共享元素让卡片在视觉上保持连续性，适合详情展开与转场。
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function LayoutSwitchDemo() {
  const [mode, setMode] = useState('grid');
  const items = ['排版', '层次', '节奏', '密度', '动线', '分区'];

  return (
    <div className="h-full w-full p-8 flex flex-col gap-4">
      <div className="text-xs uppercase tracking-[0.35em] text-slate-400">Layout</div>
      <div className="flex items-center justify-between">
        <h3 className="text-3xl font-semibold text-slate-900">布局切换动画</h3>
        <div className="flex items-center gap-2">
          {['grid', 'stack'].map(value => (
            <button
              key={value}
              onClick={() => setMode(value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                mode === value
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {value === 'grid' ? '网格' : '堆叠'}
            </button>
          ))}
        </div>
      </div>
      <p className="text-sm text-slate-500 max-w-xl">
        通过 layout 动画自然过渡网格与堆叠布局，适合卡片切换场景。
      </p>

      <motion.div
        layout
        className={`grid gap-4 ${mode === 'grid' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'}`}
      >
        {items.map(item => (
          <motion.div
            key={item}
            layout
            className="rounded-2xl bg-white border border-slate-200/70 p-4 shadow-sm"
          >
            <div className="h-20 rounded-xl bg-gradient-to-br from-slate-100 via-white to-slate-50 border border-slate-200/70" />
            <div className="mt-3 text-sm font-medium text-slate-700">{item}</div>
            <div className="text-xs text-slate-400 mt-1">布局平滑过渡</div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

function AccordionDemo() {
  const items = [
    { title: '动效节奏', content: '通过时间轴控制层层展开，保持呼吸感。' },
    { title: '内容密度', content: '折叠信息以减少视觉负担，突出关键点。' },
    { title: '交互反馈', content: '点击即响应，形成清晰的操作回路。' }
  ];
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="h-full w-full p-8 flex flex-col gap-4">
      <div className="text-xs uppercase tracking-[0.35em] text-slate-400">Accordion</div>
      <h3 className="text-3xl font-semibold text-slate-900">折叠手风琴</h3>
      <p className="text-sm text-slate-500 max-w-xl">
        高度动画 + 透明度过渡，适合 FAQ 与参数说明场景。
      </p>
      <div className="mt-2 space-y-3">
        {items.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={item.title} className="rounded-2xl bg-white border border-slate-200/70 p-4 shadow-sm">
              <button
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
                className="w-full flex items-center justify-between text-left"
              >
                <span className="text-sm font-medium text-slate-700">{item.title}</span>
                <span className="text-slate-400">{isOpen ? '−' : '+'}</span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="text-sm text-slate-500 mt-3">{item.content}</div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MaskRevealDemo() {
  const [seed, setSeed] = useState(0);

  return (
    <div className="h-full w-full p-8 flex flex-col gap-4">
      <div className="text-xs uppercase tracking-[0.35em] text-slate-400">Reveal</div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-3xl font-semibold text-slate-900">遮罩揭示效果</h3>
          <p className="text-sm text-slate-500 max-w-xl mt-2">
            使用 clipPath 模拟画面遮罩打开的经典入场方式。
          </p>
        </div>
        <button
          onClick={() => setSeed(prev => prev + 1)}
          className="px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-medium transition-all hover:-translate-y-0.5 hover:bg-slate-800"
        >
          重新播放
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        {['品牌主视觉', '产品特写'].map(label => (
          <motion.div
            key={label}
            initial={{ clipPath: 'inset(0 0 100% 0 round 28px)' }}
            animate={{ clipPath: 'inset(0 0 0% 0 round 28px)' }}
            transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1], delay: label === '产品特写' ? 0.15 : 0 }}
            className="rounded-2xl bg-white border border-slate-200/70 p-4 shadow-sm"
            key={`${label}-${seed}`}
          >
            <div className="relative h-44 rounded-xl overflow-hidden border border-slate-200/70">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#dbeafe_0%,_transparent_55%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(120deg,_#f8fafc_0%,_#e2e8f0_35%,_#fff_70%)] opacity-80" />
              <div className="absolute left-6 bottom-6 h-16 w-40 rounded-2xl bg-slate-900 text-white text-xs px-4 py-3 shadow-lg">
                <div className="text-[10px] uppercase tracking-[0.3em] text-white/60">Reveal</div>
                <div className="mt-1 text-sm font-medium">画面被打开</div>
              </div>
            </div>
            <div className="mt-3 text-sm font-medium text-slate-700">{label}</div>
            <div className="text-xs text-slate-400 mt-1">遮罩向下揭示</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ParallaxDemo() {
  const scrollRef = useRef(null);
  const { scrollYProgress } = useScroll({ container: scrollRef });
  const glowY = useTransform(scrollYProgress, [0, 1], ['10%', '70%']);
  const cardY = useTransform(scrollYProgress, [0, 1], ['0%', '-20%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const orbX = useTransform(scrollYProgress, [0, 1], ['15%', '60%']);
  const orbY = useTransform(scrollYProgress, [0, 1], ['75%', '25%']);

  return (
    <div className="h-full w-full p-8 flex flex-col gap-4">
      <div className="text-xs uppercase tracking-[0.35em] text-slate-400">Parallax</div>
      <h3 className="text-3xl font-semibold text-slate-900">滚动视差层</h3>
      <p className="text-sm text-slate-500 max-w-xl">
        随页面滚动触发多层速度差，形成深度与空间感。
      </p>

      <div
        ref={scrollRef}
        className="mt-2 h-[360px] overflow-y-auto rounded-2xl border border-slate-200/70 bg-white"
      >
        <div className="relative h-[700px] bg-gradient-to-b from-white via-slate-50 to-slate-100">
          <motion.div
            style={{ top: glowY }}
            className="absolute left-10 right-10 h-32 rounded-full bg-sky-400/20 blur-2xl"
          />
          <motion.div
            style={{ left: orbX, top: orbY }}
            className="absolute h-24 w-24 rounded-full bg-cyan-400/20 blur-xl"
          />
          <motion.div
            style={{ y: cardY }}
            className="absolute left-8 top-24 right-8 rounded-3xl bg-white border border-slate-200/70 shadow-lg p-6"
          >
            <div className="text-xs uppercase tracking-[0.35em] text-slate-400">Layer 01</div>
            <div className="mt-3 h-32 rounded-2xl bg-[linear-gradient(120deg,_#f8fafc_0%,_#e2e8f0_45%,_#fff_90%)] border border-slate-200/70" />
            <div className="mt-3 text-sm font-medium text-slate-700">前景卡片慢速漂移</div>
          </motion.div>
          <motion.div
            style={{ y: textY }}
            className="absolute left-10 bottom-16 max-w-sm rounded-2xl bg-slate-900 text-white p-5 shadow-xl"
          >
            <div className="text-xs uppercase tracking-[0.35em] text-white/60">Layer 02</div>
            <div className="mt-2 text-base font-medium">文本层更快移动</div>
            <div className="text-xs text-white/70 mt-2">形成不同速度的空间错位感</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function MouseParallaxDemo() {
  const ref = useRef(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const handleMove = event => {
    const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - left) / width;
    const y = (event.clientY - top) / height;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  const tiltX = useSpring(useTransform(mouseY, [0, 1], [16, -16]), {
    stiffness: 160,
    damping: 18
  });
  const tiltY = useSpring(useTransform(mouseX, [0, 1], [-16, 16]), {
    stiffness: 160,
    damping: 18
  });
  const floatX = useSpring(useTransform(mouseX, [0, 1], [-24, 24]), {
    stiffness: 120,
    damping: 16
  });
  const floatY = useSpring(useTransform(mouseY, [0, 1], [-18, 18]), {
    stiffness: 120,
    damping: 16
  });

  return (
    <div className="h-full w-full p-8 flex flex-col gap-4">
      <div className="text-xs uppercase tracking-[0.35em] text-slate-400">Mouse Parallax</div>
      <h3 className="text-3xl font-semibold text-slate-900">鼠标跟随视差</h3>
      <p className="text-sm text-slate-500 max-w-xl">
        鼠标移动产生 3D 倾斜与分层偏移，增强空间感。
      </p>

      <div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className="mt-2 flex-1 min-h-[320px] rounded-2xl border border-slate-200/70 bg-white overflow-hidden relative"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f022_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f022_1px,transparent_1px)] bg-[size:24px_24px]" />
        <motion.div
          style={{ x: floatX, y: floatY }}
          className="absolute left-12 top-10 h-36 w-36 rounded-full bg-sky-400/30 blur-2xl"
        />
        <motion.div
          style={{ x: floatX, y: floatY }}
          className="absolute right-16 bottom-10 h-40 w-40 rounded-full bg-emerald-400/20 blur-2xl"
        />

        <motion.div
          style={{ rotateX: tiltX, rotateY: tiltY, perspective: 900 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="rounded-3xl bg-white border border-slate-200 shadow-xl p-8 w-[320px]">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Tilt Card</div>
            <div className="mt-3 h-28 rounded-2xl bg-gradient-to-br from-slate-100 via-white to-slate-50 border border-slate-200/70" />
            <div className="mt-4 text-sm font-medium text-slate-700">跟随鼠标转动</div>
            <div className="text-xs text-slate-400 mt-1">通过 3D 倾斜强调深度</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function GlassStackDemo() {
  return (
    <div className="relative h-full w-full overflow-hidden glass-stack-demo">
      <style>{`
        .glass-stack-demo {
          font-family: 'Inter', sans-serif;
        }
        .glass-stack-demo .glass-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
          background-size: 400% 400%;
          animation: glass-gradient 15s ease infinite;
        }
        @keyframes glass-gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .glass-stack-demo .card-stack {
          position: relative;
          width: 320px;
          height: 400px;
        }
        .glass-stack-demo .card {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(20px) saturate(1.2);
          -webkit-backdrop-filter: blur(20px) saturate(1.2);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          transition: transform 0.4s ease-out;
          padding: 24px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          color: white;
        }
        .glass-stack-demo .card:nth-child(1) { z-index: 4; }
        .glass-stack-demo .card:nth-child(2) {
          z-index: 3;
          transform: translateY(20px) scale(0.95);
          background: rgba(255, 255, 255, 0.1);
        }
        .glass-stack-demo .card:nth-child(3) {
          z-index: 2;
          transform: translateY(40px) scale(0.9);
          background: rgba(255, 255, 255, 0.05);
        }
        .glass-stack-demo .card-stack:hover .card:nth-child(2) {
          transform: translateY(40px) scale(0.95);
        }
        .glass-stack-demo .card-stack:hover .card:nth-child(3) {
          transform: translateY(80px) scale(0.9);
        }
        .glass-stack-demo .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .glass-stack-demo .app-icon {
          width: 64px;
          height: 64px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          display: grid;
          place-items: center;
        }
        .glass-stack-demo .app-icon svg {
          width: 36px;
          height: 36px;
          fill: #ffffff;
        }
        .glass-stack-demo .add-button {
          width: 40px;
          height: 40px;
          background-color: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: #111;
          font-size: 24px;
          cursor: pointer;
        }
        .glass-stack-demo .card-body {
          margin-top: auto;
          text-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        .glass-stack-demo .card-body h2 {
          font-size: 24px;
          margin: 16px 0 8px;
        }
        .glass-stack-demo .card-body p {
          font-size: 16px;
          line-height: 1.5;
          margin: 0;
          color: rgba(255, 255, 255, 0.8);
        }
        .glass-stack-demo .card-footer {
          margin-top: 24px;
          display: flex;
          gap: 8px;
        }
        .glass-stack-demo .tag {
          background-color: rgba(255, 255, 255, 0.15);
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 14px;
        }
      `}</style>

      <div className="glass-bg" />

      <div className="relative z-10 h-full w-full flex flex-col items-center justify-center text-white">
        <div className="card-stack">
          <div className="card">
            <div className="card-header">
              <div className="app-icon">
                <svg viewBox="0 0 84 96">
                  <path d="M54.54 96H29.46C4.84 96-6.4 80.24 2.8 59.81L15.34 33.05C21.05 21.6 30.63 21.57 36.36 33.05L41.97 43.1H21.58C17.02 43.1 13.51 47.11 14.16 51.64C15.22 59.13 21.54 64.91 29.13 64.91H63.21C71.13 64.91 77.67 58.61 78.41 50.75C79.16 42.89 73.11 36.69 65.16 36.21L41.92 34.46C36.73 34.08 32.74 29.56 33.34 24.38L34.33 16.1C35.53 6.37 45.45-1.12 55.44 0.22L78.69 2.99C88.67 4.33 94.8 14.58 91.13 23.83L78.59 50.59C69.19 71.02 54.54 96 54.54 96Z" />
                </svg>
              </div>
              <div className="add-button">+</div>
            </div>
            <div className="card-body">
              <h2>Shopify Collabs</h2>
              <p>Find creators and scale your influencer marketing...</p>
            </div>
            <div className="card-footer">
              <div className="tag">Marketing</div>
              <div className="tag">Conversion</div>
            </div>
          </div>
          <div className="card" />
          <div className="card" />
        </div>
      </div>
    </div>
  );
}

function FeedbackDemo() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [morphState, setMorphState] = useState('idle');

  const shakeVariants = {
    idle: { x: 0 },
    error: { x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.4 } }
  };

  const handleSubmit = event => {
    event.preventDefault();
    setStatus('loading');
    setTimeout(() => {
      if (!email.includes('@')) {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 600);
      } else {
        setStatus('success');
        setTimeout(() => {
          setStatus('idle');
          setEmail('');
        }, 2200);
      }
    }, 800);
  };

  const triggerSkeleton = () => {
    if (showSkeleton) return;
    setShowSkeleton(true);
    setTimeout(() => setShowSkeleton(false), 1600);
  };

  const triggerMorph = () => {
    if (morphState !== 'idle') return;
    setMorphState('loading');
    setTimeout(() => setMorphState('success'), 1200);
    setTimeout(() => setMorphState('idle'), 2600);
  };

  return (
    <div className="h-full w-full p-8 flex flex-col gap-6">
      <div className="text-xs uppercase tracking-[0.35em] text-slate-400">Feedback</div>
      <h3 className="text-3xl font-semibold text-slate-900">状态反馈与确认</h3>
      <p className="text-sm text-slate-500 max-w-xl">
        抖动、骨架屏、形变按钮与 Toast 提示，构成完整的交互反馈链路。
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white border border-slate-200/70 p-5 shadow-sm">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Shake + Toast</div>
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
            <motion.div variants={shakeVariants} animate={status === 'error' ? 'error' : 'idle'}>
              <input
                type="text"
                value={email}
                onChange={event => setEmail(event.target.value)}
                placeholder="输入邮箱（无@将触发抖动）"
                className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors ${
                  status === 'error'
                    ? 'border-red-400/70 text-red-500 placeholder:text-red-300'
                    : 'border-slate-200 text-slate-700 focus:border-slate-400'
                }`}
                disabled={status === 'loading' || status === 'success'}
              />
            </motion.div>
            <motion.button
              type="submit"
              whileTap={status !== 'loading' ? { scale: 0.97 } : {}}
              className="rounded-xl bg-slate-900 text-white py-3 text-sm font-medium"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? '处理中...' : '提交'}
            </motion.button>
          </form>
          <AnimatePresence>
            {status === 'success' ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-4 rounded-full bg-emerald-500/10 text-emerald-600 text-xs px-3 py-2 inline-flex items-center"
              >
                已完成，已发送提示
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/70 p-5 shadow-sm flex flex-col gap-4">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Skeleton</div>
          <button
            onClick={triggerSkeleton}
            className="self-start px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-medium"
          >
            模拟加载
          </button>
          <div className="rounded-2xl border border-slate-200/70 p-4">
            {showSkeleton ? (
              <div className="space-y-3">
                <div className="h-4 w-2/3 rounded-full shimmer" />
                <div className="h-4 w-full rounded-full shimmer" />
                <div className="h-4 w-5/6 rounded-full shimmer" />
              </div>
            ) : (
              <div>
                <div className="text-sm font-medium text-slate-700">内容已就绪</div>
                <div className="text-xs text-slate-400 mt-2">
                  骨架屏用于降低等待焦虑
                </div>
              </div>
            )}
          </div>

          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Morphing</div>
          <motion.button
            onClick={triggerMorph}
            animate={{
              width: morphState === 'loading' ? 120 : 180,
              borderRadius: morphState === 'loading' ? 999 : 16,
              backgroundColor: morphState === 'success' ? '#16a34a' : '#0f172a'
            }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="h-11 text-white text-sm font-medium"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {morphState === 'loading'
              ? '处理中...'
              : morphState === 'success'
                ? '完成 ✓'
                : '开始下载'}
          </motion.button>
        </div>
      </div>

      <style>{`
        .shimmer {
          background: linear-gradient(90deg, #e2e8f0 0%, #f8fafc 50%, #e2e8f0 100%);
          background-size: 200% 100%;
          animation: shimmer 1.2s ease-in-out infinite;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

function DrawerModalDemo() {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  return (
    <div className="h-full w-full p-8 flex flex-col gap-6">
      <div className="text-xs uppercase tracking-[0.35em] text-slate-400">Drawer / Modal</div>
      <h3 className="text-3xl font-semibold text-slate-900">抽屉与模态</h3>
      <p className="text-sm text-slate-500 max-w-xl">
        通过遮罩与方向性位移建立空间关系，让用户知道内容来自哪里。
      </p>

      <div className="flex gap-3">
        <button
          onClick={() => setOpenDrawer(true)}
          className="px-5 py-3 rounded-full bg-slate-900 text-white text-sm font-medium"
        >
          打开抽屉
        </button>
        <button
          onClick={() => setOpenModal(true)}
          className="px-5 py-3 rounded-full bg-white border border-slate-200 text-slate-600 text-sm font-medium"
        >
          打开模态
        </button>
      </div>

      <AnimatePresence>
        {openDrawer ? (
          <motion.div
            className="absolute inset-0 bg-slate-900/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenDrawer(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute right-0 top-0 h-full w-[280px] bg-white shadow-xl p-6"
              onClick={event => event.stopPropagation()}
            >
              <div className="text-sm font-medium text-slate-900">侧边抽屉</div>
              <div className="text-xs text-slate-400 mt-2">从右侧滑入</div>
              <button
                onClick={() => setOpenDrawer(false)}
                className="mt-6 px-4 py-2 rounded-full bg-slate-900 text-white text-xs"
              >
                关闭
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {openModal ? (
          <motion.div
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-3xl shadow-xl p-6 w-[320px]"
              onClick={event => event.stopPropagation()}
            >
              <div className="text-sm font-medium text-slate-900">居中模态</div>
              <div className="text-xs text-slate-400 mt-2">轻微缩放进入</div>
              <button
                onClick={() => setOpenModal(false)}
                className="mt-6 px-4 py-2 rounded-full bg-slate-900 text-white text-xs"
              >
                知道了
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function StickyDemo() {
  const scrollRef = useRef(null);
  const { scrollYProgress } = useScroll({ container: scrollRef });
  const headerBg = useTransform(
    scrollYProgress,
    [0, 0.2],
    ['rgba(248,248,248,0)', 'rgba(255,255,255,0.9)']
  );
  const headerShadow = useTransform(
    scrollYProgress,
    [0, 0.2],
    ['0 0 0 rgba(0,0,0,0)', '0 12px 30px rgba(15, 23, 42, 0.12)']
  );

  return (
    <div className="h-full w-full p-8 flex flex-col gap-4">
      <div className="text-xs uppercase tracking-[0.35em] text-slate-400">Sticky</div>
      <h3 className="text-3xl font-semibold text-slate-900">吸附导航与滚动反馈</h3>
      <p className="text-sm text-slate-500 max-w-xl">
        滚动时导航固定并强化背景，让用户始终知道当前位置。
      </p>

      <div ref={scrollRef} className="mt-2 h-[360px] overflow-y-auto rounded-2xl border border-slate-200/70 bg-[#F8F8F8]">
        <motion.div
          style={{ backgroundColor: headerBg, boxShadow: headerShadow }}
          className="sticky top-0 z-10 px-5 py-4 backdrop-blur-sm"
        >
          <div className="text-sm font-medium text-slate-900">品牌导航</div>
          <div className="text-xs text-slate-400">滚动触发阴影与半透明</div>
        </motion.div>
        <div className="p-5 space-y-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="rounded-2xl bg-white border border-slate-200/70 p-4 shadow-sm">
              <div className="h-24 rounded-xl bg-gradient-to-br from-slate-100 via-white to-slate-50 border border-slate-200/70" />
              <div className="mt-3 text-sm font-medium text-slate-700">内容段落 {index + 1}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScrollTriggerDemo() {
  const scrollRef = useRef(null);

  return (
    <div className="h-full w-full p-8 flex flex-col gap-4">
      <div className="text-xs uppercase tracking-[0.35em] text-slate-400">Scroll Triggered</div>
      <h3 className="text-3xl font-semibold text-slate-900">滚动触发入场</h3>
      <p className="text-sm text-slate-500 max-w-xl">
        内容进入视口时按进度淡入上浮，适合 Storytelling。
      </p>
      <div ref={scrollRef} className="mt-2 h-[360px] overflow-y-auto rounded-2xl border border-slate-200/70 bg-white p-5 space-y-4">
        {Array.from({ length: 7 }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ root: scrollRef, amount: 0.4 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl bg-[#F8F8F8] border border-slate-200/70 p-4"
          >
            <div className="h-20 rounded-xl bg-gradient-to-br from-slate-100 via-white to-slate-50 border border-slate-200/70" />
            <div className="mt-3 text-sm font-medium text-slate-700">滚动章节 {index + 1}</div>
            <div className="text-xs text-slate-400 mt-1">进入视口触发动画</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ProgressDrivenDemo() {
  const scrollRef = useRef(null);
  const { scrollYProgress } = useScroll({ container: scrollRef });

  const barWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const cardY = useTransform(scrollYProgress, [0, 1], [24, -36]);
  const cardScale = useTransform(scrollYProgress, [0, 1], [0.96, 1.05]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.2, 0.6, 0.2]);

  const step1 = useTransform(scrollYProgress, [0, 0.3, 0.45], [1, 1, 0.2]);
  const step2 = useTransform(scrollYProgress, [0.25, 0.55, 0.75], [0.2, 1, 0.2]);
  const step3 = useTransform(scrollYProgress, [0.6, 0.85, 1], [0.2, 1, 1]);

  return (
    <div className="h-full w-full p-8 flex flex-col gap-4">
      <div className="text-xs uppercase tracking-[0.35em] text-slate-400">Progress Driven</div>
      <h3 className="text-3xl font-semibold text-slate-900">滚动叙事推进</h3>
      <p className="text-sm text-slate-500 max-w-xl">
        通过滚动进度驱动画面元素，形成连贯的故事感。
      </p>

      <div
        ref={scrollRef}
        className="mt-2 h-[360px] overflow-y-auto rounded-2xl border border-slate-200/70 bg-[#F8F8F8]"
      >
        <div className="relative h-[900px]">
          <div className="sticky top-0 h-[300px] px-6 pt-6">
            <div className="rounded-2xl bg-white border border-slate-200/70 shadow-sm h-full relative overflow-hidden">
              <motion.div
                style={{ opacity: glowOpacity }}
                className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-sky-400/30 blur-3xl"
              />
              <motion.div
                style={{ y: cardY, scale: cardScale }}
                className="absolute left-6 top-6 right-6 bottom-6 rounded-2xl bg-gradient-to-br from-white via-slate-50 to-slate-100 border border-slate-200/70 p-6"
              >
                <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Scene</div>
                <div className="mt-3 text-lg font-semibold text-slate-800">核心画面随进度推进</div>
                <div className="mt-3 text-sm text-slate-500 max-w-sm">
                  卡片位移、缩放与高光随滚动进度同步。
                </div>
              </motion.div>
              <div className="absolute left-6 bottom-5 right-6">
                <div className="h-1.5 rounded-full bg-slate-200">
                  <motion.div
                    style={{ width: barWidth }}
                    className="h-full rounded-full bg-slate-900"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <motion.span style={{ opacity: step1 }}>阶段一：引入</motion.span>
                  <motion.span style={{ opacity: step2 }}>阶段二：展开</motion.span>
                  <motion.span style={{ opacity: step3 }}>阶段三：收束</motion.span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-[320px] px-6 space-y-16">
            {['建立氛围', '聚焦细节', '完成叙事'].map(text => (
              <div key={text} className="rounded-2xl bg-white border border-slate-200/70 p-5 shadow-sm">
                <div className="h-24 rounded-xl bg-gradient-to-br from-slate-100 via-white to-slate-50 border border-slate-200/70" />
                <div className="mt-3 text-sm font-medium text-slate-700">{text}</div>
                <div className="text-xs text-slate-400 mt-1">滚动推动场景变化</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnimationShowcase;
