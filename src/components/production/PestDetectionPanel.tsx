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

  function handleMockDetection() {
    setResult({ ...mockDetectionResult, imageUrl: previewUrl });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-3xl border border-dashed border-tea-leaf/28 bg-white p-5 shadow-sm">
        <label className="flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-2xl bg-tea-mist/70 p-6 text-center transition hover:bg-tea-mist">
          {previewUrl ? (
            <img src={previewUrl} alt="待识别茶叶样本" className="h-56 w-full rounded-xl object-cover" />
          ) : (
            <>
              <UploadCloud className="h-12 w-12 text-tea-leaf" />
              <p className="mt-4 text-lg font-black text-tea-ink">上传茶叶叶片图片</p>
              <p className="mt-2 max-w-sm text-sm leading-6 text-tea-ink/60">当前仅做本地预览和 mock 识别，后续可接入多模态模型与 RAG 知识库。</p>
            </>
          )}
          <input className="sr-only" type="file" accept="image/png,image/jpeg,image/jpg" onChange={handleFileChange} />
        </label>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-tea-ink/62">
            <FileImage className="h-4 w-4" />
            {fileName ?? '支持 PNG / JPG 占位'}
          </div>
          <button
            type="button"
            onClick={handleMockDetection}
            disabled={!previewUrl}
            className="inline-flex items-center gap-2 rounded-full bg-tea-ink px-5 py-3 text-sm font-bold text-white transition hover:bg-tea-leaf disabled:cursor-not-allowed disabled:bg-tea-ink/28"
          >
            <ScanSearch className="h-4 w-4" />
            mock 识别
          </button>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-tea-leaf">识别结果展示位</p>
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
          <div className="rounded-2xl bg-tea-mist/70 p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-tea-leaf">说明</p>
            <p className="mt-2 text-sm leading-6 text-tea-ink/70">{result?.summary ?? '后续展示病虫害类型、图片相似度、知识库依据和简要说明。'}</p>
          </div>
          <div className="rounded-2xl bg-[#fff7e6] p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-tea-clay">建议处理方式</p>
            <p className="mt-2 text-sm leading-6 text-tea-ink/70">{result?.suggestion ?? '后续展示农技建议、处置优先级和联系农技人员入口。'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
