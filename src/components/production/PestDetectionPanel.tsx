import { FileImage, ScanSearch, UploadCloud } from 'lucide-react';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { mockDetectionResult } from '../../data/mockData';
import type { PestDetectionResult } from '../../types/domain';

export function PestDetectionPanel() {
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [fileName, setFileName] = useState<string>();
  const [result, setResult] = useState<PestDetectionResult>();

  const confidenceWidth = useMemo(() => `${result?.confidence ?? 0}%`, [result]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
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

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="tea-card rounded-3xl p-5">
        <label className="flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-tea-mist to-white p-6 text-center transition hover:from-tea-spring/18 hover:to-white">
          {previewUrl ? (
            <img src={previewUrl} alt="待识别茶叶样本" className="h-56 w-full rounded-xl object-cover" />
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

        <div className="mt-6 space-y-4">
          <div className="tea-footer rounded-2xl p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-tea-leaf">说明</p>
            <p className="mt-2 text-sm leading-6 text-tea-ink/70">
              {result?.summary ?? '上传样本后，将在这里展示叶片健康判断、风险类型和简要依据。'}
            </p>
          </div>
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
