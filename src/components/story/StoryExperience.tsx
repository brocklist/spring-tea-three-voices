import { gsap } from 'gsap';
import { Leaf, Sparkles, Sprout, X } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { heroAssets, teaProducts } from '../../data/mockData';
import { assetUrl } from '../../lib/assetUrl';
import './StoryExperience.css';

type StoryChapter = {
  id: 'production' | 'market' | 'matching';
  number: string;
  eyebrow: string;
  title: string;
  statement: string;
  detail: string;
  proof: string[];
};

const chapters: StoryChapter[] = [
  { id: 'production', number: '01', eyebrow: '数智茶鸣｜智慧生产', title: '让山野会说话', statement: '一座茶园的天气、土壤与叶片状态，被转化为每一次更从容的判断。', detail: '把实时气象、环境监测、叶片识别和农技知识带进茶垄，让科技贴近每一位茶农的日常。', proof: ['真实天气', '茶园环境', '叶片识别'] },
  { id: 'market', number: '02', eyebrow: '香途畅鸣｜产销助农', title: '让茶香走得更远', statement: '从山野原叶到一份礼物，让地方风物拥有被看见、被分享的全新语言。', detail: '产品、品牌故事与茶文化内容共同打开更长的消费路径，让春建茶香走向更多人的生活。', proof: ['产品创新', '品牌叙事', '茶文化传播'] },
  { id: 'matching', number: '03', eyebrow: '新苗创鸣｜校企双选', title: '让青年与乡土相遇', statement: '让一个创业构想，找到一片真正适合它生长的茶园。', detail: '大学生团队与茶园主理人双向发布、标签匹配，让青年理想与乡土资源在春建乡持续相遇。', proof: ['双向发布', '标签匹配', '青年助农'] },
];

const productImages = teaProducts.slice(0, 4);

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
    const mapImage = new Image();
    mapImage.src = assetUrl('/assets/production/chunjian-digital-twin-map-v2.png');
  }, []);

  useLayoutEffect(() => {
    if (!rootRef.current) return;
    const root = rootRef.current;
    const context = gsap.context(() => {
      const chapterNodes = gsap.utils.toArray<HTMLElement>('[data-story-chapter]');
      const tones = gsap.utils.toArray<HTMLElement>('[data-story-tone]');
      const visuals = gsap.utils.toArray<HTMLElement>('[data-story-visual]');
      const map = root.querySelector<HTMLElement>('.story-visual__map');
      const products = gsap.utils.toArray<HTMLElement>('.story-product');
      const matchingNodes = gsap.utils.toArray<HTMLElement>('.story-matching-node');
      const conclusion = root.querySelector<HTMLElement>('.story-conclusion');

      gsap.set(chapterNodes, { autoAlpha: 0, y: 28, filter: reducedMotion ? 'none' : 'blur(8px)' });
      gsap.set(tones, { autoAlpha: 0 });
      gsap.set(visuals, { autoAlpha: 0, scale: 1.04, filter: reducedMotion ? 'none' : 'blur(8px)' });
      gsap.set(products, { autoAlpha: 0, y: 42, rotate: -4, scale: 0.88 });
      gsap.set(matchingNodes, { autoAlpha: 0, scale: 0.56 });
      gsap.set(conclusion, { autoAlpha: 0, y: 20, filter: reducedMotion ? 'none' : 'blur(8px)' });
      gsap.set([chapterNodes[0], tones[0], visuals[0]], { autoAlpha: 1 });
      gsap.set(chapterNodes[0], { y: 0, filter: 'blur(0px)' });
      gsap.set(visuals[0], { scale: 1, filter: 'blur(0px)' });
      gsap.set(map, { yPercent: -1.5 });
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
    const products = gsap.utils.toArray<HTMLElement>('.story-product', root);
    const matchingNodes = gsap.utils.toArray<HTMLElement>('.story-matching-node', root);
    const duration = reducedMotion ? 0.12 : 0.42;
    const filterOut = reducedMotion ? 'none' : 'blur(8px)';

    const timeline = gsap.timeline({ defaults: { ease: 'power2.inOut' }, onComplete: () => { transitioning.current = false; } });
    timeline
      .to([chapterNodes[currentIndex], visuals[currentIndex]], { autoAlpha: 0, y: reducedMotion ? 0 : -20, scale: 1.045, filter: filterOut, duration }, 0)
      .to(tones[currentIndex], { autoAlpha: 0, duration: duration * 0.74 }, 0.08)
      .set([tones[nextIndex], visuals[nextIndex], chapterNodes[nextIndex]], { autoAlpha: 1 }, duration * 0.78)
      .fromTo(tones[nextIndex], { opacity: 0 }, { opacity: 1, duration: duration * 0.9 }, duration * 0.78)
      .fromTo(visuals[nextIndex], { scale: reducedMotion ? 1 : 1.055, filter: reducedMotion ? 'none' : 'blur(8px)' }, { scale: 1, filter: 'blur(0px)', duration: duration * 1.35 }, duration * 0.82)
      .fromTo(chapterNodes[nextIndex], { y: reducedMotion ? 0 : 26, filter: reducedMotion ? 'none' : 'blur(8px)' }, { y: 0, filter: 'blur(0px)', duration: duration * 1.12 }, duration * 0.98);

    if (nextIndex === 1) timeline.to(products, { autoAlpha: 1, y: 0, rotate: 0, scale: 1, stagger: 0.055, duration }, duration * 1.12);
    if (nextIndex === 2) timeline.to(matchingNodes, { autoAlpha: 1, scale: 1, stagger: 0.07, duration }, duration * 1.12);
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
        <div className="story-experience__tone story-experience__tone--production" data-story-tone="production" />
        <div className="story-experience__tone story-experience__tone--market" data-story-tone="market" />
        <div className="story-experience__tone story-experience__tone--matching" data-story-tone="matching" />
        <StoryVisuals />
        <div className="story-experience__copy">{chapters.map((chapter) => <StoryCopy key={chapter.id} chapter={chapter} />)}</div>
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

function StoryCopy({ chapter }: { chapter: StoryChapter }) {
  return <article className={`story-chapter story-chapter--${chapter.id}`} data-story-chapter={chapter.id}>
    <p className="story-chapter__eyebrow">{chapter.number} · {chapter.eyebrow}</p>
    <h1>{chapter.title}</h1>
    <p className="story-chapter__statement">{chapter.statement}</p>
    <p className="story-chapter__detail">{chapter.detail}</p>
    <div className="story-chapter__proof">{chapter.proof.map((item) => <span key={item}><i />{item}</span>)}</div>
  </article>;
}

function StoryVisuals() {
  return <div className="story-experience__visuals" aria-hidden="true">
    <div className="story-visual story-visual--production" data-story-visual="production"><img className="story-visual__map" src={assetUrl('/assets/production/chunjian-digital-twin-map-v2.png')} alt="" /></div>
    <div className="story-visual story-visual--market" data-story-visual="market"><div className="story-product-orbit" />{productImages.map((product, index) => <img key={product.id} className={`story-product story-product--${index}`} src={product.imageUrl} alt="" />)}</div>
    <div className="story-visual story-visual--matching" data-story-visual="matching"><img src={heroAssets.matching} alt="" /><div className="story-matching-line story-matching-line--one" /><div className="story-matching-line story-matching-line--two" />{['青年团队', '春建茶园', '品牌共创', '研学实践'].map((label, index) => <span key={label} className={`story-matching-node story-matching-node--${index}`}><Sprout className="h-3.5 w-3.5" />{label}</span>)}</div>
  </div>;
}
