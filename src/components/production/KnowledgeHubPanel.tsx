import { BookOpenCheck, DatabaseZap, ExternalLink, FileSearch, Network, Sparkles } from 'lucide-react';
import { externalKnowledgeSources } from '../../data/mockData';
import type { ExternalKnowledgeSource } from '../../types/domain';

const sourceTypeLabel: Record<ExternalKnowledgeSource['sourceType'], string> = {
  official: '官方指导',
  research: '科研科普',
  extension: '农技推广',
};

const sourceTypeClass: Record<ExternalKnowledgeSource['sourceType'], string> = {
  official: 'bg-tea-leaf text-white',
  research: 'bg-tea-sky/18 text-tea-ink',
  extension: 'bg-tea-mist text-tea-leaf',
};

const knowledgePipeline = [
  {
    title: '资料索引',
    body: '先接入公开权威资料入口，形成茶园管理、植保、科普、加工等主题索引。',
    icon: FileSearch,
  },
  {
    title: '本地沉淀',
    body: '后续可把 PDF、图片、巡园记录和农技问答整理为本地 JSON 或 IndexedDB 知识片段。',
    icon: DatabaseZap,
  },
  {
    title: '智能问答',
    body: '成熟后再接 RAG 或多模态识别，把叶片图片、天气和传感器数据一起用于建议生成。',
    icon: Network,
  },
];

export function KnowledgeHubPanel() {
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <article className="tech-panel rounded-[2rem] p-6 sm:p-7">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 py-1 text-xs font-bold text-tea-spring">
          <BookOpenCheck className="h-4 w-4" />
          Knowledge Base
        </div>
        <h3 className="mt-5 text-3xl font-black text-white">外部农技知识库接入</h3>
        <p className="mt-4 text-sm leading-7 text-white/72">
          当前版本先把权威资料做成可访问、可替换的知识入口；真实上线时，可以把这些来源沉淀为可检索知识片段，
          再与叶片识别、天气预警、传感器数据联动。
        </p>

        <div className="mt-7 grid gap-3">
          {knowledgePipeline.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/8 p-4 text-white">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/12 text-tea-spring">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="text-lg font-black">{item.title}</p>
                </div>
                <p className="mt-3 text-sm font-semibold leading-6 text-white/68">{item.body}</p>
              </div>
            );
          })}
        </div>
      </article>

      <div className="grid gap-4 sm:grid-cols-2">
        {externalKnowledgeSources.map((source) => (
          <a
            key={source.id}
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="tea-card group flex min-h-[260px] flex-col rounded-[1.75rem] p-5 transition hover:-translate-y-1 hover:shadow-soft"
          >
            <div className="flex items-start justify-between gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-black ${sourceTypeClass[source.sourceType]}`}>
                {sourceTypeLabel[source.sourceType]}
              </span>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-tea-mist text-tea-leaf transition group-hover:bg-tea-leaf group-hover:text-white">
                <ExternalLink className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-5 text-sm font-black text-tea-leaf">{source.category}</p>
            <h4 className="mt-2 text-xl font-black leading-snug text-tea-ink">{source.title}</h4>
            <p className="mt-2 text-xs font-bold leading-5 text-tea-ink/48">{source.organization}</p>
            <p className="mt-4 flex-1 text-sm font-semibold leading-6 text-tea-ink/68">{source.summary}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {source.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-tea-ink/58 shadow-sm">
                  {tag}
                </span>
              ))}
            </div>
            <div className="tea-footer mt-5 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-black text-tea-ink/68">
              <Sparkles className="h-4 w-4 text-tea-leaf" />
              {source.updateHint}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
