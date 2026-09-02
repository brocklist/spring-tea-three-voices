import { gsap } from 'gsap';
import { Leaf, MapPin, Route, Sparkles, Sprout, X } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { defaultGardenResources, defaultStudentProjects, teaGardenZones, teaProducts } from '../../data/mockData';
import { assetUrl } from '../../lib/assetUrl';
import './StoryExperience.css';

type StoryVisualKind = 'production' | 'market' | 'matching';

type StoryChapter = {
  id: StoryVisualKind;
  number: string;
  eyebrow: string;
  title: string;
  statement: string;
  detail: string;
  proof: string[];
  tone: 'tea' | 'gold' | 'jade';
};

type StoryMatch = {
  id: string;
  projectLabel: string;
  gardenLabel: string;
  tags: string[];
  path: string;
};

const chapters: StoryChapter[] = [
  { id: 'production', number: '01', eyebrow: '数智茶鸣｜智慧生产', title: '让山野会说话', statement: '一座茶园的天气、土壤与叶片状态，被转化为每一次更从容的判断。', detail: '把实时气象、环境监测、叶片识别和农技知识带进茶垄，让科技贴近每一位茶农的日常。', proof: ['真实天气', '茶园环境', '叶片识别'], tone: 'tea' },
  { id: 'market', number: '02', eyebrow: '香途畅鸣｜产销助农', title: '让茶香走得更远', statement: '从山野原叶到一份礼物，让地方风物拥有被看见、被分享的全新语言。', detail: '产品、品牌故事与茶文化内容共同打开更长的消费路径，让春建茶香走向更多人的生活。', proof: ['产品创新', '品牌叙事', '茶文化传播'], tone: 'gold' },
  { id: 'matching', number: '03', eyebrow: '新苗创鸣｜校企双选', title: '让青年与乡土相遇', statement: '让一个创业构想，找到一片真正适合它生长的茶园。', detail: '大学生团队与茶园主理人双向发布、标签匹配，让青年理想与乡土资源在春建乡持续相遇。', proof: ['双向发布', '标签匹配', '青年助农'], tone: 'jade' },
];

const productImages = teaProducts.slice(0, 4);
const productionMarkers = teaGardenZones.slice(0, 3);
const storyMatches: StoryMatch[] = [
  {
    id: defaultStudentProjects[0].id + '-' + defaultGardenResources[0].id,
    projectLabel: '直播共创',
    gardenLabel: '青芽茶园',
    tags: defaultStudentProjects[0].tags.filter((tag) => defaultGardenResources[0].tags.includes(tag)),
    path: 'M 334 184 C 480 138, 564 214, 698 250',
  },
  {
    id: defaultStudentProjects[1].id + '-' + defaultGardenResources[1].id,
    projectLabel: '茶山研学',
    gardenLabel: '云径茶谷',
    tags: defaultStudentProjects[1].tags.filter((tag) => defaultGardenResources[1].tags.includes(tag)),
    path: 'M 334 382 C 488 418, 570 346, 722 336',
  },
];

