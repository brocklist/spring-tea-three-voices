import { FileImage, Images, ScanSearch, UploadCloud } from 'lucide-react';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { leafDetectionDemos, mockDetectionResult } from '../../data/mockData';
import type { PestDetectionResult } from '../../types/domain';

interface PestDetectionPanelProps {
  variant?: 'default' | 'dashboard';
}

export function PestDetectionPanel({ variant = 'default' }: PestDetectionPanelProps) {
  const initialDemo = variant === 'dashboard' ? leafDetectionDemos[0] : undefined;
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(initialDemo?.imageUrl);
  const [fileName, setFileName] = useState<string | undefined>(initialDemo?.pestType);
  const [result, setResult] = useState<PestDetectionResult | undefined>(initialDemo);
  const [showDemos, setShowDemos] = useState(false);

  const confidenceWidth = useMemo(() => `${result?.confidence ?? 0}%`, [result]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setFileName(file.name);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(undefined);
  }

  function handleDetection() {
    setResult({ ...mockDetectionResult, imageUrl: previewUrl });
  }

  function chooseDemo(demo: PestDetectionResult) {
    setPreviewUrl(demo.imageUrl);
    setFileName(demo.pestType);
    setResult(demo);
    setShowDemos(false);
  }

  if (variant === 'dashboard') {
    return (
      <div className="command-pest">
        <div className="command-pest__top">
          <label className="command-pest__upload">
            {previewUrl ? (
              <img src={previewUrl} alt="待识别茶叶样本" />
            ) : (
              <><UploadCloud className="h-7 w-7" /><span>上传叶片图片</span></>
            )}
            <input className="sr-only" type="file" accept="image/png,image/jpeg,image/jpg" onChange={handleFileChange} />
          </label>
          <div className="command-pest__demos">
            <p>常见样本</p>
            <div>
              {leafDetectionDemos.map((demo) => (
                <button key={demo.pestType} type="button" onClick={() => chooseDemo(demo)} aria-label={`使用${demo.pestType}演示样本`}>
                  <img src={demo.imageUrl} alt="" />
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="command-pest__controls">
          <span><FileImage className="h-3.5 w-3.5" /> {fileName ?? '支持 PNG / JPG 图片'}</span>
          <button type="button" onClick={handleDetection} disabled={!previewUrl}><ScanSearch className="h-3.5 w-3.5" /> 开始识别</button>
        </div>
        <article className="command-pest__result">
          <img src={result?.imageUrl ?? previewUrl ?? leafDetectionDemos[0].imageUrl} alt="叶片识别结果" />
          <div>
            <div className="command-pest__result-title"><h3>{result?.pestType ?? '等待上传样本'}</h3><span>{result?.confidence ?? '--'}%</span></div>
            <p>{result?.summary ?? '上传样本后，将在这里展示叶片健康判断、风险类型和简要依据。'}</p>
            <small><AlertHint severity={result?.severity} /> {result?.suggestion ?? '识别完成后，将给出巡园复核和处理建议。'}</small>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="tea-card rounded-3xl p-5">
        <label className="flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-tea-mist to-white p-6 text-center transition hover:from-tea-spring/18 hover:to-white">
          {previewUrl ? (
            <img src={previewUrl} alt="待识别茶叶样本" className="h-56 w-full rounded-xl object-contain bg-white" />
          ) : (
            <>
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-tea-leaf shadow-sm">
                <UploadCloud className="h-8 w-8" />
              </span>
              <p className="mt-5 text-xl font-black text-tea-ink">上传茶叶叶片图片</p>
              <p className="mt-2 max-w-sm text-sm leading-6 text-tea-ink/60">支持茶树叶片、嫩梢或病斑局部照片，用于辅助判断叶片健康状态。</p>
            </>
          )}
          <input className="sr-only" type="file" accept="image/png,image/jpeg,image/jpg" onChange={handleFileChange} />
        </label>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex min-w-0 items-center gap-2 text-sm font-semibold text-tea-ink/62">
            <FileImage className="h-4 w-4 shrink-0" />
            <span className="truncate">{fileName ?? '支持 PNG / JPG 图片'}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowDemos((value) => !value)}
              className="inline-flex items-center gap-2 rounded-full border border-tea-leaf/18 bg-white px-5 py-3 text-sm font-bold text-tea-leaf transition hover:bg-tea-mist"
            >
              <Images className="h-4 w-4" />
              演示识别
            </button>
            <button
              type="button"
              onClick={handleDetection}
              disabled={!previewUrl}
              className="inline-flex items-center gap-2 rounded-full bg-tea-ink px-5 py-3 text-sm font-bold text-white transition hover:bg-tea-leaf disabled:cursor-not-allowed disabled:bg-tea-ink/28"
            >
              <ScanSearch className="h-4 w-4" />
              开始识别
            </button>
          </div>
        </div>

        {showDemos ? (
          <div className="mt-5 grid gap-3">
            {leafDetectionDemos.map((demo) => (
              <button
                key={demo.pestType}
                type="button"
                onClick={() => chooseDemo(demo)}
                className="tea-footer grid gap-3 rounded-2xl p-3 text-left transition hover:bg-tea-mist sm:grid-cols-[92px_1fr]"
              >
                <img src={demo.imageUrl} alt={demo.pestType} className="h-24 w-full rounded-xl bg-white object-contain" />
                <span>
                  <span className="block text-lg font-black text-tea-ink">{demo.pestType}</span>
                  <span className="mt-1 block text-sm font-semibold leading-6 text-tea-ink/62">{demo.summary}</span>
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="tea-card rounded-3xl p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-tea-leaf">识别结果</p>
            <h3 className="mt-2 text-2xl font-black text-tea-ink">{result?.pestType ?? '等待上传样本'}</h3>
          </div>
          <div className="rounded-2xl bg-tea-mist px-4 py-3 text-center">
            <div className="text-2xl font-black text-tea-leaf">{result?.confidence ?? '--'}%</div>
            <div className="text-xs font-bold text-tea-ink/54">置信度</div>
          </div>
        </div>

        <div className="mt-6 h-2 rounded-full bg-tea-mist">
          <div className="h-2 rounded-full bg-gradient-to-r from-tea-sky to-tea-leaf transition-all" style={{ width: confidenceWidth }} />
        </div>

        {result?.severity || result?.leafPart ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="tea-footer rounded-2xl p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-tea-leaf">风险等级</p>
              <p className="mt-2 text-lg font-black text-tea-ink">{result.severity}</p>
            </div>
            <div className="tea-footer rounded-2xl p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-tea-leaf">重点部位</p>
              <p className="mt-2 text-lg font-black text-tea-ink">{result.leafPart}</p>
            </div>
          </div>
        ) : null}

        <div className="mt-6 space-y-4">
          <div className="tea-footer rounded-2xl p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-tea-leaf">说明</p>
            <p className="mt-2 text-sm leading-6 text-tea-ink/70">
              {result?.summary ?? '上传样本后，将在这里展示叶片健康判断、风险类型和简要依据。'}
            </p>
          </div>

          {result?.analysisPoints?.length ? (
            <div className="tea-footer rounded-2xl p-4">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-tea-leaf">分析要点</p>
              <ul className="mt-3 grid gap-2">
                {result.analysisPoints.map((point) => (
                  <li key={point} className="flex gap-2 text-sm font-semibold leading-6 text-tea-ink/72">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-tea-leaf" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="tea-footer rounded-2xl p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-tea-leaf">建议处理方式</p>
            <p className="mt-2 text-sm leading-6 text-tea-ink/70">
              {result?.suggestion ?? '识别完成后，将给出巡园复核、通风排湿、隔离观察等处理建议。'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertHint({ severity }: { severity?: string }) {
  return <span>{severity ?? '演示结果'}</span>;
}
