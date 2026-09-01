import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assetUrl } from '../../lib/assetUrl';
import './TeaMountainHero.css';

gsap.registerPlugin(MotionPathPlugin);

const HERO_IMAGE = assetUrl('/assets/intro/tea-mountain-hero.png');
const particles = [
  [18, 57], [23, 68], [29, 51], [35, 74], [41, 61], [47, 79], [52, 53], [57, 70],
  [62, 59], [68, 76], [73, 48], [77, 66], [82, 55], [86, 73], [90, 61], [32, 84],
] as const;

export function IntroExperience() {
  const navigate = useNavigate();
  const rootRef = useRef<HTMLElement>(null);
  const cameraRef = useRef<HTMLDivElement>(null);
  const exitStarted = useRef(false);
  const [imageReady, setImageReady] = useState(false);
  const [portalActive, setPortalActive] = useState(false);

  const preloadStory = useCallback(() => {
    void import('../story/StoryExperience');
  }, []);

  const enterStory = useCallback(() => {
    if (exitStarted.current || !rootRef.current) return;
    exitStarted.current = true;
    preloadStory();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      navigate('/story');
      return;
    }
    rootRef.current.classList.add('is-exiting');
    gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      onComplete: () => navigate('/story'),
    })
      .to('.tea-hero__typography', { autoAlpha: 0, y: -12, duration: 0.35 }, 0)
      .to(cameraRef.current, { scale: 1.14, xPercent: -1.2, yPercent: 0.8, duration: 0.95 }, 0)
      .to(rootRef.current, { autoAlpha: 0, duration: 0.45 }, 0.56);
  }, [navigate, preloadStory]);

  useLayoutEffect(() => {
    if (!imageReady || !rootRef.current || !cameraRef.current) return;
    const root = rootRef.current;
    const camera = cameraRef.current;
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      const cloudLines = gsap.utils.toArray<SVGPathElement>('.tea-hero__cloud-line path');
      const fogLayers = gsap.utils.toArray<SVGGElement>('.tea-hero__fog-layer');
      const leaves = gsap.utils.toArray<HTMLElement>('.tea-hero__leaf-inner');
      const particleNodes = gsap.utils.toArray<HTMLElement>('.tea-hero__particle');

      media.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(root, { autoAlpha: 1, filter: 'none' });
        gsap.set(camera, { scale: 1.055 });
        gsap.set('.tea-hero__typography', { autoAlpha: 1, y: 0, filter: 'none' });
        gsap.set('.tea-hero__portal', { autoAlpha: 1 });
      });

      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.set(root, { autoAlpha: 0.35, filter: 'blur(7px)' });
        gsap.set(camera, { scale: 1.035, xPercent: 0, yPercent: 0 });
        gsap.set('.tea-hero__typography', { autoAlpha: 0, y: 22, filter: 'blur(6px)' });
        gsap.set('.tea-hero__portal', { autoAlpha: 0 });
        gsap.set(cloudLines, { strokeDasharray: 1100, strokeDashoffset: 1100 });
        gsap.set('.tea-hero__bird', { autoAlpha: 0, scale: 0.45, transformOrigin: 'center' });

        const entrance = gsap.timeline();
        entrance
          .to(root, { autoAlpha: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power2.out' }, 0)
          .to(camera, { scale: 1.08, xPercent: -0.7, yPercent: 0.3, duration: 3.3, ease: 'power1.inOut' }, 0.2)
          .fromTo('.tea-hero__mountain-far', { x: 1, y: -1 }, { x: 0, y: 0, duration: 3.1, ease: 'power1.out' }, 0.25)
          .fromTo('.tea-hero__mountain-mid', { x: 4, y: -2 }, { x: 0, y: 0, duration: 3.1, ease: 'power1.out' }, 0.3)
          .fromTo('.tea-hero__hill-layer', { x: 9, y: 4 }, { x: 0, y: 0, duration: 3, stagger: 0.08, ease: 'power1.out' }, 0.35)
          .to(cloudLines, { strokeDashoffset: 0, duration: 2.5, stagger: 0.13, ease: 'power1.inOut' }, 1.1)
          .to('.tea-hero__typography', { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power2.out' }, 2.4)
          .to('.tea-hero__portal', { autoAlpha: 1, duration: 0.65, ease: 'power1.out' }, 3.2);

        gsap.utils.toArray<SVGPathElement>('.tea-hero__bird').forEach((bird, index) => {
          const routes = [
            [{ x: 0, y: 0 }, { x: 72, y: -42 }, { x: 188, y: -138 }],
            [{ x: 0, y: 0 }, { x: 98, y: -26 }, { x: 238, y: -112 }],
            [{ x: 0, y: 0 }, { x: 54, y: -72 }, { x: 164, y: -172 }],
            [{ x: 0, y: 0 }, { x: 108, y: -56 }, { x: 264, y: -151 }],
          ];
          entrance.to(bird, {
            autoAlpha: 0.72,
            scale: 1,
            duration: 2.7 + index * 0.18,
            ease: 'power1.inOut',
            motionPath: { path: routes[index], curviness: 1.7, autoRotate: false },
          }, 2.1 + index * 0.16);
        });

        fogLayers.forEach((fog, index) => {
          const direction = index === 1 ? -1 : 1;
          gsap.to(fog, { x: direction * (22 + index * 9), y: index * 2 - 2, scaleX: 1.035 + index * 0.018, opacity: 0.54 + index * 0.08, duration: 14 + index * 5, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.8 + index * 0.7 });
        });
        gsap.to(leaves[0], { rotate: 1.25, duration: 4.8, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1.1 });
        gsap.to(leaves[1], { rotate: -1.1, duration: 5.9, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2.2 });
        gsap.to(camera, { scale: 1.087, duration: 11, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 4.2 });

        particleNodes.forEach((particle, index) => {
          gsap.fromTo(particle, { y: 4, x: 0, opacity: 0.08 + (index % 3) * 0.04 }, { y: -10 - (index % 4) * 3, x: index % 2 ? 5 : -5, opacity: 0.32, duration: 7 + (index % 5) * 1.2, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2.8 + index * 0.21 });
        });

        if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
          const movers = gsap.utils.toArray<HTMLElement>('[data-parallax]');
          const xSetters = movers.map((node) => gsap.quickTo(node, 'x', { duration: 1.9, ease: 'power3.out' }));
          const ySetters = movers.map((node) => gsap.quickTo(node, 'y', { duration: 2.2, ease: 'power3.out' }));
          const onPointerMove = (event: PointerEvent) => {
            const nx = (event.clientX / window.innerWidth - 0.5) * 2;
            const ny = (event.clientY / window.innerHeight - 0.5) * 2;
            movers.forEach((node, index) => {
              const depth = Number(node.dataset.parallax ?? 0);
              xSetters[index](nx * depth);
              ySetters[index](ny * depth * 0.55);
            });
          };
          root.addEventListener('pointermove', onPointerMove, { passive: true });
          return () => root.removeEventListener('pointermove', onPointerMove);
        }

        gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: 'sine.inOut' } })
          .to(camera, { x: -4, y: 2, duration: 12 })
          .to(camera, { x: 5, y: -1, duration: 14 });
      });
    }, root);
    return () => { media.revert(); context.revert(); };
  }, [imageReady]);

  return (
    <main ref={rootRef} className={`tea-hero${imageReady ? ' is-ready' : ''}${portalActive ? ' is-portal-active' : ''}`} aria-label="一叶问茶茶山首焦">
      <div ref={cameraRef} className="tea-hero__camera">
        <img className="tea-hero__base" src={HERO_IMAGE} alt="云雾环绕的春建乡层叠茶山" onLoad={() => setImageReady(true)} />
        <Layer className="tea-hero__mountain-far" depth={2} />
        <Layer className="tea-hero__mountain-mid" depth={4} />
        <Layer className="tea-hero__hill-left" depth={7} hill />
        <Layer className="tea-hero__hill-center" depth={9} hill />
        <Layer className="tea-hero__hill-right" depth={11} hill />

        <svg className="tea-hero__fog" viewBox="0 0 1672 941" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <filter id="tea-fog-blur-back"><feGaussianBlur stdDeviation="22" /></filter>
            <filter id="tea-fog-blur-mid"><feGaussianBlur stdDeviation="14" /></filter>
            <filter id="tea-fog-blur-front"><feGaussianBlur stdDeviation="18" /></filter>
            <linearGradient id="tea-fog-fill" x1="0" x2="1"><stop offset="0" stopColor="#f8f0d8" stopOpacity="0" /><stop offset=".24" stopColor="#f8f0d8" stopOpacity=".6" /><stop offset=".76" stopColor="#eef2df" stopOpacity=".46" /><stop offset="1" stopColor="#eef2df" stopOpacity="0" /></linearGradient>
          </defs>
          <g className="tea-hero__fog-layer tea-hero__fog-back" data-parallax="7" filter="url(#tea-fog-blur-back)"><path d="M-130 398 C160 295 330 404 540 360 S920 246 1170 336 S1510 290 1810 330 L1810 500 C1450 480 1260 520 1000 464 S530 520 250 470 S0 518-130 475Z" fill="url(#tea-fog-fill)" /></g>
          <g className="tea-hero__fog-layer tea-hero__fog-mid" data-parallax="13" filter="url(#tea-fog-blur-mid)"><path d="M-110 530 C180 445 350 555 620 492 S980 425 1210 520 S1550 430 1810 490 L1810 650 C1500 610 1240 660 1010 604 S590 650 310 604 S20 640-110 600Z" fill="url(#tea-fog-fill)" /></g>
          <g className="tea-hero__fog-layer tea-hero__fog-front" data-parallax="20" filter="url(#tea-fog-blur-front)"><path d="M-100 748 C220 680 420 760 680 720 S1110 688 1320 752 S1570 690 1790 725 L1790 920 C1490 860 1200 905 920 848 S420 902 160 850 S-20 880-100 840Z" fill="url(#tea-fog-fill)" /></g>
        </svg>

        <svg className="tea-hero__cloud-line" viewBox="0 0 1672 941" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><path d="M-35 80 C115 35 205 95 340 70 S555 120 690 95" /><path d="M30 331 C160 282 260 350 392 315 S590 352 728 318" /><path d="M690 340 C815 295 925 347 1050 315 S1290 342 1410 302" /></svg>
        <svg className="tea-hero__birds" viewBox="0 0 1672 941" preserveAspectRatio="xMidYMid slice" aria-hidden="true">{[0, 1, 2, 3].map((bird) => <path key={bird} className="tea-hero__bird" d="M0 4 Q6-2 12 4 Q18-2 24 4" transform={`translate(${735 + bird * 14} ${495 + bird * 5}) scale(.7)`} />)}</svg>
        <div className="tea-hero__particles" aria-hidden="true">{particles.map(([left, top], index) => <i key={`${left}-${top}`} className="tea-hero__particle" style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${index * -0.37}s` }} />)}</div>
        <div className="tea-hero__leaf tea-hero__leaf-left" data-parallax="16" aria-hidden="true"><div className="tea-hero__leaf-inner"><img src={HERO_IMAGE} alt="" loading="lazy" /></div></div>
        <div className="tea-hero__leaf tea-hero__leaf-right" data-parallax="16" aria-hidden="true"><div className="tea-hero__leaf-inner"><img src={HERO_IMAGE} alt="" loading="lazy" /></div></div>
        <svg className="tea-hero__portal-outline" viewBox="0 0 1672 941" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><path d="M855 886 C948 766 1040 685 1160 635 C1280 584 1393 535 1515 515 C1576 505 1628 516 1690 544" /><path d="M1000 837 C1120 752 1224 700 1355 671 C1480 643 1572 625 1685 635" /></svg>
      </div>

      <header className="tea-hero__typography"><p>富阳春建 · 山水入茶</p><h1>一叶问茶<span>·</span>春声三鸣</h1><div aria-hidden="true">春建</div></header>
      <div className="tea-hero__portal" onMouseEnter={() => setPortalActive(true)} onMouseLeave={() => setPortalActive(false)}>
        <button type="button" aria-label="进入三鸣共富介绍" onFocus={() => setPortalActive(true)} onBlur={() => setPortalActive(false)} onClick={enterStory} />
        <span aria-hidden="true">沿茶垄入山</span>
      </div>
      {!imageReady ? <div className="tea-hero__loading"><i />正在展开春山</div> : null}
    </main>
  );
}

function Layer({ className, depth, hill = false }: { className: string; depth: number; hill?: boolean }) {
  return <div className={`tea-hero__layer ${className}${hill ? ' tea-hero__hill-layer' : ''}`} data-parallax={depth} aria-hidden="true"><img src={HERO_IMAGE} alt="" loading="lazy" decoding="async" /></div>;
}