export function StoryExperience() {
  const navigate = useNavigate();
  const reducedMotion = Boolean(useReducedMotion());
  const rootRef = useRef<HTMLElement>(null);
  const activeIndexRef = useRef(0);
  const transitioning = useRef(false);
  const exiting = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showConclusion, setShowConclusion] = useState(false);

  const enterDashboard = useCallback(() => {
    if (exiting.current) return;
    exiting.current = true;
    navigate('/production', { replace: true, state: { fromIntro: true, fromStory: true } });
  }, [navigate]);

  useEffect(() => {
    void import('../production/ThreeTeaGardenScene');
    ['/assets/production/chunjian-digital-twin-map-v2.png', '/assets/story/chunjian-matching-map-v1.png'].forEach((src) => {
      const image = new Image();
      image.src = assetUrl(src);
    });
  }, []);

  useLayoutEffect(() => {
    if (!rootRef.current) return;
    const root = rootRef.current;
    const context = gsap.context(() => {
      const chapterNodes = gsap.utils.toArray<HTMLElement>('[data-story-chapter]');
      const tones = gsap.utils.toArray<HTMLElement>('[data-story-tone]');
      const visuals = gsap.utils.toArray<HTMLElement>('[data-story-visual]');
      const map = root.querySelector<HTMLElement>('.story-visual__map');
      const mapOutline = root.querySelector<SVGPathElement>('.story-map-outline');
      const mapMarkers = gsap.utils.toArray<HTMLElement>('.story-map-marker');
      const products = gsap.utils.toArray<HTMLElement>('.story-product');
      const matchingNodes = gsap.utils.toArray<HTMLElement>('.story-matching-node');
      const matchTags = gsap.utils.toArray<HTMLElement>('.story-match-tag');
      const conclusion = root.querySelector<HTMLElement>('.story-conclusion');
      const introDuration = reducedMotion ? 0.12 : 0.68;

      gsap.set(chapterNodes, { autoAlpha: 0, y: 30, filter: reducedMotion ? 'none' : 'blur(8px)' });
      gsap.set(tones, { autoAlpha: 0 });
      gsap.set(visuals, { autoAlpha: 0, scale: 1.035, filter: reducedMotion ? 'none' : 'blur(8px)' });
      gsap.set(mapMarkers, { autoAlpha: 0, scale: 0.55 });
      gsap.set(products, { autoAlpha: 0, y: 48, rotate: -5, scale: 0.86 });
      gsap.set(matchingNodes, { autoAlpha: 0, scale: 0.68 });
      gsap.set(matchTags, { autoAlpha: 0, y: 8 });
      gsap.set(conclusion, { autoAlpha: 0, y: 20, filter: reducedMotion ? 'none' : 'blur(8px)' });
      if (mapOutline) gsap.set(mapOutline, { strokeDashoffset: 1 });
      gsap.set(root.querySelector('.story-product-orbit path'), { strokeDashoffset: 1 });
      gsap.set(root.querySelector('.story-matching-boundary'), { strokeDashoffset: 1 });
      gsap.set(gsap.utils.toArray('.story-matching-line'), { strokeDashoffset: 1 });
      gsap.set([chapterNodes[0], tones[0], visuals[0]], { autoAlpha: 1 });

      gsap.timeline({ defaults: { ease: 'power2.out' } })
        .fromTo(map, { x: reducedMotion ? 0 : 52, y: reducedMotion ? 0 : -34, scale: reducedMotion ? 1 : 1.07 }, { x: 0, y: 0, scale: 1, duration: introDuration }, 0)
        .fromTo(chapterNodes[0], { y: reducedMotion ? 0 : 22, filter: reducedMotion ? 'none' : 'blur(6px)' }, { y: 0, filter: 'blur(0px)', duration: introDuration * 0.92 }, reducedMotion ? 0 : 0.16)
        .to(mapOutline, { strokeDashoffset: 0, duration: introDuration * 0.86, ease: 'power1.inOut' }, reducedMotion ? 0 : 0.22)
        .to(mapMarkers, { autoAlpha: 1, scale: 1, stagger: 0.11, duration: introDuration * 0.44, ease: 'back.out(1.6)' }, reducedMotion ? 0 : 0.45);
    }, root);

    return () => context.revert();
  }, [reducedMotion]);

  const moveToChapter = useCallback((nextIndex: number) => {
    const root = rootRef.current;
    if (!root || transitioning.current || exiting.current) return;
    const currentIndex = activeIndexRef.current;
    if (nextIndex === currentIndex || !chapters[nextIndex]) return;

    transitioning.current = true;
    activeIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);

    const chapterNodes = gsap.utils.toArray<HTMLElement>('[data-story-chapter]', root);
    const tones = gsap.utils.toArray<HTMLElement>('[data-story-tone]', root);
    const visuals = gsap.utils.toArray<HTMLElement>('[data-story-visual]', root);
    const mapOutline = root.querySelector<SVGPathElement>('.story-map-outline');
    const mapMarkers = gsap.utils.toArray<HTMLElement>('.story-map-marker', root);
    const orbit = root.querySelector<SVGPathElement>('.story-product-orbit path');
    const products = gsap.utils.toArray<HTMLElement>('.story-product', root);
    const matchBoundary = root.querySelector<SVGPathElement>('.story-matching-boundary');
    const matchingLines = gsap.utils.toArray<SVGPathElement>('.story-matching-line', root);
    const matchingNodes = gsap.utils.toArray<HTMLElement>('.story-matching-node', root);
    const matchTags = gsap.utils.toArray<HTMLElement>('.story-match-tag', root);
    const duration = reducedMotion ? 0.12 : 0.48;
    const filterOut = reducedMotion ? 'none' : 'blur(8px)';
    const timeline = gsap.timeline({ defaults: { ease: 'power2.inOut' }, onComplete: () => { transitioning.current = false; } });

    timeline
      .to([chapterNodes[currentIndex], visuals[currentIndex]], { autoAlpha: 0, y: reducedMotion ? 0 : -18, scale: reducedMotion ? 1 : 1.035, filter: filterOut, duration: duration * 0.78 }, 0)
      .to(tones[currentIndex], { autoAlpha: 0, duration: duration * 0.72 }, 0.06)
      .set([tones[nextIndex], visuals[nextIndex], chapterNodes[nextIndex]], { autoAlpha: 1 }, duration * 0.56)
      .fromTo(tones[nextIndex], { opacity: 0 }, { opacity: 1, duration: duration * 1.12 }, duration * 0.56)
      .fromTo(visuals[nextIndex], { scale: reducedMotion ? 1 : 1.065, filter: reducedMotion ? 'none' : 'blur(9px)' }, { scale: 1, filter: 'blur(0px)', duration: duration * 1.38, ease: 'power3.out' }, duration * 0.6)
      .fromTo(chapterNodes[nextIndex], { y: reducedMotion ? 0 : 28, filter: reducedMotion ? 'none' : 'blur(8px)' }, { y: 0, filter: 'blur(0px)', duration: duration * 1.08, ease: 'power3.out' }, duration * 1.02);

    if (nextIndex === 0) {
      if (mapOutline) timeline.to(mapOutline, { strokeDashoffset: 0, duration: duration * 0.9 }, duration * 0.94);
      timeline.to(mapMarkers, { autoAlpha: 1, scale: 1, stagger: 0.1, duration: duration * 0.46, ease: 'back.out(1.6)' }, duration * 1.12);
    }

    if (nextIndex === 1) {
      if (orbit) timeline.fromTo(orbit, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: duration * 1.24, ease: 'power1.inOut' }, duration * 0.78);
      timeline.fromTo(products, { autoAlpha: 0, y: 54, rotate: -5, scale: 0.84 }, { autoAlpha: 1, y: 0, rotate: 0, scale: 1, stagger: 0.11, duration: duration * 0.8, ease: 'back.out(1.45)' }, duration * 1.04);
    }

    if (nextIndex === 2) {
      if (matchBoundary) timeline.fromTo(matchBoundary, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration, ease: 'power1.inOut' }, duration * 0.84);
      timeline
        .fromTo(matchingLines, { strokeDashoffset: 1 }, { strokeDashoffset: 0, stagger: 0.11, duration: duration * 0.82, ease: 'power1.inOut' }, duration * 1.02)
        .fromTo(matchingNodes, { autoAlpha: 0, scale: 0.66 }, { autoAlpha: 1, scale: 1, stagger: 0.1, duration: duration * 0.56, ease: 'back.out(1.8)' }, duration * 1.16)
        .fromTo(matchTags, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, stagger: 0.11, duration: duration * 0.46 }, duration * 1.3);
    }
  }, [reducedMotion]);

  const revealConclusion = useCallback(() => {
    const root = rootRef.current;
    if (!root || transitioning.current || exiting.current) return;
    transitioning.current = true;
    exiting.current = true;
    setShowConclusion(true);

    const chapterNodes = gsap.utils.toArray<HTMLElement>('[data-story-chapter]', root);
    const tones = gsap.utils.toArray<HTMLElement>('[data-story-tone]', root);
    const visuals = gsap.utils.toArray<HTMLElement>('[data-story-visual]', root);
    const conclusion = root.querySelector<HTMLElement>('.story-conclusion');
    const duration = reducedMotion ? 0.12 : 0.36;

    gsap.timeline({ defaults: { ease: 'power2.inOut' }, onComplete: () => navigate('/production', { replace: true, state: { fromIntro: true, fromStory: true } }) })
      .to([chapterNodes[2], visuals[2]], { autoAlpha: 0, y: reducedMotion ? 0 : -18, filter: reducedMotion ? 'none' : 'blur(8px)', duration }, 0)
      .to(tones[2], { autoAlpha: 0, duration }, 0)
      .to(conclusion, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration }, duration * 0.8)
      .to({}, { duration: reducedMotion ? 0.08 : 0.48 })
      .to(root, { autoAlpha: 0, duration: reducedMotion ? 0.12 : 0.36 });
  }, [navigate, reducedMotion]);

  const advance = useCallback(() => {
    if (transitioning.current || exiting.current) return;
    if (activeIndexRef.current < chapters.length - 1) {
      moveToChapter(activeIndexRef.current + 1);
      return;
    }
    revealConclusion();
  }, [moveToChapter, revealConclusion]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    advance();
  };

  return (
    <main ref={rootRef} className={showConclusion ? 'story-experience is-concluding' : 'story-experience'} aria-label="一叶问茶三鸣共富介绍">
      <div className="story-experience__stage" role="button" tabIndex={0} aria-label="点击推进三鸣共富介绍" onClick={advance} onKeyDown={handleKeyDown}>
        {chapters.map((chapter) => <div key={chapter.id} className={'story-experience__tone story-experience__tone--' + chapter.id} data-story-tone={chapter.id} />)}
        <StoryVisuals activeIndex={activeIndex} />
        <div className="story-experience__copy">{chapters.map((chapter, index) => <StoryCopy key={chapter.id} chapter={chapter} isActive={activeIndex === index} />)}</div>
        <div className="story-conclusion" aria-live="polite"><Sparkles className="h-5 w-5" /><p>三鸣共振</p><strong>一叶贯穿生产、传播与共创，<br />共富成声。</strong></div>
      </div>
      <StoryHeader activeIndex={activeIndex} onSkip={enterDashboard} />
    </main>
  );
}

function StoryHeader({ activeIndex, onSkip }: { activeIndex: number; onSkip: () => void }) {
  return <header className="story-experience__header">
    <div className="story-experience__brand"><Leaf className="h-4 w-4" /><span>一叶问茶·春声三鸣</span></div>
    <nav aria-label="三鸣章节进度">{chapters.map((chapter, index) => <span key={chapter.id} aria-current={activeIndex === index ? 'step' : undefined} className={activeIndex === index ? 'is-active' : ''}><i />{chapter.number}</span>)}</nav>
    <button type="button" onClick={onSkip}>跳过介绍 <X className="h-3.5 w-3.5" /></button>
  </header>;
}

function StoryCopy({ chapter, isActive }: { chapter: StoryChapter; isActive: boolean }) {
  return <article className={'story-chapter story-chapter--' + chapter.id + (isActive ? ' is-active' : '')} data-story-chapter={chapter.id} data-story-tone-name={chapter.tone}>
    <p className="story-chapter__eyebrow">{chapter.number} · {chapter.eyebrow}</p>
    <h1>{chapter.title}</h1>
    <p className="story-chapter__statement">{chapter.statement}</p>
    <p className="story-chapter__detail">{chapter.detail}</p>
    <div className="story-chapter__proof">{chapter.proof.map((item) => <span key={item}><i />{item}</span>)}</div>
  </article>;
}

function StoryVisuals({ activeIndex }: { activeIndex: number }) {
  return <div className="story-experience__visuals" aria-hidden="true">
    <div className={'story-visual story-visual--production' + (activeIndex === 0 ? ' is-active' : '')} data-story-visual="production">
      <img className="story-visual__map" src={assetUrl('/assets/production/chunjian-digital-twin-map-v2.png')} alt="" />
      <svg className="story-map-overlay" viewBox="0 0 1000 560" preserveAspectRatio="none"><path className="story-map-outline" pathLength="1" d="M92 104 C242 34 478 48 683 118 C848 174 923 310 854 432 C773 537 514 520 308 478 C131 441 56 320 92 104 Z" /></svg>
      {productionMarkers.map((zone, index) => <span key={zone.id} className={'story-map-marker story-map-marker--' + index}><i /></span>)}
    </div>
    <div className={'story-visual story-visual--market' + (activeIndex === 1 ? ' is-active' : '')} data-story-visual="market">
      <svg className="story-product-orbit" viewBox="0 0 1000 560" preserveAspectRatio="none"><path pathLength="1" d="M126 318 C216 70 706 42 908 242 C1018 352 832 518 564 500 C289 484 116 429 126 318 Z" /></svg>
      {productImages.map((product, index) => <img key={product.id} className={'story-product story-product--' + index} src={product.imageUrl} alt="" />)}
    </div>
    <div className={'story-visual story-visual--matching' + (activeIndex === 2 ? ' is-active' : '')} data-story-visual="matching">
      <div className="story-matching-map">
        <img src={assetUrl('/assets/story/chunjian-matching-map-v1.png')} alt="" />
        <svg className="story-matching-network" viewBox="0 0 1000 560" preserveAspectRatio="none">
          <path className="story-matching-boundary" pathLength="1" d="M332 76 C518 32 816 70 906 216 C972 322 884 474 670 505 C460 531 274 436 286 271 C290 192 285 116 332 76 Z" />
          {storyMatches.map((match) => <path key={match.id} className="story-matching-line" pathLength="1" d={match.path} />)}
        </svg>
        {storyMatches.map((match, index) => <span key={match.id + '-project'} className={'story-matching-node story-matching-node--project-' + index}><Sprout className="h-3.5 w-3.5" />{match.projectLabel}</span>)}
        {storyMatches.map((match, index) => <span key={match.id + '-garden'} className={'story-matching-node story-matching-node--garden-' + index}><MapPin className="h-3.5 w-3.5" />{match.gardenLabel}</span>)}
        {storyMatches.map((match, index) => <span key={match.id + '-tag'} className={'story-match-tag story-match-tag--' + index}><Route className="h-3 w-3" />{match.tags.join(' · ')}</span>)}
      </div>
    </div>
  </div>;
}
